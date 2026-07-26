import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, toDate } from './format'
import { CATEGORIA_LABEL, TIPO_LABEL } from './labels'
import type { Lancamento } from '../types'

/** Paleta da marca, em RGB (o jsPDF não entende hex com alpha nem CSS vars). */
const MARINHO: [number, number, number] = [22, 33, 46] // #16212E
const VERDE: [number, number, number] = [52, 199, 89] // #34C759
const VERMELHO: [number, number, number] = [255, 59, 48] // #FF3B30
const DOURADO: [number, number, number] = [198, 164, 92] // acento do cabeçalho
const CINZA: [number, number, number] = [122, 132, 145]
const LINHA: [number, number, number] = [226, 230, 235]

const MARGEM = 40

interface ResumoPdf {
  entradas: number
  gastos: number
  saldo: number
}

function totais(lancamentos: Lancamento[]): ResumoPdf {
  let entradas = 0
  let gastos = 0
  for (const l of lancamentos) {
    if (l.tipo === 'entrada') entradas += l.valor
    else gastos += l.valor
  }
  return { entradas, gastos, saldo: entradas - gastos }
}

/** Cabeçalho da marca + título do extrato. Devolve o Y onde o corpo começa. */
function desenharCabecalho(doc: jsPDF, perfil: string, periodo: string): number {
  const largura = doc.internal.pageSize.getWidth()

  doc.setFillColor(...MARINHO)
  doc.rect(0, 0, largura, 76, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('times', 'normal')
  doc.setFontSize(24)
  doc.text('Nummo', MARGEM, 38)

  // Filete dourado sob a marca.
  doc.setDrawColor(...DOURADO)
  doc.setLineWidth(1.5)
  doc.line(MARGEM, 46, MARGEM + 62, 46)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 198, 208)
  doc.text(`Extrato — ${perfil}`, MARGEM, 62)
  doc.text(periodo, largura - MARGEM, 62, { align: 'right' })

  return 100
}

/** Três blocos de resumo lado a lado. Devolve o Y após os cartões. */
function desenharResumo(doc: jsPDF, y: number, r: ResumoPdf): number {
  const largura = doc.internal.pageSize.getWidth()
  const util = largura - MARGEM * 2
  const gap = 12
  const w = (util - gap * 2) / 3
  const h = 56

  const cartoes: { rotulo: string; valor: number; cor: [number, number, number] }[] = [
    { rotulo: 'Entradas', valor: r.entradas, cor: VERDE },
    { rotulo: 'Gastos', valor: r.gastos, cor: VERMELHO },
    { rotulo: 'Saldo', valor: r.saldo, cor: r.saldo < 0 ? VERMELHO : VERDE },
  ]

  cartoes.forEach((c, i) => {
    const x = MARGEM + i * (w + gap)
    doc.setFillColor(248, 249, 251)
    doc.setDrawColor(...LINHA)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, w, h, 8, 8, 'FD')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...CINZA)
    doc.text(c.rotulo.toUpperCase(), x + 12, y + 20)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...c.cor)
    doc.text(formatCurrency(c.valor), x + 12, y + 40)
  })

  return y + h + 24
}

/** Rodapé com a assinatura do app e a paginação, em todas as páginas. */
function desenharRodape(doc: jsPDF) {
  const largura = doc.internal.pageSize.getWidth()
  const altura = doc.internal.pageSize.getHeight()
  const total = doc.getNumberOfPages()
  const gerado = `Gerado pelo Nummo em ${format(new Date(), 'dd/MM/yyyy')}`

  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...CINZA)
    doc.text(gerado, MARGEM, altura - 24)
    doc.text(`${p} de ${total}`, largura - MARGEM, altura - 24, { align: 'right' })
  }
}

/**
 * Monta o relatório de extrato em PDF. Os lançamentos já devem vir filtrados
 * pelo período e ordenados por data (ver `filtrarPorPeriodo`).
 */
export function gerarExtratoPDF(
  lancamentos: Lancamento[],
  perfil: string,
  periodo: string,
): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const inicioCorpo = desenharCabecalho(doc, perfil, periodo)
  const y = desenharResumo(doc, inicioCorpo, totais(lancamentos))

  autoTable(doc, {
    startY: y,
    margin: { left: MARGEM, right: MARGEM, bottom: 48 },
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: lancamentos.map((l) => [
      format(toDate(l.data), 'dd/MM/yyyy'),
      l.titulo,
      CATEGORIA_LABEL[l.categoria],
      TIPO_LABEL[l.tipo],
      formatCurrency(l.tipo === 'gasto' ? -l.valor : l.valor),
    ]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: MARINHO },
    headStyles: { fillColor: MARINHO, textColor: [255, 255, 255], fontSize: 8, halign: 'left' },
    alternateRowStyles: { fillColor: [248, 249, 251] },
    columnStyles: {
      0: { cellWidth: 62 },
      2: { cellWidth: 80 },
      3: { cellWidth: 52 },
      4: { cellWidth: 78, halign: 'right' },
    },
    // Entrada em verde, gasto em vermelho — só na coluna de valor.
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 4) return
      const l = lancamentos[data.row.index]
      if (!l) return
      data.cell.styles.textColor = l.tipo === 'entrada' ? VERDE : VERMELHO
      data.cell.styles.fontStyle = 'bold'
    },
  })

  if (lancamentos.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...CINZA)
    doc.text('Nenhum lançamento neste período.', MARGEM, y + 40)
  }

  desenharRodape(doc)
  return doc.output('blob')
}
