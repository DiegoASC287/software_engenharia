import { dimensionarBloco2EstacasComMomento, EntradaBloco } from "@/funcoes_coeficientes/fundacoes/dimensionamento_bloco";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const EntradaBlocoSchema = z.object({
    Nd: z.coerce.number().positive("Nd deve ser positivo"),
    Md: z.coerce.number(), // pode ser positivo ou negativo
    espacamentoEstacas: z.coerce.number().positive("Espaçamento deve ser > 0"),
    d: z.coerce.number().positive("Altura útil d deve ser > 0"),
    fck: z.coerce.number().positive("fck deve ser > 0"),
    fyk: z.coerce.number().positive("fyk deve ser > 0"),


    pilarBx: z.coerce.number().positive("Dimensão do pilar deve ser > 0"),
    pilarBy: z.coerce.number().positive("Dimensão do pilar deve ser > 0"),


    gammaC: z.coerce.number().positive().optional().default(1.4),
    gammaS: z.coerce.number().positive().optional().default(1.15),
});


export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as EntradaBloco;


        const camposObrigatorios = [
            body.Nd,
            body.Md,
            body.espacamentoEstacas,
            body.d,
            body.pilarBx,
            body.pilarBy,
        ];
        console.log(req.body)
        const dados = EntradaBlocoSchema.safeParse(body)

        if (!dados.success) {
            return NextResponse.json({ error: dados.error.issues.map(e => ({ message: e.message, path: e.path.join('.') })) }, { status: 400 });
        }


        const resultado = dimensionarBloco2EstacasComMomento(body);
        return NextResponse.json(resultado, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { erro: "Erro no processamento", detalhe: String(error) },
            { status: 500 }
        );
    }
}