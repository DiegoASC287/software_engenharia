export interface ConectorCisalhamento {
    nome: TipoConectorCisalhamento
    diametro: number
    comprimento_nominal: number
    altura_cabeca: number
    tipo_ceramica: Tipo_ceramica
    a_fuste: number
}

export type Tipo_ceramica = "MB" | "SD" | "MB-SD";
export const ConectoresCisalhamento = [
    "CS-⌀19×80-MB",
    "CS-⌀19×105-SD",
    "CS-⌀19×120-SD",
    "CS-⌀19×135-MB-SD",
    "CS-⌀22×93-MB",
    "CS-⌀22×106-MB",
    "CS-⌀22×132-MB",
    "CS-⌀22×157-MB",
    "CS-⌀22×182-MB",
    "CS-⌀22×208-MB",
] as const;

export type TipoConectorCisalhamento =
    typeof ConectoresCisalhamento[number];

export const CONECTORES_CISALHAMENTO: Record<
    TipoConectorCisalhamento,
    Omit<ConectorCisalhamento, "nome">
> = {
    "CS-⌀19×80-MB": {
        diametro: 19,
        comprimento_nominal: 80,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀19×105-SD": {
        diametro: 19,
        comprimento_nominal: 105,
        altura_cabeca: 9.5,
        tipo_ceramica: "SD",
        a_fuste: 0
    },
    "CS-⌀19×120-SD": {
        diametro: 19,
        comprimento_nominal: 120,
        altura_cabeca: 9.5,
        tipo_ceramica: "SD",
        a_fuste: 0
    },
    "CS-⌀19×135-MB-SD": {
        diametro: 19,
        comprimento_nominal: 135,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB-SD",
        a_fuste: 0
    },
    "CS-⌀22×93-MB": {
        diametro: 22,
        comprimento_nominal: 93,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀22×106-MB": {
        diametro: 22,
        comprimento_nominal: 106,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀22×132-MB": {
        diametro: 22,
        comprimento_nominal: 132,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀22×157-MB": {
        diametro: 22,
        comprimento_nominal: 157,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀22×182-MB": {
        diametro: 22,
        comprimento_nominal: 182,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
    "CS-⌀22×208-MB": {
        diametro: 22,
        comprimento_nominal: 208,
        altura_cabeca: 9.5,
        tipo_ceramica: "MB",
        a_fuste: 0
    },
} as const;
export const ArrayCasoRg = ["A", "B", "C", "D"] as const;
export const ArrayCasoRp = ["A", "B", "C"] as const;
export type CasoRg = typeof ArrayCasoRg[number];
export type CasoRp = typeof ArrayCasoRp[number];

export interface Rg{
    caso: CasoRg;
    valor: number;
}
export interface Rp{
    caso: CasoRp;
    valor: number;
}

export const RG: Record<
    CasoRg,
    Omit<Rg, "caso">> = {
    A: { valor: 1.0 },
    B: { valor: 0.9 },
    C: { valor: 0.85 },
    D: { valor: 0.7 },
    }

export const RP: Record<
    CasoRp,
    Omit<Rp, "caso">> = {
    A: { valor: 0.75 },
    B: { valor: 0.75 },
    C: { valor: 0.6 },
    }

export const classe_concreto = ["C20", "C25", "C30", "C35", "C40", "C45", "C50", "C60", "C70", "C80", "C90"] as const;
export type ClasseConcreto = typeof classe_concreto[number];

export const tipo_aco = ["A36", "A572", "A992"] as const;
export type TipoAco = typeof tipo_aco[number];

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

export const sel_props_aco: Record<TipoAco, { fyk: number; Es: number }> = {
    "A36": { fyk: 250, Es: 200000 },
    "A572": { fyk: 345, Es: 200000 },
    "A992": { fyk: 450, Es: 200000 },
};

export const tipo_construcao = ["ESCORADA", "NAO_ESCORADA"] as const;
export type TipoConstrucao = typeof tipo_construcao[number];


export const sel_tipo_construcao: Record<TipoConstrucao, number> = {
    "ESCORADA": 1.0,
    "NAO_ESCORADA": 0.85,
};