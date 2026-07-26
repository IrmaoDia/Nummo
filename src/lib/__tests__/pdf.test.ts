import { describe, expect, it } from 'vitest'
import { gerarExtratoPDF } from '../pdf'
import type { Lancamento } from '../../types'

function make(i: number): Lancamento {
  return {
    id: `id-${i}`,
    perfilId: 'p1',
    titulo: `Lançamento de teste ${i} — com descrição longa o bastante para quebrar linha`,
    data: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`,
    tipo: i % 3 === 0 ? 'entrada' : 'gasto',
    valor: 100 + i * 37.55,
    categoria: i % 2 === 0 ? 'empresa' : 'pessoa_fisica',
    criadoEm: '2026-07-01T00:00:00.000Z',
    atualizadoEm: '2026-07-01T00:00:00.000Z',
  }
}

describe('gerarExtratoPDF', () => {
  it('pagina extratos longos e mantém cabeçalho, resumo e rodapé', async () => {
    const itens = Array.from({ length: 60 }, (_, i) => make(i)).sort((a, b) =>
      a.data.localeCompare(b.data),
    )
    const bytes = Buffer.from(
      await gerarExtratoPDF(itens, 'Pessoal', '01/07/2026 a 31/07/2026').arrayBuffer(),
    ).toString('latin1')

    expect(bytes.match(/\/Type \/Page[^s]/g)?.length).toBeGreaterThan(1)
    for (const esperado of ['Nummo', 'ENTRADAS', 'GASTOS', 'SALDO', 'Gerado pelo Nummo em']) {
      expect(bytes).toContain(esperado)
    }
  })

  it('não quebra com lista vazia', () => {
    expect(gerarExtratoPDF([], 'Pessoal', 'Todo o período').size).toBeGreaterThan(500)
  })
})
