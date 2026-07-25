import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { limparTitulo, parseDataBR, parseInter, parseValorBR } from '../parseInter'

/** Cabeçalho real do extrato do Inter, com as 4 linhas de resumo e a linha vazia. */
const CABECALHO = [
  'Extrato Conta Corrente',
  'Conta ;202893324',
  'Período ;25/06/2026 a 25/07/2026',
  'Saldo ;3.959,97',
  '',
  'Data Lançamento;Histórico;Descrição;Valor;Saldo',
].join('\n')

const arquivo = (...linhas: string[]) => [CABECALHO, ...linhas].join('\n')

describe('parseValorBR', () => {
  it('trata ponto como milhar e vírgula como decimal', () => {
    expect(parseValorBR('-1.000,00')).toBe(-1000)
    expect(parseValorBR('1.000,00')).toBe(1000)
    expect(parseValorBR('-45,98')).toBe(-45.98)
    expect(parseValorBR('3.959,97')).toBe(3959.97)
    expect(parseValorBR('1.234.567,89')).toBe(1234567.89)
  })

  it('rejeita valores não numéricos', () => {
    expect(parseValorBR('')).toBeNull()
    expect(parseValorBR('   ')).toBeNull()
    expect(parseValorBR('abc')).toBeNull()
  })
})

describe('parseDataBR', () => {
  it('converte dd/mm/aaaa para ISO', () => {
    expect(parseDataBR('25/07/2026')).toBe('2026-07-25')
    expect(parseDataBR('01/01/2026')).toBe('2026-01-01')
  })

  it('rejeita datas inválidas', () => {
    expect(parseDataBR('2026-07-25')).toBeNull()
    expect(parseDataBR('32/13/2026')).toBeNull()
    expect(parseDataBR('')).toBeNull()
  })
})

describe('limparTitulo', () => {
  it('colapsa espaços múltiplos e apara as pontas', () => {
    expect(limparTitulo('Lojas Americanas 361   Sao Luis      Bra')).toBe(
      'Lojas Americanas 361 Sao Luis Bra',
    )
  })

  it('limita a 120 caracteres', () => {
    expect(limparTitulo('x'.repeat(200))).toHaveLength(120)
  })
})

describe('parseInter — amostras reais', () => {
  it('converte uma compra no débito (valor negativo → gasto)', () => {
    const r = parseInter(
      arquivo('25/07/2026;Compra no débito;Lojas Americanas 361   Sao Luis      Bra;-45,98;3.959,97'),
    )
    expect(r.linhas).toHaveLength(1)
    expect(r.linhas[0]).toMatchObject({
      data: '2026-07-25',
      titulo: 'Lojas Americanas 361 Sao Luis Bra',
      tipo: 'gasto',
      valor: 45.98,
      categoria: 'sem_categoria',
    })
  })

  it('converte um Pix recebido (valor positivo → entrada)', () => {
    const r = parseInter(arquivo('24/07/2026;Pix recebido;Lmg Empreendimentos Ltda;1.000,00;5.313,95'))
    expect(r.linhas[0]).toMatchObject({
      data: '2026-07-24',
      titulo: 'Lmg Empreendimentos Ltda',
      tipo: 'entrada',
      valor: 1000,
    })
  })

  it('aceita histórico com espaço sobrando no fim', () => {
    const r = parseInter(
      arquivo('24/07/2026;Pix enviado ;Facebook Servicos Online Do Brasil Ltda;-1.100,00;4.313,95'),
    )
    expect(r.linhas[0]).toMatchObject({ tipo: 'gasto', valor: 1100 })
    expect(r.linhas[0].historico).toBe('Pix enviado')
  })

  it('descarta linhas vazias e as linhas de resumo do topo', () => {
    const r = parseInter(
      arquivo(
        '25/07/2026;Compra no débito;Loja A;-10,00;100,00',
        '',
        '   ',
        '24/07/2026;Pix recebido;Fulano;20,00;120,00',
      ),
    )
    expect(r.linhas).toHaveLength(2)
    // nada do resumo virou lançamento
    expect(r.linhas.some((l) => /Extrato|Conta|Saldo|Período/i.test(l.titulo))).toBe(false)
  })

  it('ignora a coluna Saldo por completo', () => {
    const r = parseInter(arquivo('25/07/2026;Compra no débito;Loja A;-10,00;9.999,99'))
    expect(r.linhas[0].valor).toBe(10)
  })

  it('sempre grava valor positivo, com o sinal virando o tipo', () => {
    const r = parseInter(
      arquivo(
        '25/07/2026;Compra no débito;Gasto X;-45,98;0,00',
        '25/07/2026;Pix recebido;Entrada Y;45,98;0,00',
      ),
    )
    expect(r.linhas.every((l) => l.valor > 0)).toBe(true)
    expect(r.linhas.map((l) => l.tipo)).toEqual(['gasto', 'entrada'])
  })

  it('detecta o intervalo de datas do arquivo', () => {
    const r = parseInter(
      arquivo(
        '25/07/2026;Compra no débito;A;-1,00;0,00',
        '25/06/2026;Pix recebido;B;2,00;0,00',
        '10/07/2026;Pix enviado;C;-3,00;0,00',
      ),
    )
    expect(r.inicio).toBe('2026-06-25')
    expect(r.fim).toBe('2026-07-25')
  })

  it('conta como ignoradas as linhas com valor inválido', () => {
    const r = parseInter(
      arquivo('25/07/2026;Compra;Boa;-1,00;0,00', '25/07/2026;Compra;Ruim;abc;0,00'),
    )
    expect(r.linhas).toHaveLength(1)
    expect(r.ignoradas).toBe(1)
  })

  it('94 linhas de dados resultam em 94 lançamentos, com somas corretas', () => {
    const linhas: string[] = []
    // 50 gastos de 10,00 e 44 entradas de 20,00
    for (let i = 0; i < 50; i++) linhas.push(`25/07/2026;Compra no débito;Gasto ${i};-10,00;0,00`)
    for (let i = 0; i < 44; i++) linhas.push(`24/07/2026;Pix recebido;Entrada ${i};20,00;0,00`)
    const r = parseInter(arquivo(...linhas))

    expect(r.linhas).toHaveLength(94)
    const gastos = r.linhas.filter((l) => l.tipo === 'gasto')
    const entradas = r.linhas.filter((l) => l.tipo === 'entrada')
    expect(gastos).toHaveLength(50)
    expect(entradas).toHaveLength(44)
    expect(gastos.reduce((s, l) => s + l.valor, 0)).toBeCloseTo(500, 2)
    expect(entradas.reduce((s, l) => s + l.valor, 0)).toBeCloseTo(880, 2)
  })

  it('devolve vazio para arquivo que não é extrato', () => {
    expect(parseInter('qualquer,coisa\n1,2').linhas).toHaveLength(0)
    expect(parseInter('').linhas).toHaveLength(0)
  })
})

describe('parseInter — arquivo real completo', () => {
  const csv = readFileSync(
    fileURLToPath(new URL('./fixtures/extrato-inter.csv', import.meta.url)),
    'utf8',
  )
  const r = parseInter(csv)

  it('lê todas as 8 linhas de dados do arquivo', () => {
    expect(r.linhas).toHaveLength(8)
    expect(r.ignoradas).toBe(0)
  })

  it('detecta o período completo do extrato', () => {
    expect(r.inicio).toBe('2026-06-25')
    expect(r.fim).toBe('2026-07-25')
  })

  it('soma entradas e gastos conforme o cálculo manual', () => {
    const entradas = r.linhas.filter((l) => l.tipo === 'entrada')
    const gastos = r.linhas.filter((l) => l.tipo === 'gasto')
    // 1.000,00 + 12,35 + 4.500,00
    expect(entradas.reduce((s, l) => s + l.valor, 0)).toBeCloseTo(5512.35, 2)
    // 45,98 + 1.100,00 + 289,45 + 432,10 + 200,00
    expect(gastos.reduce((s, l) => s + l.valor, 0)).toBeCloseTo(2067.53, 2)
  })

  it('nunca grava valor negativo e sempre define categoria', () => {
    expect(r.linhas.every((l) => l.valor > 0)).toBe(true)
    expect(r.linhas.every((l) => l.categoria === 'sem_categoria')).toBe(true)
  })

  it('colapsa espaços do título vindo da Descrição', () => {
    expect(r.linhas.map((l) => l.titulo)).toContain('Lojas Americanas 361 Sao Luis Bra')
    expect(r.linhas.map((l) => l.titulo)).toContain('Supermercado Mateus Sao Luis')
  })
})
