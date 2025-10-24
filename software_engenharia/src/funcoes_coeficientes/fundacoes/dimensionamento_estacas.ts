// Enum com todos os tipos de solo
export enum TipoDeSolo {
  AREIA = "Areia",
  AREIA_SILTOSA = "Areia siltosa",
  AREIA_SILTOARGILOSA = "Areia siltoargilosa",
  AREIA_ARGILOSA = "Areia argilosa",
  AREIA_ARGILOSSILTOSA = "Areia argilossiltosa",
  SILTE = "Silte",
  SILTE_ARENOSO = "Silte arenoso",
  SILTE_ARENOARGILOSO = "Silte arenoargiloso",
  SILTE_ARGILOSO = "Silte argiloso",
  SILTE_ARGILOARENOSO = "Silte argiloarenoso",
  ARGILA = "Argila",
  ARGILA_ARENOSA = "Argila arenosa",
  ARGILA_ARENOSSILTOSA = "Argila arenossiltosa",
  ARGILA_SILTOSA = "Argila siltosa",
  ARGILA_SILTOARENOSA = "Argila siltoarenosa",
}

// Tipo representando as propriedades de cada solo
export function ParamsTipoSoloAoki(solo: TipoDeSolo){
    const tipos: Record<TipoDeSolo, { K: number, alfa: number }> = {
        [TipoDeSolo.AREIA]: { K: 1.00*1000, alfa: 1.4 },
        [TipoDeSolo.AREIA_SILTOSA]: { K: 0.80*1000, alfa: 2.0 },
        [TipoDeSolo.AREIA_SILTOARGILOSA]: { K: 0.70, alfa: 2.4 },
        [TipoDeSolo.AREIA_ARGILOSA]: { K: 0.60*1000, alfa: 3.0 },
        [TipoDeSolo.AREIA_ARGILOSSILTOSA]: { K: 0.50*1000, alfa: 2.8 },
        [TipoDeSolo.SILTE]: { K: 0.40*1000, alfa: 3.0 },
        [TipoDeSolo.SILTE_ARENOSO]: { K: 0.55*1000, alfa: 2.2 },
        [TipoDeSolo.SILTE_ARENOARGILOSO]: { K: 0.45*1000, alfa: 2.8 },
        [TipoDeSolo.SILTE_ARGILOSO]: { K: 0.23*1000, alfa: 3.4 },
        [TipoDeSolo.SILTE_ARGILOARENOSO]: { K: 0.25*1000, alfa: 3.0 },
        [TipoDeSolo.ARGILA]: { K: 0.20*1000, alfa: 6.0 },
        [TipoDeSolo.ARGILA_ARENOSA]: { K: 0.35*1000, alfa: 2.4 },
        [TipoDeSolo.ARGILA_ARENOSSILTOSA]: { K: 0.30*1000, alfa: 2.8 },
        [TipoDeSolo.ARGILA_SILTOSA]: { K: 0.22*1000, alfa: 4.0 },
        [TipoDeSolo.ARGILA_SILTOARENOSA]: { K: 0.33*1000, alfa: 3.0 },
    }
    return tipos[solo]
}



// Enum com os tipos de estaca segundo Aoki & Velloso (1975)
export enum TipoEstaca {
  FRANKI = "Franki",
  METALICA = "Metálica",
  PRE_MOLDADA = "Pré-moldada",
  ESCAVADA = "Escavada",
  RAIZ_HELICE_OMEGA = "Raiz",
  HELICE_CONTINUJA = "Hélice contínua",
  OMEGA = "Omega",
}

// Tipo representando os fatores F1 e F2
// Tabela dos fatores de correção F1 e F2
export function fatoresCorrecaoAoki(tipo: TipoEstaca, diametro: number){
    const tipos: Record<TipoEstaca, { F1: number, F2: number }> = {
        [TipoEstaca.FRANKI]: { F1: 2.50, F2: 5 },
        [TipoEstaca.METALICA]: { F1: 1.75, F2: 2*1.75 },
        [TipoEstaca.PRE_MOLDADA]: { F1: 1+diametro*0.8, F2: 2*(1+diametro*0.8) },
        [TipoEstaca.ESCAVADA]: { F1: 3.00, F2: 6 },
        [TipoEstaca.RAIZ_HELICE_OMEGA]: { F1: 2.00, F2: 4 },
        [TipoEstaca.HELICE_CONTINUJA]: { F1: 2.00, F2: 4 },
        [TipoEstaca.OMEGA]: { F1: 2.00, F2: 4 },
    }
    return tipos[tipo]
}

export function calculaCapacidadeCargaEstacaAoki(){}
