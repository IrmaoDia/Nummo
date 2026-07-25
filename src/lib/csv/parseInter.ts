import Papa from 'papaparse'
import type { ResultadoParse } from './types'
import type { LinhaImportada } from './types'

/** minúsculas, sem acento e sem espaços nas pontas — para comparar rótulos. */
function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .trim()
}

/**
 * Converte número no formato brasileiro para Number.
 * Ponto é separador de MILHAR e vírgula é decimal: "-1.000,00" → -1000.
 * Retorna null quando não é um número válido.
 */
export function parseValorBR(bruto: string): number | null {
  const s = (bruto ?? '').trim()
  if (!s) return null
  // Mantém apenas dígitos, sinal, ponto e vírgula.
  const limpo = s.replace(/[^\d,.-]/g, '')
  if (!limpo || !/\d/.test(limpo)) return null
  const numerico = limpo.replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(numerico)
  return Number.isFinite(n) ? n : null
}

/** "25/07/2026" → "2026-07-25". Retorna null se a data for inválida. */
export function parseDataBR(bruto: string): string | null {
  const m = (bruto ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, dia, mes, ano] = m
  const d = Number(dia)
  const mo = Number(mes)
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return `${ano}-${mes}-${dia}`
}

/** Colapsa espaços múltiplos, apara as pontas e limita a 120 caracteres. */
export function limparTitulo(bruto: string): string {
  return (bruto ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
}

/**
 * Localiza a linha de cabeçalho das colunas (a que contém "Data" e "Valor") e
 * devolve o texto a partir dela — descartando as linhas de resumo do topo.
 * Assim o import não quebra se o banco mudar a quantidade de linhas iniciais.
 */
function cortarCabecalhoResumo(texto: string): string | null {
  const linhas = texto.split(/\r?\n/)
  const idx = linhas.findIndex((l) => {
    const n = normalizar(l)
    return n.includes('data') && n.includes('valor') && l.includes(';')
  })
  if (idx === -1) return null
  return linhas.slice(idx).join('\n')
}

/** Acha o índice de uma coluna pelo nome normalizado (aceita variações). */
function acharColuna(cabecalhos: string[], ...candidatos: string[]): number {
  const norm = cabecalhos.map(normalizar)
  for (const c of candidatos) {
    const alvo = normalizar(c)
    const i = norm.findIndex((h) => h === alvo || h.startsWith(alvo) || h.includes(alvo))
    if (i !== -1) return i
  }
  return -1
}

/**
 * Parser do extrato do Banco Inter (CSV, separador ';', números em pt-BR).
 * Ignora as linhas de resumo do topo, a coluna Saldo e linhas sem valor válido.
 */
export function parseInter(texto: string): ResultadoParse {
  const vazio: ResultadoParse = { linhas: [], ignoradas: 0, inicio: null, fim: null }
  if (!texto || !texto.trim()) return vazio

  const semResumo = cortarCabecalhoResumo(texto)
  if (!semResumo) return vazio

  const parsed = Papa.parse<string[]>(semResumo, {
    delimiter: ';',
    skipEmptyLines: true,
  })

  const linhasCsv = (parsed.data ?? []).filter((l) => Array.isArray(l) && l.length > 0)
  if (linhasCsv.length < 2) return vazio

  const cabecalho = linhasCsv[0].map((c) => String(c ?? ''))
  const iData = acharColuna(cabecalho, 'data lancamento', 'data')
  const iHistorico = acharColuna(cabecalho, 'historico')
  const iDescricao = acharColuna(cabecalho, 'descricao')
  const iValor = acharColuna(cabecalho, 'valor')
  if (iData === -1 || iValor === -1) return vazio

  const linhas: LinhaImportada[] = []
  let ignoradas = 0

  for (const bruta of linhasCsv.slice(1)) {
    const celulas = bruta.map((c) => String(c ?? ''))
    // Descarta linhas completamente vazias.
    if (celulas.every((c) => !c.trim())) continue

    const data = parseDataBR(celulas[iData] ?? '')
    const valorBruto = parseValorBR(celulas[iValor] ?? '')
    // Valor zero é descartado: não representa movimento e o banco exige > 0.
    if (!data || valorBruto === null || valorBruto === 0) {
      ignoradas++
      continue
    }

    const descricao = iDescricao !== -1 ? celulas[iDescricao] : ''
    const historico = iHistorico !== -1 ? limparTitulo(celulas[iHistorico]) : ''
    // Título vem da Descrição; se faltar, cai no Histórico para não ficar vazio.
    const titulo = limparTitulo(descricao) || historico || 'Lançamento'

    linhas.push({
      data,
      titulo,
      // Negativo → gasto; positivo (ou zero) → entrada. Valor sempre positivo.
      tipo: valorBruto < 0 ? 'gasto' : 'entrada',
      valor: Math.abs(valorBruto),
      categoria: 'sem_categoria',
      historico,
    })
  }

  const datas = linhas.map((l) => l.data).sort()
  return {
    linhas,
    ignoradas,
    inicio: datas[0] ?? null,
    fim: datas[datas.length - 1] ?? null,
  }
}
