// ============================================================================
//  PERFIL W – MODELO COMPLETO EM UM ARQUIVO
//  Sem JSX, 100% JSON, pronto para backend Node/Next API
// ============================================================================
import { z } from "zod";

// -------------------------------------------------------------
//   Esforcos
// -------------------------------------------------------------
export const EsforcosSchema = z.object({
    msd_max_x: z.number(),
    msd_min_x: z.number(),
    msd_max_y: z.number(),
    msd_min_y: z.number(),
    max: z.number(),
    mbx: z.number(),
    mcx: z.number(),
    may: z.number(),
    mby: z.number(),
    mcy: z.number(),
    nsd_max: z.number(),
    nsd_min: z.number(),
    vsd: z.number()
});

// -------------------------------------------------------------
//   PerfilWTabela
// -------------------------------------------------------------
export const PerfilWTabelaSchema = z.object({
    nome: z.string(),
    ag: z.number(),
    ix: z.number(),
    iy: z.number(),
    wx: z.number(),
    wy: z.number(),
    zx: z.number(),
    zy: z.number(),
    h: z.number(),
    dlinha: z.number(),
    bf: z.number(),
    tw: z.number(),
    tf: z.number(),
    rx: z.number(),
    ry: z.number()
});

// -------------------------------------------------------------
//   Aplicações
// -------------------------------------------------------------
export const AplicacaoSchema = z.enum(["pilar", "viga", "barra"]);

// -------------------------------------------------------------
//   Schema completo para criar um PerfilW
// -------------------------------------------------------------
export const PerfilWEntradaSchema = z.object({
    topo_livre: z.boolean(),
    esforcos: EsforcosSchema,
    gama_a1: z.number().positive(),
    modulo_e: z.number().positive(),
    fyk: z.number().positive(),
    fu: z.number().positive(),
    aplicacao_perfil: AplicacaoSchema,
    lx: z.number().positive(),   // comprimentos
    ly: z.number().positive(),
    lz: z.number().positive(),
    kx: z.number().positive(),   // coeficientes de flambagem
    ky: z.number().positive(),
    props_perfil: PerfilWTabelaSchema,
    descricao_el: z.string()
});

// -------------------------------------------------------------
//   Tipos TypeScript automáticos
// -------------------------------------------------------------
export type TipoEsforcos = z.infer<typeof EsforcosSchema>;
export type TipoPerfilWTabela = z.infer<typeof PerfilWTabelaSchema>;
export type TipoPerfilWEntrada = z.infer<typeof PerfilWEntradaSchema>;


// Interface dos esforços
export interface Esforcos {
    msd_max_x: number
    msd_min_x: number
    msd_max_y: number
    msd_min_y: number
    max: number
    mbx: number
    mcx: number
    may: number
    mby: number
    mcy: number
    nsd_max: number
    nsd_min: number
    vsd: number
}

// Interface das propriedades do perfil W
export interface PerfilWTabela {
    nome: string
    ag: number
    ix: number
    iy: number
    wx: number
    wy: number
    zx: number
    zy: number
    h: number
    dlinha: number
    bf: number
    tw: number
    tf: number
    rx: number
    ry: number
}

// Tipo de aplicação (pilar, viga, etc)
export type aplicacoes = "pilar" | "viga" | "barra"

// ============================================================================
//     CLASSE PERFIL W – VERSÃO JSON (SEM JSX)
// ============================================================================

export default class PerfilW {

    // --- Propriedades internas ---
    private props_perfil: PerfilWTabela
    private esforcos: Esforcos
    private lx: number
    private ly: number
    private lz: number
    private kx: number
    private ky: number
    private fyk: number
    private fu: number
    private modulo_e: number
    private lambda_x: number
    private lambda_y: number
    private aplicacao_perfil: aplicacoes
    private bst_lim_alma: number
    private bst_lim_mesa: number
    private q: number
    private nrd: number
    private nrdx_comp: number
    private nrdy_comp: number
    private mrdx: number
    private mrdy: number
    private mrdz: number
    private gama_a1: number
    private descricao_el: string
    private topo_livre: boolean
    private modulo_e_g: number
    private cm_x: number
    private cm_y: number
    private b1_x: number
    private b1_y: number
    private msd_max_x: number
    private msd_max_y: number

    // ========================================================================
    //   CONSTRUTOR
    // ========================================================================
    constructor(
        topo_livre: boolean,
        esforcos: Esforcos,
        gama_a1: number,
        modulo_e: number,
        fyk: number,
        fu: number,
        aplicacao_perfil: aplicacoes,
        lx: number,
        ly: number,
        lz: number,
        kx: number,
        ky: number,
        props_perfil: PerfilWTabela,
        descricao_el: string
    ) {

        this.props_perfil = { ...props_perfil }
        this.esforcos = esforcos
        this.descricao_el = descricao_el
        this.modulo_e = modulo_e
        this.fyk = fyk
        this.fu = fu
        this.gama_a1 = gama_a1

        this.lx = lx
        this.ly = ly
        this.lz = lz
        this.kx = kx
        this.ky = ky

        this.lambda_x = this.calcular_lambda_x()
        this.lambda_y = this.calcular_lambda_y()

        this.aplicacao_perfil = aplicacao_perfil
        this.bst_lim_alma = this.calcular_bst_lim_alma()
        this.bst_lim_mesa = this.calcular_bst_lim_mesa()
        this.q = 1

        this.cm_x = this.calcular_cm(this.esforcos.msd_max_x, this.esforcos.msd_min_x)
        this.cm_y = this.calcular_cm(this.esforcos.msd_max_y, this.esforcos.msd_min_y)

        this.nrd = 0
        this.nrdx_comp = 0
        this.nrdy_comp = 0

        this.topo_livre = topo_livre
        this.modulo_e_g = modulo_e / (2 * (1 + 0.3))

        this.b1_x = 0
        this.b1_y = 0

        this.mrdx = 0
        this.mrdy = 0
        this.mrdz = 0

        this.msd_max_x = 0
        this.msd_max_y = 0
    }

    // ========================================================================
    //   HELPERS
    // ========================================================================

    private msg(tipo: "titulo" | "texto" | "sub", texto: string) {
        return { tipo, texto }
    }

    p_numero(numero: number, qtd_casas: number = 2) {
        return Number(numero.toFixed(qtd_casas))
    }

    calcular_lambda_x() {
        return this.props_perfil.rx !== 0
            ? this.kx * this.lx * 100 / this.props_perfil.rx
            : 0
    }

    calcular_lambda_y() {
        return this.props_perfil.ry !== 0
            ? this.ky * this.ly * 100 / this.props_perfil.ry
            : 0
    }

    calcular_bst_lim_alma() {
        return 1.49 * Math.sqrt(this.modulo_e * 1000 / this.fyk)
    }

    calcular_bst_lim_mesa() {
        return 0.56 * Math.sqrt(this.modulo_e * 1000 / this.fyk)
    }

    calcular_cm(msd_max: number, msd_min: number) {
        if (Math.abs(msd_max) > Math.abs(msd_min))
            return (0.6 - 0.4 * msd_min / msd_max)

        return (0.6 - 0.4 * msd_max / msd_min)
    }

    // ========================================================================
    //   VERIFICAÇÃO DE COMPRESSÃO – JSON
    // ========================================================================
    verificar_compressao() {

        const mensagens: any[] = []

        mensagens.push(this.msg("titulo",
            `Dimensionamento do ${this.descricao_el} com o perfil ${this.props_perfil.nome}`
        ))

        const bst_alma = this.props_perfil.dlinha / this.props_perfil.tw
        let qs = 1
        let qa = 1

        // --- ALMA ---
        if (this.bst_lim_alma >= bst_alma) {

            mensagens.push(
                this.msg("texto",
                    `Alma compacta (b/t=${this.p_numero(bst_alma)} < lim=${this.p_numero(this.bst_lim_alma)})`
                )
            )

        } else {

            const bef =
                1.92 * this.props_perfil.tw *
                Math.sqrt(this.modulo_e * 1000 / this.fyk) *
                (1 - (0.34 / bst_alma) * Math.sqrt(this.modulo_e * 1000 / this.fyk))

            const aef =
                this.props_perfil.ag -
                Math.min(this.props_perfil.dlinha, bef) * this.props_perfil.tw

            qa = aef / this.props_perfil.ag

            mensagens.push(this.msg("texto", `Qa = ${this.p_numero(qa)}`))
        }

        // --- MESAS ---
        const bst_mesa = (this.props_perfil.bf / 2) / this.props_perfil.tf

        if (this.bst_lim_mesa >= bst_mesa) {

            mensagens.push(
                this.msg("texto",
                    `Mesas compactas (b/t=${this.p_numero(bst_mesa)} < lim=${this.p_numero(this.bst_lim_mesa)})`
                )
            )

        } else {

            const lim1 = 0.56 * Math.sqrt((this.modulo_e * 1000) / this.fyk)
            const lim2 = 1.03 * Math.sqrt((this.modulo_e * 1000) / this.fyk)

            if (bst_mesa > lim1 && bst_mesa <= lim2) {
                qs = 1.415 - 0.74 * bst_mesa * Math.sqrt(this.fyk / (this.modulo_e * 1000))
            } else if (bst_mesa > lim2) {
                qs = 0.69 * this.modulo_e * 1000 / (this.fyk * bst_mesa ** 2)
            }

            mensagens.push(this.msg("texto", `Qs = ${this.p_numero(qs)}`))
        }

        this.q = qs * qa
        mensagens.push(this.msg("texto", `Q = ${this.p_numero(this.q)}`))

        // --- Resistência normal ---
        const nex =
            Math.PI ** 2 * this.modulo_e * 100 * this.props_perfil.ix /
            ((this.kx * this.lx * 100) ** 2)

        const ney =
            Math.PI ** 2 * this.modulo_e * 100 * this.props_perfil.iy /
            ((this.ky * this.ly * 100) ** 2)

        this.b1_x = this.cm_x / (Math.abs(this.esforcos.nsd_min) / nex)
        this.b1_y = this.cm_y / (Math.abs(this.esforcos.nsd_min) / ney)

        const lambda0_x =
            Math.sqrt(this.q * this.props_perfil.ag * this.fyk * 0.1 / nex)

        const lambda0_y =
            Math.sqrt(this.q * this.props_perfil.ag * this.fyk * 0.1 / ney)

        const xi_x = lambda0_x < 1.5 ? 0.658 ** (lambda0_x ** 2) : 0.877 / lambda0_x ** 2
        const xi_y = lambda0_y < 1.5 ? 0.658 ** (lambda0_y ** 2) : 0.877 / lambda0_y ** 2

        this.nrdx_comp = xi_x * this.q * this.props_perfil.ag * this.fyk * 0.1 / this.gama_a1
        this.nrdy_comp = xi_y * this.q * this.props_perfil.ag * this.fyk * 0.1 / this.gama_a1

        this.nrd = Math.min(this.nrdx_comp, this.nrdy_comp)

        return {
            passa: true,
            mensagens,
            valores: {
                qa, qs,
                Q: this.q,
                b1_x: this.b1_x,
                b1_y: this.b1_y,
                nrd: this.nrd
            }
        }
    }

    // ========================================================================
    //   VERIFICAÇÃO À FLEXO-COMPRESSÃO – JSON
    // ========================================================================
    verificar_flexocompressao() {

        const mensagens: any[] = []

        this.msd_max_x =
            Math.max(
                Math.abs(this.esforcos.msd_max_x),
                Math.abs(this.esforcos.msd_min_x)
            ) * this.b1_x

        this.msd_max_y =
            Math.max(
                Math.abs(this.esforcos.msd_max_y),
                Math.abs(this.esforcos.msd_min_y)
            ) * this.b1_y

        const lambda_y_flm = (this.props_perfil.bf / 2) / this.props_perfil.h
        const mply = this.fyk * 1000 * (this.props_perfil.zy / 1e6)
        const lambda_p = 0.38 * Math.sqrt(this.modulo_e * 1e6 / (this.fyk * 1000))
        const lambda_r = 0.83 * Math.sqrt(this.modulo_e * 1e6 / (0.7 * this.fyk * 1000))
        const mcr = (0.69 * this.modulo_e * 1e6 * (this.props_perfil.wy / 1e6)) / lambda_y_flm ** 2

        let mrd = 0

        if (lambda_y_flm <= lambda_p) mrd = mply / this.gama_a1
        else if (lambda_y_flm <= lambda_r)
            mrd = (mply - (mply - mcr) * (lambda_y_flm - lambda_p) / (lambda_r - lambda_p)) / this.gama_a1
        else mrd = mcr / this.gama_a1

        this.mrdy = mrd

        mensagens.push(this.msg("texto", `MRdy = ${this.p_numero(mrd)}`))

        return {
            mensagens,
            valores: {
                msd_max_x: this.msd_max_x,
                msd_max_y: this.msd_max_y,
                mrd_y: this.mrdy
            }
        }
    }

    // ========================================================================
    //   VERIFICAÇÃO FINAL – JSON
    // ========================================================================
    verificar_perfil() {

        const mensagens: any[] = []

        const flexao =
            Math.abs(this.esforcos.msd_min_x) !== 0 ||
            Math.abs(this.esforcos.msd_max_x) !== 0

        const comp = this.verificar_compressao()
        mensagens.push(...comp.mensagens)

        let flex: any = null
        let conclusao: number | null = null

        if (flexao && this.esforcos.nsd_min < 0) {

            mensagens.push(this.msg("titulo", "Verificação à Flexo-Compressão"))

            flex = this.verificar_flexocompressao()
            mensagens.push(...flex.mensagens)

            const rel = Math.abs(this.esforcos.nsd_min) / this.nrd

            let k

            if (rel >= 0.2)
                k = rel + (8 / 9) * (this.msd_max_x / this.mrdx + this.msd_max_y / this.mrdy)
            else
                k = rel / 2 + (this.msd_max_x / this.mrdx + this.msd_max_y / this.mrdy)

            conclusao = k

            mensagens.push(
                this.msg("titulo",
                    `Conclusão: ${this.p_numero(k)} ${k <= 1 ? "< 1 (OK)" : "≥ 1 (FALHA)"}`
                )
            )
        }

        return this.toJSON()
    }
    toJSON() {
        return {
            props_perfil: this.props_perfil,
            esforcos: this.esforcos,
            lx: this.lx,
            ly: this.ly,
            lz: this.lz,
            kx: this.kx,
            ky: this.ky,
            fyk: this.fyk,
            fu: this.fu,
            modulo_e: this.modulo_e,
            lambda_x: this.lambda_x,
            lambda_y: this.lambda_y,
            aplicacao_perfil: this.aplicacao_perfil,
            bst_lim_alma: this.bst_lim_alma,
            bst_lim_mesa: this.bst_lim_mesa,
            q: this.q,
            nrd: this.nrd,
            nrdx_comp: this.nrdx_comp,
            nrdy_comp: this.nrdy_comp,
            mrdx: this.mrdx,
            mrdy: this.mrdy,
            mrdz: this.mrdz,
            gama_a1: this.gama_a1,
            descricao_el: this.descricao_el,
            topo_livre: this.topo_livre,
            modulo_e_g: this.modulo_e_g,
            cm_x: this.cm_x,
            cm_y: this.cm_y,
            b1_x: this.b1_x,
            b1_y: this.b1_y,
            msd_max_x: this.msd_max_x,
            msd_max_y: this.msd_max_y
        };
    }
}

