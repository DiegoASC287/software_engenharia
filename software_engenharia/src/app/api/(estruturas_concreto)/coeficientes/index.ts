import z from "zod"

export const classe_concreto = ["C20", "C25", "C30", "C35", "C40",
    "C45", "C50", "C60", "C70", "C80", "C90"] as const;
export type ClasseConcreto = typeof classe_concreto[number];
export const sel_alfa_i: Record<ClasseConcreto, number> = {
    "C20": 0.85,
    "C25": 0.86,
    "C30": 0.88,
    "C35": 0.89,
    "C40": 0.90,
    "C45": 0.91,
    "C50": 0.93,
    "C60": 0.95,
    "C70": 0.98,
    "C80": 1.0,
    "C90": 1.0
};
export const sel_fck_concreto: Record<ClasseConcreto, number> = {
    "C20": 20,
    "C25": 25,
    "C30": 30,
    "C35": 35,
    "C40": 40,
    "C45": 45,
    "C50": 50,
    "C60": 60,
    "C70": 70,
    "C80": 80,
    "C90": 90
};

export function props_conc(classe_concreto: ClasseConcreto) {
    const alfa_i = sel_alfa_i[classe_concreto]
    const fck = sel_fck_concreto[classe_concreto]
    return { fck, Ec: alfa_i * 5600 * Math.sqrt(fck) }
}

export const classe_aco = ["CA50", "CA60"] as const;
export type ClasseAco = typeof classe_aco[number];

export const sel_props_aco: Record<ClasseAco, { fyk: number, Es: number }> = {
    "CA50": { Es: 200000, fyk: 500 },
    "CA60": { Es: 200000, fyk: 600 }
};

export function props_steel(classe_aco: ClasseAco) {

    return sel_props_aco[classe_aco]
}

export const diametros_comerciais = ["5", "6.3", "8", "10", "12.5", "16", "20", "25", "32"] as const
export type DiametrosComerciais = typeof diametros_comerciais[number]

export const sel_as: Record<DiametrosComerciais, { as: number }> = {
    "5": { as: 0.196 },
    "6.3": { as: 0.31 },
    "8": { as: 0.5 },
    "10": { as: 0.785 },
    "12.5": { as: 1.22 },
    "16": { as: 2.01 },
    "20": { as: 3.14 },
    "25": { as: 4.91 },
    "32": { as: 8.04 }
}

export interface PropsLNII {
    bw: number
    alfa_e: number
    as: number
    as_linha: number
    d: number
    d_linha: number
}

export function calc_props_secao_ii({ bw, alfa_e, as, d }: PropsLNII) {
    const xii = (-alfa_e * as + Math.sqrt((alfa_e * as) ** 2 + 2 * bw * alfa_e * as * d)) / bw
    const Iii = bw * xii ** 3 / 3 + alfa_e * as * (d - xii) ** 2

    return { xii, Iii }
}


interface CalcSigmaSProps {
    alfa_e: number;
    msd: number;
    d: number;
    xii: number;
    Iii: number;
}
/**
 * 
 * @param xii Linha neutra em cm
 * @param alfa_e Coeficiente adimensional
 * @param d altura útil em cm
 * @param msd momento fletor de cálculo (kNm)
 * @param Iii momento de inércia para o estádio 2 em cm^4
 * @returns tensão máxima em kN/cm²
 */
export function calc_sigma_s({ Iii, alfa_e, d, msd, xii }: CalcSigmaSProps) {
    return alfa_e * msd * 100 * (d - xii) / Iii
}

interface PropsSigmaC {
    msd: number
    xii: number
    Iii: number
}

/**
 * 
 * @param msd_min KNm
 * @param Iii cm^4
 * @param xii cm
 * 
 * @returns tensão em kN/cm²
 */
export function calc_sigma_c({msd, Iii, xii}:PropsSigmaC){
    const sigma_c_min = xii > 30 ? msd*100*(xii-30)/Iii : 0
    const sigma_c_max = msd*100*xii/Iii
    const ni_c = 1/(1.5-0.5*sigma_c_min/sigma_c_max)
    return {sigma_c_min, sigma_c_max, ni_c, xii, Iii}
}

export function sel_diam_pino_D(diametro_arm: DiametrosComerciais, tipo_aco: ClasseAco) {
    if (Number(diametro_arm) < 20) {
        if (tipo_aco === "CA50") {
            return 5 * Number(diametro_arm)
        } else if (tipo_aco === "CA60") {
            return 6 * Number(diametro_arm)
        }
        return null
    } else {
        if (tipo_aco === "CA50") {
            return 8 * Number(diametro_arm)
        }
        return null
    }
}
/**
 * 
 * @param diametro_barra diametro em mm
 * @param tipo_aco Tipo do aço
 * @returns Variação de tensão máxima em MPa
 */
export function sel_delta_fsd(diametro_barra: DiametrosComerciais, tipo_aco: ClasseAco) {
    const D = sel_diam_pino_D(diametro_barra, tipo_aco)
    if (D !== null) {
        console.log("Infos entrada", diametro_barra, D)
        if (D > 25 * Number(diametro_barra)){
            switch (diametro_barra) {
                case "10": return 190;
                case "12.5": return 190;
                case "16": return 190;
                case "20": return 185;
                case "25": return 175;
                case "32": return 165;
                default: return null;
            }
            
        }
        else if (Number(diametro_barra) >= 20 && D > (8 * Number(diametro_barra))) {
            
            switch (diametro_barra) {
                case "10": return 105;
                case "12.5": return 105;
                case "16": return 105;
                case "20": return 105;
                case "25": return 95;
                case "32": return 90;
                default: return null;
            }
        } else if (Number(diametro_barra) < 20 && D >= 5 * Number(diametro_barra)) {
            switch (diametro_barra) {
                case "10": return 90;
                case "12.5": return 90;
                case "16": return 90;
                default: return null;

            }
        } else if (Number(diametro_barra) < 10 && D > 3 * Number(diametro_barra)) {
            switch (diametro_barra) {
                case "10": return 85;

                default: return null;

            }
        }
    } 
    return null
}