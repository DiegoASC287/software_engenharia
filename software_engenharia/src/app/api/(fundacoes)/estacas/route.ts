import { fatoresCorrecaoAoki, ParamsTipoSoloAoki, TipoDeSolo, TipoEstaca } from "@/funcoes_coeficientes/fundacoes/dimensionamento_estacas";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const PropsEntradaEstaca = z.object({
    spt: z.array(z.object({
        nspt: z.number().min(0),
        tipo_solo: z.enum(TipoDeSolo)
    })),
    Nsd: z.number().min(0),
    prof_apoio: z.number().min(0),
    diametro: z.number().min(0),
    tipo_estaca: z.enum(TipoEstaca)
})

interface ResultadoCalculoEstaca {
    Qs: number;
    Qp: number;
    Qacum: number;
    profundidade: number;
}

type IPropsEntradaEstaca = z.infer<typeof PropsEntradaEstaca>;

function calcCapAokiVelloso({Nsd, diametro, tipo_estaca, 
    spt, prof_apoio}: IPropsEntradaEstaca): ResultadoCalculoEstaca[] {
    
    const {F1, F2} = fatoresCorrecaoAoki(tipo_estaca, diametro);
    // Cálculo da capacidade de carga da estaca segundo Aoki & Velloso (1975)
    const resistecia: ResultadoCalculoEstaca[] = []
    let profundidade_atual = 0;
    while (profundidade_atual < prof_apoio) {
        const nspt_cur = spt.find((_, i) => i+1 === profundidade_atual);
        const {K, alfa} = ParamsTipoSoloAoki(nspt_cur?.tipo_solo ?? TipoDeSolo.ARGILA);
        const qs_cur = alfa*K*(nspt_cur?.nspt ?? 0)*Math.PI*diametro/F2;
        let Qp_cur = 0;
        const q_acum = resistecia.reduce((acc, cur) => acc + cur.Qs+cur.Qp, 0) 
        if(profundidade_atual === prof_apoio || q_acum + qs_cur >= Nsd){
            Qp_cur = K*(nspt_cur?.nspt ?? 0)*Math.PI*(diametro**2)/(4*F1);
        }
        const qtot = q_acum+ qs_cur+Qp_cur;
        
        resistecia.push({Qs: qs_cur, Qp: Qp_cur, Qacum: qtot, profundidade: profundidade_atual});
        if(resistecia.slice(-1)[0].Qacum >= Nsd){
            return resistecia;
        }
        profundidade_atual += 1;
    }
    return resistecia;
}
export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        console.log("Corpo da requisição recebido:", body);
        const resultado = PropsEntradaEstaca.safeParse(body);
        if(!resultado.success){
            return NextResponse.json({ error: resultado.error.issues.map(e => ({ message: e.message, path: e.path.join('.') }))}, { status: 400 });
        }
        
        const { spt, Nsd, diametro, tipo_estaca, prof_apoio } = resultado.data;

        const resultados = calcCapAokiVelloso({ spt, Nsd, diametro, tipo_estaca, prof_apoio });

        return NextResponse.json({ resultados });

    } catch (error) {
        console.error("Erro ao processar a requisição:", error);
        return NextResponse.json({ error: "Dados de entrada inválidos" }, { status: 400 });
    }

}