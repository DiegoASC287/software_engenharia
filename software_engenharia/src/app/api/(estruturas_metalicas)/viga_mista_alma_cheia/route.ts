import { ArrayCasoRg, ArrayCasoRp, classe_concreto, ConectoresCisalhamento } from "@/funcoes_coeficientes/viga_mista_alma_cheia/coefs_tipagens";
import { calcular_qrd_conectores, ec, fck } from "@/funcoes_coeficientes/viga_mista_alma_cheia/resultados_parciais";
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

const SchemaDimVigaMista = z.object({
    classe_concreto: z.enum(classe_concreto),
    props_conectores: SchemaConector
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✔ validação com Zod
        const dados = SchemaDimVigaMista.safeParse(body);

        // ✔ cria o modelo
        if(dados.success){

            const {data} = dados;
    
            // ✔ executa o cálculo
            const resultado = calcular_qrd_conectores({
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
    
            return NextResponse.json({
                ok: true,
                resultado
            });
        }else{
             return NextResponse.json({ error: dados.error.issues.map(e => ({ message: e.message, path: e.path.join('.') }))}, { status: 400 });
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