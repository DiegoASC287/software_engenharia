import { CasoRg, CasoRp, ConectorCisalhamento, CONECTORES_CISALHAMENTO, RG, RP, TipoConectorCisalhamento } from "./coefs_tipagens";

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
    conector: ConectorCisalhamento
    casos: CasosQRD[];
}

export function calcular_qrd_conectores(entrada: EntradaCalcQRD): number {
    const { a_fuste } = select_conector(entrada.conector.nome);
    const resistencias: number[] = entrada.casos.map(caso => {
        const qrd_conc = 1 / 2 * a_fuste * Math.sqrt(entrada.fck * entrada.EC) / entrada.gama_cs
        const qrd_conector = rg(caso.caso_rg) * rp(caso.caso_rp) * a_fuste * entrada.fucs / entrada.gama_cs;
        return Math.min(qrd_conc, qrd_conector) * caso.quantidade;
    });

    return resistencias.reduce((acc, val) => acc + val, 0);

}