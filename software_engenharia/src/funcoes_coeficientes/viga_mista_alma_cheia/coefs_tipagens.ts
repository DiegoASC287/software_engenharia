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

export type CasoRg = "A" | "B" | "C" | "D";
export type CasoRp = "A" | "B" | "C";

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

