
import { NextRequest, NextResponse } from "next/server"
import z from "zod"
import { classe_concreto, diametros_comerciais } from "../coeficientes"
import { fck } from "@/funcoes_coeficientes/viga_mista_alma_cheia/resultados_parciais"
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
    fyk: z.coerce.number(),
    gama_a1: z.coerce.number(),
    fi_asw: z.coerce.number(),
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
        const fck_conc = fck(body.props_concreto.classe_concreto)
        let as = 0
        const d = body.props_secao.h-(body.props_secao.cobrimento+body.props_aco.fi_asw/10 + 0.5)
        const fc = 0.85*fck_conc/10
        const bw = body.props_secao.bw
        const fyd = (body.props_aco.fyk/10)/body.props_aco.gama_a1
        const resultados_as = body.combinacoes_esforcos.filter(e => e.tipo === "ELU").map(combinacao_esforcos => {
            
            const k = combinacao_esforcos.msd*100/(fc*bw*d**2)
            const alfa = (1-Math.sqrt(1-2*k))
            const y = alfa*d
            const as_cur = fc*bw/fyd*y
            return {k, as_cur, y, d, fyd, bw, fc}
        })
        return NextResponse.json({ resultados_as });
    } else {
        return NextResponse.json({ error: dados.error.issues.map(e => ({ message: e.message, path: e.path.join('.') })) }, { status: 400 });
    }
}