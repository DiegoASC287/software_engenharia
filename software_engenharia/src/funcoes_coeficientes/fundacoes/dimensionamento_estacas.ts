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

export enum SubTipoSolo {
	AREIA_FOFA = "Areia fofa",
	AREIA_MEDIA = "Areia media",
	AREIA_COMPACTA = "Areia compacta",
	ARGILA_MOLE = "Argila mole",
	ARGILA_MEDIA = "Argila media",
	ARGILA_RIJA = "Argila rija",
	ARGILA_DURA = "Argila dura",
}

// Tipo representando as propriedades de cada solo
export function ParamsTipoSoloAoki(solo: TipoDeSolo) {
	const tipos: Record<TipoDeSolo, { K: number, alfa: number }> = {
		[TipoDeSolo.AREIA]: { K: 1.00 * 1000, alfa: 1.4 },
		[TipoDeSolo.AREIA_SILTOSA]: { K: 0.80 * 1000, alfa: 2.0 },
		[TipoDeSolo.AREIA_SILTOARGILOSA]: { K: 0.70, alfa: 2.4 },
		[TipoDeSolo.AREIA_ARGILOSA]: { K: 0.60 * 1000, alfa: 3.0 },
		[TipoDeSolo.AREIA_ARGILOSSILTOSA]: { K: 0.50 * 1000, alfa: 2.8 },
		[TipoDeSolo.SILTE]: { K: 0.40 * 1000, alfa: 3.0 },
		[TipoDeSolo.SILTE_ARENOSO]: { K: 0.55 * 1000, alfa: 2.2 },
		[TipoDeSolo.SILTE_ARENOARGILOSO]: { K: 0.45 * 1000, alfa: 2.8 },
		[TipoDeSolo.SILTE_ARGILOSO]: { K: 0.23 * 1000, alfa: 3.4 },
		[TipoDeSolo.SILTE_ARGILOARENOSO]: { K: 0.25 * 1000, alfa: 3.0 },
		[TipoDeSolo.ARGILA]: { K: 0.20 * 1000, alfa: 6.0 },
		[TipoDeSolo.ARGILA_ARENOSA]: { K: 0.35 * 1000, alfa: 2.4 },
		[TipoDeSolo.ARGILA_ARENOSSILTOSA]: { K: 0.30 * 1000, alfa: 2.8 },
		[TipoDeSolo.ARGILA_SILTOSA]: { K: 0.22 * 1000, alfa: 4.0 },
		[TipoDeSolo.ARGILA_SILTOARENOSA]: { K: 0.33 * 1000, alfa: 3.0 },
	}
	return tipos[solo]
}

export function BuscarFatorGrupo(espacamento: number, diametro: number, tipo_estaca: TipoEstaca) {
	const estacas_escavadas: TipoEstaca[] = [TipoEstaca.ESCAVADA, TipoEstaca.OMEGA,
	TipoEstaca.FRANKI, TipoEstaca.HELICE_CONTINUJA, TipoEstaca.RAIZ]
	const estacas_cravadas: TipoEstaca[] = [TipoEstaca.METALICA, TipoEstaca.PRE_MOLDADA]

	if (estacas_escavadas.includes(tipo_estaca)) {
		if (espacamento / diametro > 4) {
			return 1
		} else if (espacamento / diametro >= 3) {
			return 0.85
		} else if (espacamento / diametro >= 2.5) {
			return 0.75
		} else {
			return 0.65
		}
	}else{
		if (espacamento / diametro > 3) {
			return 1
		} else if (espacamento / diametro >= 2.5) {
			return 0.95
		}  else {
			return 0.65
		}
	}
}

export function ParamsSubtipoSolo(solo: SubTipoSolo, submerso: boolean) {
	const tipos: Record<SubTipoSolo, { K1: number }> = {
		[SubTipoSolo.AREIA_FOFA]: { K1: submerso ? 0.1 : 0.2 },
		[SubTipoSolo.AREIA_MEDIA]: { K1: submerso ? 0.4 : 0.7 },
		[SubTipoSolo.AREIA_COMPACTA]: { K1: submerso ? 1.1 : 1.8 },
		[SubTipoSolo.ARGILA_MOLE]: { K1: 0.75 },
		[SubTipoSolo.ARGILA_MEDIA]: { K1: 2 },
		[SubTipoSolo.ARGILA_RIJA]: { K1: 5 },
		[SubTipoSolo.ARGILA_DURA]: { K1: 10 },
	}
	return tipos[solo]
}

export function VerificarTipo(tipo: TipoDeSolo, nspt: number): { subtipo: SubTipoSolo, categoria: "Arenoso" | "Argiloso" } {
	const solos_arenosos: TipoDeSolo[] = [
		TipoDeSolo.AREIA, TipoDeSolo.AREIA_ARGILOSA, TipoDeSolo.AREIA_ARGILOSSILTOSA,
		TipoDeSolo.AREIA_SILTOARGILOSA, TipoDeSolo.AREIA_SILTOSA, TipoDeSolo.SILTE_ARENOSO, TipoDeSolo.SILTE_ARENOARGILOSO, TipoDeSolo.SILTE
	]

	const solos_argilosos: TipoDeSolo[] = [
		TipoDeSolo.ARGILA, TipoDeSolo.ARGILA_ARENOSA, TipoDeSolo.ARGILA_ARENOSSILTOSA, TipoDeSolo.ARGILA_SILTOARENOSA,
		TipoDeSolo.ARGILA_ARENOSSILTOSA, TipoDeSolo.ARGILA_SILTOSA, TipoDeSolo.SILTE_ARGILOSO, TipoDeSolo.SILTE_ARGILOARENOSO]

	if (solos_arenosos.includes(tipo)) {
		if (nspt > 0 && nspt <= 10) {
			return { subtipo: SubTipoSolo.AREIA_FOFA, categoria: "Arenoso" }
		} else if (nspt > 10 && nspt <= 30) {
			return { subtipo: SubTipoSolo.AREIA_MEDIA, categoria: "Arenoso" }
		} else {
			return { subtipo: SubTipoSolo.AREIA_COMPACTA, categoria: "Arenoso" }
		}
	} else {
		if (nspt > 0 && nspt <= 4) {
			return { subtipo: SubTipoSolo.ARGILA_MOLE, categoria: "Argiloso" }
		} else if (nspt > 4 && nspt <= 8) {
			return { subtipo: SubTipoSolo.ARGILA_MEDIA, categoria: "Argiloso" }
		} else if (nspt > 8 && nspt <= 30) {
			return { subtipo: SubTipoSolo.ARGILA_RIJA, categoria: "Argiloso" }
		}
		else {
			return { subtipo: SubTipoSolo.ARGILA_DURA, categoria: "Argiloso" }
		}
	}
}

export function RetornarValorKhEKv(dados: { tipo_solo: TipoDeSolo, nspt: number, submerso: boolean, diametro_largura: number, profundidade: number }) {
	const subtipo = VerificarTipo(dados.tipo_solo, dados.nspt)
	let kh_ger: number
	if (subtipo.categoria === "Arenoso") {
		kh_ger = ParamsSubtipoSolo(subtipo.subtipo, dados.submerso).K1 * dados.profundidade / dados.diametro_largura
	} else {
		kh_ger = 0.2 * ParamsSubtipoSolo(subtipo.subtipo, dados.submerso).K1 / dados.diametro_largura
	}
	const kh = kh_ger / 100 * dados.diametro_largura * 100 * 100 * 100
	const kv_ger = subtipo.categoria === "Arenoso" ? kh_ger / 0.29 : kh_ger / 0.4
	const kv = kv_ger / 100 * Math.PI * dados.diametro_largura * 100 * 100 * 100
	return { kh, kv }
}



// Enum com os tipos de estaca segundo Aoki & Velloso (1975)
export enum TipoEstaca {
	FRANKI = "Franki",
	METALICA = "Metálica",
	PRE_MOLDADA = "Pré-moldada",
	ESCAVADA = "Escavada",
	RAIZ = "Raiz",
	HELICE_CONTINUJA = "Hélice contínua",
	OMEGA = "Omega",
}

// Tipo representando os fatores F1 e F2
// Tabela dos fatores de correção F1 e F2
export function fatoresCorrecaoAoki(tipo: TipoEstaca, diametro: number) {
	const tipos: Record<TipoEstaca, { F1: number, F2: number }> = {
		[TipoEstaca.FRANKI]: { F1: 2.50, F2: 5 },
		[TipoEstaca.METALICA]: { F1: 1.75, F2: 2 * 1.75 },
		[TipoEstaca.PRE_MOLDADA]: { F1: 1 + diametro * 0.8, F2: 2 * (1 + diametro * 0.8) },
		[TipoEstaca.ESCAVADA]: { F1: 3.00, F2: 6 },
		[TipoEstaca.RAIZ]: { F1: 2.00, F2: 4 },
		[TipoEstaca.HELICE_CONTINUJA]: { F1: 2.00, F2: 4 },
		[TipoEstaca.OMEGA]: { F1: 2.00, F2: 4 },
	}
	return tipos[tipo]
}


export function calculaCapacidadeCargaEstacaAoki() { }
