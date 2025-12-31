import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✔ validação com Zod
        const dados = PerfilWEntradaSchema.safeParse(body);

        // ✔ cria o modelo
        if(dados.success){

            
    
            // ✔ executa o cálculo
            const resultado = perfilObj.verificar_perfil();
    
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