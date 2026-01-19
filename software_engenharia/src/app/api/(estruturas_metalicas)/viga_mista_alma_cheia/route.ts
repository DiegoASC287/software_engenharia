import { ArrayCasoRg, ArrayCasoRp, CasoRg, CasoRp, classe_concreto, ConectoresCisalhamento, tipo_aco, tipo_construcao, TipoConectorCisalhamento } from "@/funcoes_coeficientes/viga_mista_alma_cheia/coefs_tipagens";
import { calc_a_int_parc, calc_cad_int_parc, calc_ccd_int_completa, calc_ccd_int_parc, calc_lambda_p, calc_lambda_r, calc_ni_inferiores, calc_tad_int_parc, calc_vrd_secao_compacta, calc_vrd_secao_esbelta, calc_vrd_secao_muito_esbelta, calc_yp_int_parc, calc_yt_yc, calcular_qrd_conectores, ec, fck, fhd, props_mec_aco } from "@/funcoes_coeficientes/viga_mista_alma_cheia/resultados_parciais";
import { NextResponse } from "next/server";
import z from "zod";


const SchemaConector = z.object({
    fucs: z.coerce.number().positive("fucs deve ser positivo"),
    gama_cs: z.coerce.number().positive("gama_cs deve ser positivo"),
    conector: z.enum(ConectoresCisalhamento),
    casos: z.array(z.object({
        caso_rg: z.enum(ArrayCasoRg),
        caso_rp: z.enum(ArrayCasoRp),
        quantidade: z.coerce.number().int().positive("quantidade deve ser inteiro positivo")
    }))
})
const SchemaPropsSecao = z.object({
    bf_inf: z.coerce.number().positive("bf_inf deve ser positivo"),
    tf_inf: z.coerce.number().positive("tf_inf deve ser positivo"),
    bf_sup: z.coerce.number().positive("bf_sup deve ser positivo"),
    tf_sup: z.coerce.number().positive("tf_sup deve ser positivo"),
    h: z.coerce.number().positive("h_w deve ser positivo"),
    tw: z.coerce.number().positive("tw deve ser positivo"),
    b: z.coerce.number().positive("b deve ser positivo"),
    hf: z.coerce.number().positive("hf deve ser positivo"),
    tc: z.coerce.number().positive("tc deve ser positivo"),
})

export type ISchemaPropsSecao = z.infer<typeof SchemaPropsSecao>;

const props_geom_viga = z.object({
    comprimento_viga: z.coerce.number().positive("comprimento_viga deve ser positivo"),
    comp_destravado: z.coerce.number().positive("comp_destravado deve ser positivo"),
})

const SchemaPropsEnrijecedores = z.object({
    altura_enrijecedor: z.coerce.number().positive("altura_enrijecedor deve ser positivo"),
    largura_enrijecedor: z.coerce.number().positive("largura_enrijecedor deve ser positivo"),
    espessura_enrijecedor: z.coerce.number().positive("espessura_enrijecedor deve ser positivo"),
    espacamento_enrijecedor: z.coerce.number().positive("espacamento_enrijecedor deve ser positivo"),
})

const SchemaSolicitacoes = z.object({
    Msd: z.coerce.number().nonnegative("Msd deve ser não negativo"),
    Vsd: z.coerce.number().nonnegative("Vsd deve ser não negativo"),
})
const SchemaDimVigaMista = z.object({
    classe_concreto: z.enum(classe_concreto),
    props_conectores: SchemaConector,
    classe_aco: z.enum(tipo_aco),
    secao: SchemaPropsSecao,
    props_geom_viga,
    tipo_construcao: z.enum(tipo_construcao),
    solicitacoes: SchemaSolicitacoes,
    gama_i: z.coerce.number().positive("gama_i deve ser positivo"),
    gama_c: z.coerce.number().positive("gama_c deve ser positivo"),
    enrijecida: z.boolean(),
    props_enrijecedores: SchemaPropsEnrijecedores.optional(),
});

export type ISchemaDimVigaMista = z.infer<typeof SchemaDimVigaMista>;
interface CasosConectores {
    caso_rg: "A" | "B" | "C" | "D";
    rg: number;
    caso_rp: "A" | "B" | "C";
    rp: number;
    quantidade: number;
    qrd_conc: number;
    acs: number;
    fck: number;
    ec: number;
    fucs: number;
    qrd_conector: number;
    resistencia_utilizada: number;
}
type TipoInteracao = "INTERAÇÃO PARCIAL" | "INTERAÇÃO COMPLETA" | "SEM INTERACAO" | "NAO CALCULADO"

interface ResultConectores {
    resistencia_total: number;
    grau_interacao: TipoInteracao
    ni: number
    ni_min: number
    conector: TipoConectorCisalhamento
    gama_cs: number;
    fucs: number
    casos: CasosConectores[];
}

interface ResultFlexao {

    compressao_conc_ccd: number
    compressao_aco_cad: number
    tracao_aco_tad: number
    pos_ln_yp: number
    pos_ln_comp_aco_yc: number
    pos_ln_trac_aco_yt: number
    pos_ln_conc_a: number
    mrd: number
}

interface ResultCisalhamento {
    lambda: number
    lambda_p: number
    lambda_r: number
    espacamento_enrijecedores: number
    vpl: number
    vrd: number

}

export interface ModeloRetornoDados {
    dados_entrada: ISchemaDimVigaMista
    resultados_conectores: ResultConectores
    resultados_flexao: ResultFlexao
    resultados_cisalhamento: ResultCisalhamento
    interacao: TipoInteracao
    esbeltez_secao: "COMPACTA" | "MEDIANAMENTE ESBELTA" | "MUITO ESBELTA"
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✔ validação com Zod
        const dados = SchemaDimVigaMista.safeParse(body);

        // ✔ cria o modelo
        if (dados.success) {

            const { data } = dados;
            const dados_aco = props_mec_aco(data.classe_aco);
            const d = data.secao.tf_sup + data.secao.h + data.secao.tf_inf;
            // ✔ executa o cálculo

            const resultados_qrd = calcular_qrd_conectores({
                fck: fck(data.classe_concreto),
                fucs: data.props_conectores.fucs,
                EC: ec(data.classe_concreto),
                gama_cs: data.props_conectores.gama_cs,
                conector: data.props_conectores.conector,
                casos: data.props_conectores.casos.map(caso => ({
                    caso_rg: caso.caso_rg,
                    caso_rp: caso.caso_rp,
                    quantidade: caso.quantidade
                }))
            })
            const res_qrd: ResultConectores = {
                ...resultados_qrd, grau_interacao: 'NAO CALCULADO', ni: 0, ni_min: 0,
                fucs: data.props_conectores.fucs, gama_cs: data.props_conectores.gama_cs,
                conector: data.props_conectores.conector,

            }

            const h_sobre_tw = data.secao.h / data.secao.tw
            let interacao: "INTERAÇÃO PARCIAL" | "INTERAÇÃO COMPLETA" | "NAO CALCULADO"
            let esbeltez_secao: "COMPACTA" | "MEDIANAMENTE ESBELTA" | "MUITO ESBELTA"


            if (h_sobre_tw > 3.76 * Math.sqrt(dados_aco.Es / dados_aco.fyk)) {
                return NextResponse.json({ error: "Relação h/t > r3,76*raiz(E/fy)" }, { status: 400 });
            }
            let result_vrd: { vpl: number, vrd: number }
            const result_flexao: ResultFlexao = {
                compressao_aco_cad: 0,
                compressao_conc_ccd: 0,
                mrd: 0,
                pos_ln_comp_aco_yc: 0,
                pos_ln_conc_a: 0,
                pos_ln_yp: 0,
                tracao_aco_tad: 0,
                pos_ln_trac_aco_yt: 0

            }
            interacao = "NAO CALCULADO"
            esbeltez_secao = "COMPACTA"

            const props_ni_inferiores = calc_ni_inferiores({
                props_ni_zero: {
                    E: dados_aco.Es, fyk: dados_aco.fyk, le: data.props_geom_viga.comprimento_viga, props_mesas: {
                        bf_inf: data.secao.bf_inf,
                        tf_inf: data.secao.tf_inf,
                        bf_sup: data.secao.bf_sup,
                        tf_sup: data.secao.tf_sup
                    }
                },
                props_cp: { tipo_construcao: data.tipo_construcao },
                props_cr: {
                    Mrd: 0, // TODO: calcular Mrd
                    Msd: data.solicitacoes.Msd

                }
            })
            const res_fhd = fhd(data.secao, dados_aco.fyk, data.gama_i, fck(data.classe_concreto), data.gama_c);
            const ni_i = resultados_qrd.resistencia_total / res_fhd;
            res_qrd["ni"] = ni_i
            res_qrd["ni_min"] = Math.max(props_ni_inferiores.ni_min, props_ni_inferiores.ni_cp2crn0)
            if (ni_i >= 1) {
                interacao = "INTERAÇÃO COMPLETA"
                res_qrd["grau_interacao"] = "INTERAÇÃO COMPLETA"
                console.log("Interação completa");
                const res_ccd = calc_ccd_int_completa(fck(data.classe_concreto), data.gama_c, data.secao.b, data.secao.tc);
                const res_cad = calc_cad_int_parc({ props_secao: data.secao, fyk: dados_aco.fyk, gama_i: data.gama_i, ccd: res_ccd });
                const res_tad = calc_tad_int_parc(res_ccd, res_cad);
                const yp = calc_yp_int_parc({ cad: res_cad, fyk: dados_aco.fyk, props_secao: data.secao, gama_i: data.gama_i });
                const yt_yc = calc_yt_yc({ props_secao: data.secao, yp });
                const a = calc_a_int_parc(res_ccd, fck(data.classe_concreto), data.gama_c, data.secao);
                const yt = yt_yc.yt;
                const yc = yt_yc.yc;
                const mrd = 1 * (resultados_qrd.resistencia_total * (d - yt - yc) / 1000 + res_ccd * (data.secao.tc / 2 + data.secao.hf + d - yt) / 1000);
                console.log("Esforço resistente nos conectores (qrd): ", resultados_qrd.resistencia_total);
                console.log("Esforço solicitante no concreto (ccd): ", res_ccd);
                console.log("Esforço solicitante de compressão no aço (cad): ", res_cad);
                console.log("Esforço solicitante de tração no aço (cad): ", res_tad);
                console.log("Posição da linha neutra a partir do topo do perfil metálico (yp): ", yp);
                console.log("Posição da linha de influencia da força de compressão do aço (yc): ", yc);
                console.log("Posição da linha de influencia da força de tração do aço (d-yt): ", d - yt);
                console.log("Posição da linha neutra no concreto (a): ", a);
                console.log("Momento resistente da seção (Mrd): ", mrd);

            } else if (ni_i < 1 && ni_i >= Math.max(props_ni_inferiores.ni_min, props_ni_inferiores.ni_cp2crn0)) {
                console.log("Interação parcial");
                res_qrd["grau_interacao"] = "INTERAÇÃO PARCIAL"
                interacao = "INTERAÇÃO PARCIAL"
                const res_ccd = calc_ccd_int_parc(resultados_qrd.resistencia_total);
                const res_cad = calc_cad_int_parc({ props_secao: data.secao, fyk: dados_aco.fyk, gama_i: data.gama_i, ccd: res_ccd });
                const res_tad = calc_tad_int_parc(res_ccd, res_cad);
                const yp = calc_yp_int_parc({ cad: res_cad, fyk: dados_aco.fyk, props_secao: data.secao, gama_i: data.gama_i });
                const yt_yc = calc_yt_yc({ props_secao: data.secao, yp });
                const a = calc_a_int_parc(res_ccd, fck(data.classe_concreto), data.gama_c, data.secao);
                const yt = yt_yc.yt;
                const yc = yt_yc.yc;
                const mrd = 1 * (res_cad * (d - yt - yc) / 1000 + res_ccd * (data.secao.tc - a / 2 + data.secao.hf + d - yt) / 1000);
                result_flexao["compressao_conc_ccd"] = res_ccd
                result_flexao["compressao_aco_cad"] = res_cad
                result_flexao["tracao_aco_tad"] = res_tad
                result_flexao["pos_ln_yp"] = yp
                result_flexao["pos_ln_trac_aco_yt"] = d - yt
                result_flexao["pos_ln_comp_aco_yc"] = yc
                result_flexao["pos_ln_conc_a"] = a
                result_flexao["mrd"] = mrd
                res_qrd["ni"] = ni_i
                res_qrd["ni_min"] = Math.max(props_ni_inferiores.ni_min, props_ni_inferiores.ni_cp2crn0)

            } else {
                console.log("Interação insuficiente");
                res_qrd["grau_interacao"] = "SEM INTERACAO"
            }

            const lambda_p = calc_lambda_p({
                enrijecida: data.enrijecida,
                espacamento_enrijs: data.enrijecida ? data.props_enrijecedores?.espacamento_enrijecedor ?? data.props_geom_viga.comprimento_viga * 1000 :
                    data.props_geom_viga.comprimento_viga * 1000,
                hw: data.secao.h,

            },
                dados_aco.Es,
                dados_aco.fyk
            );
            const lambda_r = calc_lambda_r({
                enrijecida: data.enrijecida,
                espacamento_enrijs: data.enrijecida ? data.props_enrijecedores?.espacamento_enrijecedor ?? data.props_geom_viga.comprimento_viga * 1000 :
                    data.props_geom_viga.comprimento_viga * 1000,
                hw: data.secao.h,

            },
                dados_aco.Es,
                dados_aco.fyk)

            const lambda = data.secao.h / data.secao.tw;
            console.log("Lambda: ", lambda);
            if (lambda <= lambda_p) {

                result_vrd = calc_vrd_secao_compacta(data.secao, dados_aco.fyk, data.gama_i);
            } else if (lambda > lambda_p && lambda < lambda_r) {
                result_vrd = calc_vrd_secao_esbelta({ props_secao: data.secao, fyk: dados_aco.fyk, gama_i: data.gama_i, lambda_p });
            } else if (lambda >= lambda_r) {
                result_vrd = calc_vrd_secao_muito_esbelta({ props_secao: data.secao, fyk: dados_aco.fyk, gama_i: data.gama_i, lambda_p })
            } else {
                result_vrd = { vpl: 0, vrd: 0 };
            }


            const resultados: ModeloRetornoDados = {
                dados_entrada: data,
                resultados_conectores: res_qrd,
                esbeltez_secao,
                interacao,
                resultados_cisalhamento: {
                    espacamento_enrijecedores: data.props_enrijecedores?.espacamento_enrijecedor ?? Infinity,
                    lambda,
                    lambda_p,
                    lambda_r,
                    vpl: result_vrd.vpl,
                    vrd: result_vrd.vrd
                },
                resultados_flexao: result_flexao,
            }

            return NextResponse.json({ resultados });


        } else {
            return NextResponse.json({ error: dados.error.issues.map(e => ({ message: e.message, path: e.path.join('.') })) }, { status: 400 });
        }

    } catch (err: any) {

        // ✔ erros de validação do Zod
        if (err) {

        }

        // ✔ erro inesperado
        return NextResponse.json({
            ok: false,
            erro: "Erro interno no servidor",
            detalhes: err.message
        }, { status: 500 });
    }
}