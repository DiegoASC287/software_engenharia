
import { NextRequest, NextResponse } from "next/server"
import z from "zod"
import { calc_props_secao_ii, calc_sigma_c, calc_sigma_s, classe_aco, classe_concreto, diametros_comerciais, props_conc, props_steel, sel_as, sel_delta_fsd } from "../coeficientes"
const props_secao = z.object({
    bw: z.coerce.number(),
    h: z.coerce.number(),
    cobrimento: z.coerce.number()

})

const props_concreto = z.object({
    classe_concreto: z.enum(classe_concreto),
    gama_c: z.coerce.number(),
})

const arranjo_aco = z.object({
    diametro: z.enum(diametros_comerciais),
    quantidade_barras: z.coerce.number().int()
})
export const tipo_combinacao = ["ELU", "ELS", "FADIGA"] as const
export type TipoCombinacao = typeof tipo_combinacao[number]
const combinacoes_esforcos = z.object({
    tipo: z.enum(tipo_combinacao),
    nsd: z.coerce.number(),
    vsd: z.coerce.number(),
    msd: z.coerce.number(),
    tsd: z.coerce.number()
})

const props_aco = z.object({
    classe_aco_long: z.enum(classe_aco),
    gama_a1: z.coerce.number(),
    fi_asw: z.coerce.number(),
    classe_aco_transv: z.enum(classe_aco),
    arranjo_arm_pos: z.array(arranjo_aco).min(1),
    arranjo_arm_neg: z.array(arranjo_aco).min(1)
})
const SchemaEntrada = z.object({
    props_secao,
    props_aco,
    props_concreto,
    combinacoes_esforcos: z.array(combinacoes_esforcos)
})

export type ISchemaPropsSecao = z.infer<typeof props_secao>;
export type ISchemaPropsConcreto = z.infer<typeof props_concreto>;
export type ISchemaPropsAco = z.infer<typeof props_aco>;
export type ISchemaEntrada = z.infer<typeof SchemaEntrada>;

export async function POST(req: NextRequest) {
    const body: ISchemaEntrada = await req.json();

    const dados = SchemaEntrada.safeParse(body);

    if (dados.success) {
        const gama_c = body.props_concreto.gama_c
        const results: Record<string, any> = {}
        const { fyk, Es } = props_steel(body.props_aco.classe_aco_long)
        const { fyk: fykw, Es: Esw } = props_steel(body.props_aco.classe_aco_long)
        const { fck, Ec } = props_conc(body.props_concreto.classe_concreto)
        const d = body.props_secao.h - (body.props_secao.cobrimento + body.props_aco.fi_asw / 10 + 0.5)
        const d_linha = body.props_secao.h - d
        const fc = 0.85 * fck / 10
        const bw = body.props_secao.bw
        const fyd = (fyk / 10) / body.props_aco.gama_a1
        const alfa_e = Es / Ec
        const as = body.props_aco.arranjo_arm_pos.
            reduce((as_ant, as_cur) => (as_ant + sel_as[as_cur.diametro].as * as_cur.quantidade_barras), 0)
        const as_linha = body.props_aco.arranjo_arm_neg.
            reduce((as_ant, as_cur) => (as_ant + sel_as[as_cur.diametro].as * as_cur.quantidade_barras), 0)
        const { xii, Iii } = calc_props_secao_ii({ alfa_e, as, as_linha, bw, d, d_linha })
        const combs_fadiga = body.combinacoes_esforcos.filter(comb => comb.tipo === "FADIGA")

        //verificação à fadiga da armação
        if (combs_fadiga.length > 0) {
            const momentos_positivos = combs_fadiga.filter(e => e.msd > 0)
            const momentos_negativos = combs_fadiga.filter(e => e.msd < 0)
            const resultados_fadiga_aco_pos = momentos_positivos.map(combinacao_fadiga => {
                const msd = Math.abs(combinacao_fadiga.msd)
                return calc_sigma_s({ alfa_e, d, Iii, msd, xii })
            })

            const resultados_fadiga_aco_neg = momentos_negativos.map(combinacao_fadiga => {
                const msd = Math.abs(combinacao_fadiga.msd)
                return calc_sigma_s({ alfa_e, d, Iii, msd, xii })
            })
            const maior_momento_pos = Math.max(...momentos_positivos.map(m => Math.abs(m.msd)))
            const menor_momento_pos = Math.min(...momentos_positivos.map(m => Math.abs(m.msd)))
            const maior_momento_neg = Math.max(...momentos_negativos.map(m => Math.abs(m.msd)))
            const menor_momento_neg = Math.min(...momentos_negativos.map(m => Math.abs(m.msd)))
            const fcd_fad = 0.45 * fck / (gama_c * 10) //kN/cm²

            if (maior_momento_neg - menor_momento_neg > 0) {
                const sigma_c_min = calc_sigma_c({msd: menor_momento_neg, Iii, xii})
                const sigma_c_max = calc_sigma_c({msd: maior_momento_neg, Iii, xii})
                const ni_c = Math.max(sigma_c_min.ni_c, sigma_c_max.ni_c)
                
                const solicitacao = ni_c * sigma_c_max.sigma_c_max
                results["verficacao_fadiga_concreto"] = {
                    ...results["verficacao_fadiga_concreto"],
                    ni_c_neg:ni_c, sigma_c_min_neg:sigma_c_min.sigma_c_min, sigma_c_max_neg:sigma_c_max.sigma_c_max, tensao_fadiga_solicitante_neg: solicitacao, fcd_fad_neg: fcd_fad,    
                    verificacao_neg: solicitacao <= fcd_fad ? "OK" : "Falha"
                }
                //gama_f nao adicionado por que é combinação frequente
            }
            if (maior_momento_pos - menor_momento_pos > 0) {
                const sigma_c_min = calc_sigma_c({msd: menor_momento_pos, Iii, xii})
                const sigma_c_max = calc_sigma_c({msd: maior_momento_pos, Iii, xii})
                const ni_c = Math.max(sigma_c_min.ni_c, sigma_c_max.ni_c)
                
                const solicitacao = ni_c * sigma_c_max.sigma_c_max
                results["verficacao_fadiga_concreto"] = {
                    ...results["verficacao_fadiga_concreto"],
                    ni_c_pos:ni_c, sigma_c_min_pos:sigma_c_min.sigma_c_min, sigma_c_max_pos:sigma_c_max.sigma_c_max, tensao_fadiga_solicitante_pos: solicitacao, fcd_fad_pos: fcd_fad,    
                    verificacao_pos: solicitacao <= fcd_fad ? "OK" : "Falha"
                }
                //gama_f nao adicionado por que é combinação frequente

            }

            const delta_sigma_pos = Math.abs(Math.max(...resultados_fadiga_aco_pos) - Math.min(...resultados_fadiga_aco_pos))
            const delta_sigma_neg = Math.abs(Math.max(...resultados_fadiga_aco_neg) - Math.min(...resultados_fadiga_aco_neg))
            const var_tensao_arm_pos = Math.min(...body.props_aco.arranjo_arm_pos.map(arranjo => {
                console.log(arranjo)
                console.log("Teste", sel_delta_fsd(arranjo.diametro, body.props_aco.classe_aco_long))
                return sel_delta_fsd(arranjo.diametro, body.props_aco.classe_aco_long) ?? 0
            }))
            const var_tensao_arm_neg = Math.min(...body.props_aco.arranjo_arm_neg.map(arranjo => {
                return sel_delta_fsd(arranjo.diametro, body.props_aco.classe_aco_long) ?? 0
            }))

            results["verficacao_fadiga_aco"] = {
                delta_sigma_pos,
                var_tensao_arm_pos,
                resultado_arm_pos: var_tensao_arm_pos > delta_sigma_pos ? "Ok" : "Falha",
                delta_sigma_neg, var_tensao_arm_neg,
                resultado_arm_neg: var_tensao_arm_neg > delta_sigma_neg ? "Ok" : "Falha",

            }
        }


        const resultados_as = body.combinacoes_esforcos.filter(e => e.tipo === "ELU").map(combinacao_esforcos => {
            const msd = Math.abs(combinacao_esforcos.msd * 100)
            const k = msd / (fc * bw * d ** 2)
            const alfa = (1 - Math.sqrt(1 - 2 * k))
            const y = alfa * d
            let as_nec = 0
            let as_linha_nec = 0
            if (combinacao_esforcos.msd > 0) {
                as_nec = fc * bw / fyd * y
            } else {
                as_linha_nec = fc * bw / fyd * y
            }

            return { k, as_nec, as_linha_nec, y, d, fyd, bw, fc, xii, Iii }
        })
        return NextResponse.json({ results, resultados_as });
    } else {
        return NextResponse.json({ error: dados.error.issues.map(e => ({ message: e.message, path: e.path.join('.') })) }, { status: 400 });
    }
}