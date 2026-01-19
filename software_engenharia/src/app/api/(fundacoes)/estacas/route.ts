import { BuscarFatorGrupo, calc_s, calcVrd2, fatoresCorrecaoAoki, ParamsTipoSoloAoki, RetornarValorKhEKv, TipoDeSolo, TipoEstaca } from "@/funcoes_coeficientes/fundacoes/dimensionamento_estacas";
import { classe_concreto, sel_gama_c, select_gama_c } from "@/funcoes_coeficientes/viga_mista_alma_cheia/coefs_tipagens";
import { fck } from "@/funcoes_coeficientes/viga_mista_alma_cheia/resultados_parciais";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const PropsEntradaEstaca = z.object({
    spt: z.array(z.object({
        nspt: z.coerce.number().min(0),
        tipo_solo: z.enum(TipoDeSolo),
        submerso: z.boolean(),
    })),
    classe_concreto: z.enum(classe_concreto),
    Nsd: z.coerce.number(),
    diametro_arm_transv: z.coerce.number(),
    diametro_arm_long: z.coerce.number(),
    prof_apoio: z.coerce.number().min(0),
    diametro: z.coerce.number().min(0),
    cobrimento: z.coerce.number().nonnegative(),
    espacamento: z.coerce.number(),
    tipo_estaca: z.enum(TipoEstaca),
    fl: z.coerce.number().min(1),
    fp: z.coerce.number().min(1),
    cota_topo_estaca: z.coerce.number(),
    fykw: z.coerce.number(),
    gama_i: z.coerce.number(),
    vsd: z.coerce.number()
})

interface ResultadoCalculoEstaca {
    Qs: number;
    Qp: number;
    Qacum: number;
    Qrd: number;
    Nsd: number;
    Nsd_pp: number;
    Nsd_tot: number;
    profundidade: number;
    tipo_solo: TipoDeSolo
    nspt: number
    K: number
    F1: number,
    F2: number,
    kh: number,
    kv: number
    eta_g_grupo: number
}

type IPropsEntradaEstaca = z.infer<typeof PropsEntradaEstaca>;

function calcCapAokiVelloso({ Nsd, diametro, tipo_estaca,
    spt, prof_apoio, fl, fp, espacamento, cota_topo_estaca, cobrimento,
    classe_concreto, diametro_arm_long, diametro_arm_transv, fykw, gama_i, vsd

}: IPropsEntradaEstaca): {resistencia: ResultadoCalculoEstaca[], espacamento_estribos: any} {
    const fator_reducao_grupo = BuscarFatorGrupo(espacamento, diametro, tipo_estaca)
    const { F1, F2 } = fatoresCorrecaoAoki(tipo_estaca, diametro);
    // Cálculo da capacidade de carga da estaca segundo Aoki & Velloso (1975)
    const resistecia: ResultadoCalculoEstaca[] = []
    const fck_conc = fck(classe_concreto)
    const gama_c = select_gama_c(tipo_estaca, fck_conc, false)
    const espacamento_estribos = calc_s({
        fyd: fykw/gama_i, cobrimento_estaca: cobrimento,
        diametro_arm_transv, diametro_barra_long: diametro_arm_long,
        diametro_estaca: diametro, fck:fck_conc, gama_c, vsd})
    
    let profundidade_atual = 1;
    while (profundidade_atual <= prof_apoio) {
        const cota_atual = cota_topo_estaca-profundidade_atual
        const nspt_cur = spt[profundidade_atual - 1];
        const { kh, kv } = RetornarValorKhEKv({ diametro_largura: diametro, ...nspt_cur, profundidade: profundidade_atual })
        const { K, alfa } = ParamsTipoSoloAoki(nspt_cur?.tipo_solo ?? TipoDeSolo.ARGILA);
        // console.log(`Profundidade: ${profundidade_atual} m, Tipo Solo: ${nspt_cur?.tipo_solo}, Nspt: ${nspt_cur?.nspt}, K: ${K}, alfa: ${alfa}, F1: ${F1}, F2: ${F2}`);
        const qs_cur = fator_reducao_grupo * (alfa / 100 * K * (nspt_cur?.nspt ?? 0) * Math.PI * diametro) / F2;
        let tensao_ponta_try = K * (nspt_cur?.nspt ?? 0) > 10000 ? 10000 : K * (nspt_cur?.nspt ?? 0)
        let Qp_cur_try = tensao_ponta_try * Math.PI * (diametro ** 2) / (4 * F1);
        let Qp_cur = 0;
        const Nsd_pp_cur = Math.PI * (diametro ** 2) / 4 * (profundidade_atual) * 25 * 1.4
        const Nsd_tot = Nsd + Nsd_pp_cur;
        const q_acum = resistecia.reduce((acc, cur) => acc + cur.Qs, 0)
        if (profundidade_atual === prof_apoio || ((q_acum + qs_cur) / fl + Qp_cur_try / fp >= Nsd_tot)) {
            Qp_cur = Qp_cur_try
        }

        const qtot = q_acum + qs_cur + Qp_cur;
        const qrd = (q_acum + qs_cur) / fl + Qp_cur / fp;

        const teste = {
            cota_atual,
            profundidade: profundidade_atual, tipo_solo: nspt_cur.tipo_solo, nspt: nspt_cur.nspt, F1, F2, K,
            Qs: qs_cur, Qp: Qp_cur, Qacum: qtot, Qrd: qrd, Nsd, Nsd_pp: Nsd_pp_cur, Nsd_tot, kh, kv,
            eta_g_grupo: fator_reducao_grupo
        }
        resistecia.push({...teste});
        if (resistecia.slice(-1)[0].Qrd > Nsd_tot) {
            return {resistencia: resistecia, espacamento_estribos};
        }
        profundidade_atual += 1;
    }
    return {resistencia: resistecia, espacamento_estribos};
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const resultado = PropsEntradaEstaca.safeParse(body);
        if (!resultado.success) {
            return NextResponse.json({ error: resultado.error.issues.map(e => ({ message: e.message, path: e.path.join('.') })) }, { status: 400 });
        }

        const { cobrimento, diametro_arm_long, diametro_arm_transv, 
            spt, Nsd, diametro, tipo_estaca, prof_apoio, fl, fp,
            espacamento, cota_topo_estaca, classe_concreto, fykw, gama_i,vsd } = resultado.data;

        const resultados = calcCapAokiVelloso({ 
            spt, Nsd, diametro, tipo_estaca,
            prof_apoio, fl, fp, espacamento,
            cota_topo_estaca, classe_concreto,
            cobrimento,
            diametro_arm_long,
            diametro_arm_transv,
            fykw,
            gama_i,
            vsd
        });

        return NextResponse.json({ resultados });

    } catch (error) {
        console.error("Erro ao processar a requisição:", error);
        return NextResponse.json({ error: "Dados de entrada inválidos" }, { status: 400 });
    }

}