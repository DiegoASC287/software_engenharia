import { ISchemaPropsSecao } from "@/app/api/(estruturas_metalicas)/viga_mista_alma_cheia/route";
import { CasoRg, CasoRp, ClasseConcreto, ConectorCisalhamento, CONECTORES_CISALHAMENTO, RG, RP, sel_alfa_i, sel_fck_concreto, sel_props_aco, sel_tipo_construcao, TipoAco, TipoConectorCisalhamento, TipoConstrucao } from "./coefs_tipagens";

export function select_conector(nome: TipoConectorCisalhamento): ConectorCisalhamento {
    const dados = CONECTORES_CISALHAMENTO[nome];

    return {
        nome,
        ...dados,
        a_fuste: Math.PI * (dados.diametro / 2) ** 2,
    };
}

export function rg(caso: CasoRg): number {
    return RG[caso].valor;
}
export function rp(caso: CasoRp): number {
    return RP[caso].valor;
}

export interface CasosQRD {
    caso_rg: CasoRg;
    caso_rp: CasoRp;
    quantidade: number;
}

interface EntradaCalcQRD {
    fck: number
    fucs: number
    EC: number
    gama_cs: number
    conector: TipoConectorCisalhamento
    casos: CasosQRD[];
}


export function calcular_qrd_conectores(entrada: EntradaCalcQRD) {
    const { a_fuste } = select_conector(entrada.conector);
    const resumo = {
        conector: entrada.conector, gama_cs: entrada.gama_cs, casos: entrada.casos.map(caso => {
            const rg_cur = rg(caso.caso_rg);
            const rp_cur = rp(caso.caso_rp);
            const qrd_conc = 1 / 2 * a_fuste * Math.sqrt(entrada.fck * entrada.EC) / (entrada.gama_cs * 1000)
            const qrd_conector = rg_cur * rp_cur * a_fuste * entrada.fucs / (entrada.gama_cs * 1000);
            return {
                caso_rg: caso.caso_rg,
                rg: rg_cur,
                caso_rp: caso.caso_rp,
                rp: rp_cur,
                quantidade: caso.quantidade,
                qrd_conc: qrd_conc * caso.quantidade,
                acs: a_fuste,
                fck: entrada.fck,
                ec: entrada.EC,
                fucs: entrada.fucs,
                qrd_conector: qrd_conector * caso.quantidade,
                resistencia_utilizada: Math.min(qrd_conc, qrd_conector) * caso.quantidade
            }
        }),

    };

    return { ...resumo, resistencia_total: resumo.casos.reduce((a, b) => a + b.resistencia_utilizada, 0) };

}

export function alfa_i(classe: ClasseConcreto): number {
    return sel_alfa_i[classe] as number;
}

export function fck(classe: ClasseConcreto): number {
    return sel_fck_concreto[classe] as number;
}

export function ec(classe: ClasseConcreto): number {
    return alfa_i(classe) * 5600 * Math.sqrt(fck(classe));
}

export function props_mec_aco(tipo: TipoAco) {
    return sel_props_aco[tipo];
}
interface PropsCalcRo {
    tf_inf: number,
    bf_inf: number,
    tf_sup: number,
    bf_sup: number,

}

//O rô é o paraâmetro de assimetria do perfil de aço
export function calc_ro(props: PropsCalcRo): number {
    const area_inf = props.bf_inf * props.tf_inf;
    const area_sup = props.bf_sup * props.tf_sup;
    return 1 / 2 * (area_inf / area_sup - 1);
}
/**
 * 
 * @param E modulo de elasticidade em MPa
 * @param fyk tensão de escoamento em MPa
 * @param le Comprimento do trecho de momento positivo (entre os pontos de momento nulo) em metros
 * @param props_mesas propriedades das mesas da seção transversal
 */
export function calc_nizero(E: number, fyk: number, le: number, props_mesas: PropsCalcRo): { ro: number, ni_zero: number } {
    const ro = calc_ro(props_mesas);
    const ni_zero = 1 - E / (580 * fyk) * (0.75 - 0.45 * ro - (0.03 - 0.015 * ro) * le)
    return { ro, ni_zero };
}

interface PropsCalcCr {
    Msd: number | null,
    Mrd: number | null,
}

export function calc_cr({ Msd, Mrd }: PropsCalcCr): number {
    if (Msd !== null && Mrd !== null) {
        return Math.min(Msd / Mrd, 0.7);
    } else {
        6 + 36
        return 0.7;
    }
}

export function select_cp(tipo_construcao: TipoConstrucao): number {

    return sel_tipo_construcao[tipo_construcao];
}

interface PropsCalcNi {
    props_cp: { tipo_construcao: TipoConstrucao },
    props_ni_zero: { E: number, fyk: number, le: number, props_mesas: PropsCalcRo },
    props_cr: { Msd: number | null, Mrd: number | null },
}

export function calc_ni_min(cr: number, ro: number): number {
    return 0.4 * cr * (1 + 0.8 * ro)
}

export function calc_ni_inferiores(props: PropsCalcNi) {
    const cp = select_cp(props.props_cp.tipo_construcao);
    const { ni_zero, ro } = calc_nizero(
        props.props_ni_zero.E,
        props.props_ni_zero.fyk,
        props.props_ni_zero.le,
        props.props_ni_zero.props_mesas
    );
    const cr = calc_cr(props.props_cr);
    const ni_cp2crn0 = cp * ni_zero * cr ** 2;
    const ni_min = calc_ni_min(cr, ro);
    console.log("Propriedades para calculo de limites inferiores de Ni: ",
        { ni_cp2crn0, ni_min, cr, ro, cp, ni_zero });
    return { ni_min, ni_cp2crn0 };
}

/**
 * 
 * @param fck Fck em MPa
 * @returns 
 */
export function calc_ni_c(fck: number): number {
    return Math.min((40 / fck) ** (1 / 3), 1);
}

export function calc_area_perfil_aco(props_secao: ISchemaPropsSecao): number {
    return props_secao.bf_inf * props_secao.tf_inf + props_secao.bf_sup * props_secao.tf_sup + props_secao.tw * props_secao.h;
}

export function fhd(props_secao: ISchemaPropsSecao, fyk: number, gamai: number, fck: number, gama_c: number): number {
    const Aa = calc_area_perfil_aco(props_secao);
    const fcd = fck / gama_c;
    const fyd = fyk / gamai;
    const ni_c = calc_ni_c(fck);
    const fhd_conc = 0.85 * ni_c * fcd * props_secao.b * props_secao.tc / 1000;
    const fhd_aco = Aa * fyd / 1000;
    console.log("Cálculo de Fhd: ", { fhd_aco, fhd_conc, Aa, fcd, fyd, ni_c, b: props_secao.b, tc: props_secao.tc });
    return Math.min(fhd_conc, fhd_aco);
}

export function calc_ccd_int_completa(fck: number, gama_c: number, b: number, tc: number): number {
    const ni_c = calc_ni_c(fck);
    return (0.85 * ni_c * fck * b * tc) / (gama_c * 1000);
}
export function calc_ccd_int_parc(qrd: number): number {
    return qrd;
}

export function calc_tad_int_parc(ccd: number, cad: number): number {
    return ccd + cad;
}

interface PropsCadIntParc {
    props_secao: ISchemaPropsSecao,
    fyk: number,
    gama_i: number,
    ccd: number,
}
export function calc_cad_int_parc({ props_secao, fyk, gama_i, ccd }: PropsCadIntParc): number {
    return 1 / 2 * (calc_area_perfil_aco(props_secao) * fyk / (gama_i * 1000) - ccd);
}

interface PropsYpIntParc {
    cad: number,
    fyk: number,
    gama_i: number,
    props_secao: ISchemaPropsSecao
}
export function calc_yp_int_parc({ cad, fyk, gama_i, props_secao }: PropsYpIntParc): number {
    if (cad <= props_secao.bf_sup * props_secao.tf_sup * fyk / (gama_i * 1000)) {
        const yp = cad / (props_secao.bf_sup * props_secao.tf_sup * fyk / (gama_i * 1000)) * (props_secao.tf_sup);
        return yp;
    } else {
        const yp = props_secao.tf_sup + props_secao.h * ((cad - props_secao.bf_sup * props_secao.tf_sup * fyk / (gama_i * 1000)) / (props_secao.tw * props_secao.h * fyk / (gama_i * 1000)));
        return yp;
    }
}

interface PropsYtIntParc {
    props_secao: ISchemaPropsSecao,
    yp: number,
}
export function calc_yt_yc({ props_secao, yp }: PropsYtIntParc): { yt: number, yc: number } {
    const altura_ret_sup = props_secao.h - yp;
    const yt = (props_secao.tf_inf / 2 * (props_secao.bf_inf * props_secao.tf_inf) + (props_secao.tf_inf + altura_ret_sup / 2) * (props_secao.tw * altura_ret_sup)) / (
        props_secao.bf_inf * props_secao.tf_inf + props_secao.tw * altura_ret_sup
    )
    const yc = (props_secao.tf_sup / 2 * (props_secao.bf_sup * props_secao.tf_sup) + (props_secao.tf_sup + (yp - props_secao.tf_sup) / 2) * (props_secao.tw * (yp - props_secao.tf_sup))) / (
        props_secao.bf_sup * props_secao.tf_sup + props_secao.tw * (yp - props_secao.tf_sup)
    )
    return { yt, yc };
}

export function calc_a_int_parc(ccd: number, fck: number, gama_c: number, props_secao: ISchemaPropsSecao): number {
    const fcd = fck / gama_c;
    return (ccd * 1000) / (0.85 * fcd * props_secao.b);
}

//Cisalhamento
interface PropsVplIntParc {
    props_secao: ISchemaPropsSecao,
    fyk: number,
}

//vpl conferido
export function calc_vpl({ props_secao, fyk }: PropsVplIntParc): number {
    const vpl = 0.6 * props_secao.tw * (props_secao.h + props_secao.tf_inf + props_secao.tf_sup) * fyk / 1000;
    console.log("Cálculo de Vpl: ", { tw: props_secao.tw, h: props_secao.h, tf_inf: props_secao.tf_inf, tf_sup: props_secao.tf_sup, fyk }, "Vpl", vpl);
    return vpl;
}

interface PropsKv {
    enrijecida: boolean
    espacamento_enrijs: number,
    hw: number,
}

export function calc_kv({ espacamento_enrijs, hw, enrijecida }: PropsKv): number {
    console.log("Cálculo de Kv: ", { espacamento_enrijs, hw, enrijecida });
    const razao_a_h = espacamento_enrijs / hw;
    if (enrijecida && razao_a_h <= 3) {
        return 5 + 5 / (espacamento_enrijs / hw) ** 2;
    } else {
        return 5.34;
    }
}
/**
 * 
 * @param props_enrij Parametros dos enrijecedores, caso existam
 * @param E Modulo de elasticidade em MPa
 * @param fyk Tensão de escoamento em MPa
 * @returns Número adimensional lambda_p
 */
export function calc_lambda_p(props_enrij: PropsKv, E: number, fyk: number): number {
    const lambda_p = 1.1 * Math.sqrt(calc_kv(props_enrij) * E / fyk);
    console.log("Cálculo de lambda_p: ", { props_enrij, E, fyk, lambda_p });
    return lambda_p;
}
export function calc_lambda_r(props_enrij: PropsKv, E: number, fyk: number): number {
    const lambda_r = 1.37 * Math.sqrt(calc_kv(props_enrij) * E / fyk);
    console.log("Cálculo de lambda_r: ", { props_enrij, E, fyk, lambda_r });
    return lambda_r;
}

export function calc_vrd_secao_compacta(props_secao: ISchemaPropsSecao, fyk: number, gama_i: number): {vpl: number, vrd: number} {
    const vpl = calc_vpl({ props_secao, fyk })
    const vrd =  vpl/ (gama_i);
    console.log("Cálculo de Vrd para seção compacta: ", { props_secao, fyk, gama_i, vrd });
    return {vpl, vrd};
}

interface PropsVrdSecaoEsbelta {
    lambda_p: number,
    props_secao: ISchemaPropsSecao,
    fyk: number,
    gama_i: number,
}

export function calc_vrd_secao_esbelta({ lambda_p, props_secao, fyk, gama_i }: PropsVrdSecaoEsbelta): {vpl: number, vrd: number} {
    const lambda = props_secao.h / props_secao.tw;
    const vpl = calc_vpl({ props_secao, fyk })
    const vrd = lambda_p / lambda * vpl / (gama_i);
    console.log("Cálculo de Vrd para seção esbelta: ", { lambda_p, props_secao, fyk, gama_i, vrd });
    return {vpl, vrd};
}

export function calc_vrd_secao_muito_esbelta({ lambda_p, props_secao, fyk, gama_i }: PropsVrdSecaoEsbelta): {vpl: number, vrd: number} {
    const lambda = props_secao.h / props_secao.tw;
    const vpl = calc_vpl({ props_secao, fyk })
    const vrd = 1.24 * (lambda_p / lambda) ** 2 * vpl / (gama_i);

    console.log("Cálculo de Vrd para seção muito esbelta: ", { lambda_p, props_secao, fyk, gama_i, vrd });
    return {vpl, vrd};
}