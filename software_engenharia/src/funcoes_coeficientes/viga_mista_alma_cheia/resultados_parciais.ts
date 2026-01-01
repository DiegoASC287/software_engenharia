import { CasoRg, CasoRp, ClasseConcreto, ConectorCisalhamento, CONECTORES_CISALHAMENTO, RG, RP, sel_alfa_i, sel_fck_concreto, TipoConectorCisalhamento } from "./coefs_tipagens";

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
            const qrd_conc = 1 / 2 * a_fuste * Math.sqrt(entrada.fck * entrada.EC) / (entrada.gama_cs*1000)
            const qrd_conector = rg_cur * rp_cur * a_fuste * entrada.fucs / (entrada.gama_cs*1000);
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

    return {...resumo, resistencia_total: resumo.casos.reduce((a, b) => a + b.resistencia_utilizada, 0) };

}  

export function alfa_i(classe: ClasseConcreto): number {
    return sel_alfa_i[classe] as number;
} 

export function fck(classe: ClasseConcreto): number {
    return sel_fck_concreto[classe] as number;
}

export function ec(classe: ClasseConcreto): number {
    return alfa_i(classe)*5600*Math.sqrt(fck(classe));
}