import { TipoDeSolo, TipoEstaca } from "@/funcoes_coeficientes/fundacoes/dimensionamento_estacas";
import z from "zod";
const PropsEntradaEstaca = z.object({
    spt: z.array(z.object({
        profundidade: z.number().min(0),
        nspt: z.number().min(0),
    })),
    Nsd: z.number().min(0),
    diametro: z.number().min(0),
    tipo_solo: z.enum(TipoDeSolo),
    tipo_estaca: z.enum(TipoEstaca)
})


export function POST(){
    const body = z.object({
        profundidade: z.number().min(0),
        nspt: z.number().min(0),
    });

    return Response.json({message: "Hello World!"});
}