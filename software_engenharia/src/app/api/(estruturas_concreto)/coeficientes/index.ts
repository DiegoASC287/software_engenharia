import z from "zod"

export const classe_concreto = ["C20", "C25", "C30", "C35", "C40",
    "C45", "C50", "C60", "C70", "C80", "C90"] as const;
export type ClasseConcreto = typeof classe_concreto[number];

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


export const diametros_comerciais = ["5", "6.3", "8", "10", "12.5", "16", "20", "25", "32"] as const
export type DiametrosComerciais = typeof diametros_comerciais[number]

export const sel_as: Record<DiametrosComerciais, {as: number}> = {
    "5": {as: 0.196},
    "6.3": {as: 0.31},
    "8": {as: 0.5},
    "10": {as: 0.785},
    "12.5": {as: 1.22},
    "16": {as: 2.01},
    "20": {as: 3.14},
    "25": {as: 4.91},
    "32": {as: 8.04}
}

