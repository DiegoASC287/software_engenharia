export interface PerfilU {
  /** Dimensão nominal do perfil (ex: 6", 8") */
  pol: string;

  /** Peso nominal por metro (kg/m) */
  peso_kg_m: number;

  /** Altura total do perfil (mm) */
  d_mm: number;

  /** Espessura da alma (mm) */
  tw_mm: number;

  /** Largura da mesa (mm) */
  bf_mm: number;

  /** Espessura da mesa (mm) */
  tf_mm: number;

  /** Área da seção transversal (cm²) */
  area_cm2: number;

  /** Momento de inércia em relação ao eixo x-x (cm⁴) */
  Ix_cm4: number;

  /** Módulo resistente elástico em x-x (cm³) */
  Wx_cm3: number;

  /** Raio de giração em x-x (cm) */
  rx_cm: number;

  /** Momento de inércia em relação ao eixo y-y (cm⁴) */
  Iy_cm4: number;

  /** Módulo resistente elástico em y-y (cm³) */
  Wy_cm3: number;

  /** Raio de giração em y-y (cm) */
  ry_cm: number;

  /** Distância do centroide ao bordo (cm) */
  x_cm: number;
}

export const perfisMap: Map<string, Omit<PerfilU, "pol">> = new Map([
  [
    `3"_6.1`,
    {
      peso_kg_m: 6.10,
      d_mm: 76.20,
      tw_mm: 4.32,
      bf_mm: 35.81,
      tf_mm: 6.93,
      area_cm2: 7.78,
      Ix_cm4: 68.90,
      Wx_cm3: 18.10,
      rx_cm: 2.98,
      Iy_cm4: 8.20,
      Wy_cm3: 3.32,
      ry_cm: 1.03,
      x_cm: 1.11
    }
  ],
  [
    `3"_7.44`,
    {
      peso_kg_m: 7.44,
      d_mm: 76.20,
      tw_mm: 6.55,
      bf_mm: 35.05,
      tf_mm: 6.93,
      area_cm2: 9.48,
      Ix_cm4: 77.20,
      Wx_cm3: 20.30,
      rx_cm: 2.85,
      Iy_cm4: 10.30,
      Wy_cm3: 3.82,
      ry_cm: 1.04,
      x_cm: 1.11
    }
  ],
  [
    `4"_8.04`,
    {
      peso_kg_m: 8.04,
      d_mm: 101.60,
      tw_mm: 4.67,
      bf_mm: 40.23,
      tf_mm: 7.52,
      area_cm2: 10.10,
      Ix_cm4: 159.50,
      Wx_cm3: 31.40,
      rx_cm: 3.97,
      Iy_cm4: 13.10,
      Wy_cm3: 4.61,
      ry_cm: 1.14,
      x_cm: 1.16
    }
  ],
  [
    `4"_9.3`,
    {
      peso_kg_m: 9.30,
      d_mm: 101.60,
      tw_mm: 6.27,
      bf_mm: 41.83,
      tf_mm: 7.52,
      area_cm2: 11.90,
      Ix_cm4: 174.40,
      Wx_cm3: 34.30,
      rx_cm: 3.84,
      Iy_cm4: 15.50,
      Wy_cm3: 5.10,
      ry_cm: 1.14,
      x_cm: 1.15
    }
  ],
  [
    `6"_12.2`,
    {
      peso_kg_m: 12.20,
      d_mm: 152.40,
      tw_mm: 5.08,
      bf_mm: 48.77,
      tf_mm: 8.71,
      area_cm2: 15.50,
      Ix_cm4: 546.00,
      Wx_cm3: 71.70,
      rx_cm: 5.94,
      Iy_cm4: 28.80,
      Wy_cm3: 8.16,
      ry_cm: 1.36,
      x_cm: 1.30
    }
  ],
  [
    `6"_15.62`,
    {
      peso_kg_m: 15.62,
      d_mm: 152.40,
      tw_mm: 7.98,
      bf_mm: 51.66,
      tf_mm: 8.71,
      area_cm2: 19.90,
      Ix_cm4: 632.00,
      Wx_cm3: 82.90,
      rx_cm: 5.63,
      Iy_cm4: 36.00,
      Wy_cm3: 9.24,
      ry_cm: 1.34,
      x_cm: 1.27
    }
  ],
  [
    `8"_17.1`,
    {
      peso_kg_m: 17.10,
      d_mm: 203.20,
      tw_mm: 5.59,
      bf_mm: 57.40,
      tf_mm: 9.50,
      area_cm2: 21.68,
      Ix_cm4: 1344.30,
      Wx_cm3: 132.70,
      rx_cm: 7.87,
      Iy_cm4: 54.10,
      Wy_cm3: 12.94,
      ry_cm: 1.42,
      x_cm: 1.47
    }
  ],
  [
    `8"_20.5`,
    {
      peso_kg_m: 20.50,
      d_mm: 203.20,
      tw_mm: 7.70,
      bf_mm: 59.51,
      tf_mm: 9.50,
      area_cm2: 25.93,
      Ix_cm4: 1490.00,
      Wx_cm3: 147.50,
      rx_cm: 7.59,
      Iy_cm4: 62.40,
      Wy_cm3: 14.09,
      ry_cm: 1.42,
      x_cm: 1.42
    }
  ]
]);
