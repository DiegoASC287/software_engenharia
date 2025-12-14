import { NextResponse } from "next/server";
import PerfilW, { PerfilWEntradaSchema } from "@/classes/estrutura_metalica/perfilW";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✔ validação com Zod
        const dados = PerfilWEntradaSchema.safeParse(body);

        // ✔ cria o modelo
        if(dados.success){

            const perfilObj = new PerfilW(
                dados.data.topo_livre,
                dados.data.esforcos,
                dados.data.gama_a1,
                dados.data.modulo_e,
                dados.data.fyk,
                dados.data.fu,
                dados.data.aplicacao_perfil,
                dados.data.lx,
                dados.data.ly,
                dados.data.lz,
                dados.data.kx,
                dados.data.ky,
                dados.data.props_perfil,
                dados.data.descricao_el
            );
    
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
