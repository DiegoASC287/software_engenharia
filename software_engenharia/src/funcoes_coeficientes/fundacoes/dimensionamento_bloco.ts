// app/api/dimensionar-bloco/route.ts
// =====================================================
// DIMENSIONAMENTO DE BLOCO SOBRE DUAS ESTACAS
// MÉTODO DAS BIELAS E TIRANTES (MBT) – ELU – NBR 6118
// CASO: CARGA VERTICAL + MOMENTO FLETOR
// COM VERIFICAÇÃO DO NÓ CCC (PILAR)
// =====================================================

export interface EntradaBloco {
  Nd: number; // carga vertical de projeto no pilar (kN)
  Md: number; // momento fletor de projeto no pilar (kN.m)
  espacamentoEstacas: number; // distancia entre eixos das estacas (m)
  d: number; // altura util do bloco (m)
  fck: number; // MPa
  fyk: number; // MPa

  // Dados geométricos do pilar (nó CCC)
  pilarBx: number; // largura do pilar (m)
  pilarBy: number; // comprimento do pilar (m)

  gammaC?: number; // coeficiente do concreto (default 1.4)
  gammaS?: number; // coeficiente do aço (default 1.15)
}

export function dimensionarBloco2EstacasComMomento(dados: EntradaBloco) {
  const {
    Nd,
    Md,
    espacamentoEstacas,
    d,
    fck,
    fyk,
    pilarBx,
    pilarBy,
    gammaC = 1.4,
    gammaS = 1.15,
  } = dados;

  const a = espacamentoEstacas; // m

  // ------------------------------
  // Reações nas estacas (equilíbrio Nd + Md)
  // ------------------------------
  const Rd1 = Nd / 2 + Md / a; // kN
  const Rd2 = Nd / 2 - Md / a; // kN

  if (Rd1 <= 0 || Rd2 <= 0) {
    throw new Error("Uma das estacas entrou em tração. Rever concepção.");
  }

  // ------------------------------
  // Geometria das bielas
  // ------------------------------
  const theta = Math.atan(d / (a / 2)); // rad

  // ------------------------------
  // Força no tirante
  // ------------------------------
  const Td = (Rd1 + Rd2) * (1 / Math.tan(theta)); // kN

  // ------------------------------
  // Materiais
  // ------------------------------
  const fyd = fyk / gammaS; // MPa
  const fcd = fck / gammaC; // MPa

  // ------------------------------
  // Área de aço necessária
  // ------------------------------
  const As = (Td * 1e3) / fyd; // mm²

  // ------------------------------
  // Verificação da biela mais solicitada
  // ------------------------------
  const Rd_max = Math.max(Rd1, Rd2);
  const Cd_biela = Rd_max / Math.sin(theta); // kN

  const sigmaBiela = (Cd_biela * 1e3) / (d * 1000 * 1000); // MPa (simplificado)
  const sigmaBielaLimite = 0.6 * fcd;

  // ------------------------------
  // VERIFICAÇÃO DO NÓ CCC (PILAR)
  // Método 1 – Espalhamento a 45° (prática consagrada em pontes)
  // h_no = menor dimensão do pilar / 2, limitado pela altura útil do bloco
  // ------------------------------

  const menorDimPilar = Math.min(pilarBx, pilarBy);
  const hNo = Math.min(d, menorDimPilar / 2);

  const C_no = Nd; // kN (resultante no nó do pilar)

  const areaNo = menorDimPilar * hNo; // m² (área nodal efetiva)
  const sigmaNo = (C_no * 1e3) / (areaNo * 1e6); // MPa

  const sigmaNoLimite = 0.6 * fcd;

  return {
    entradas: dados,
    reacoes: {
      Rd_estaca_1_kN: Rd1,
      Rd_estaca_2_kN: Rd2,
    },
    geometria: {
      angulo_biela_graus: (theta * 180) / Math.PI,
    },
    tirante: {
      Td_kN: Td,
      area_aco_mm2: As,
      observacao: "Armadura inferior deve ser contínua entre as estacas",
    },
    biela_critica: {
      Cd_kN: Cd_biela,
      tensao_MPa: sigmaBiela,
      limite_MPa: sigmaBielaLimite,
      atende: sigmaBiela <= sigmaBielaLimite,
    },
    no_CCC_pilar: {
      metodo: "Espalhamento a 45° (h_no = b_p/2, limitado por d)",
      menor_dimensao_pilar_m: menorDimPilar,
      h_no_m: hNo,
      forca_kN: C_no,
      area_m2: areaNo,
      tensao_MPa: sigmaNo,
      limite_MPa: sigmaNoLimite,
      atende: sigmaNo <= sigmaNoLimite,
    },
    observacoes: [
      "Modelo MBT com momento fletor e verificação do nó CCC",
      "Limite de tensão nodal adotado: 0,6·fcd (NBR 6118)",
      "Caso o nó não atenda, aumentar seção do pilar ou altura do bloco",
      "Nós sobre estacas (CCT) ainda devem ser verificados",
    ],
  };
}

