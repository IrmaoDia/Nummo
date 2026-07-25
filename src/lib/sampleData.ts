import type { Categoria, Lancamento, Tipo } from '../types'

interface Modelo {
  titulo: string
  tipo: Tipo
  categoria: Categoria
  min: number
  max: number
}

const MODELOS: Modelo[] = [
  { titulo: 'Venda Hotmart', tipo: 'entrada', categoria: 'empresa', min: 197, max: 2500 },
  { titulo: 'Pagamento de cliente', tipo: 'entrada', categoria: 'empresa', min: 800, max: 6000 },
  { titulo: 'Mentoria', tipo: 'entrada', categoria: 'empresa', min: 500, max: 2000 },
  { titulo: 'Comissão de afiliado', tipo: 'entrada', categoria: 'empresa', min: 80, max: 900 },
  { titulo: 'Salário', tipo: 'entrada', categoria: 'pessoa_fisica', min: 4000, max: 4000 },
  { titulo: 'Freelance de design', tipo: 'entrada', categoria: 'pessoa_fisica', min: 600, max: 2500 },
  { titulo: 'Reembolso', tipo: 'entrada', categoria: 'sem_categoria', min: 50, max: 400 },
  { titulo: 'Anúncios Meta', tipo: 'gasto', categoria: 'empresa', min: 150, max: 1800 },
  { titulo: 'Anúncios Google', tipo: 'gasto', categoria: 'empresa', min: 120, max: 1200 },
  { titulo: 'Assinatura Notion', tipo: 'gasto', categoria: 'empresa', min: 40, max: 60 },
  { titulo: 'Hospedagem do site', tipo: 'gasto', categoria: 'empresa', min: 30, max: 250 },
  { titulo: 'Ferramenta de e-mail', tipo: 'gasto', categoria: 'empresa', min: 90, max: 300 },
  { titulo: 'Contador', tipo: 'gasto', categoria: 'empresa', min: 250, max: 500 },
  { titulo: 'Impostos (DAS)', tipo: 'gasto', categoria: 'empresa', min: 300, max: 1400 },
  { titulo: 'Aluguel do escritório', tipo: 'gasto', categoria: 'empresa', min: 1200, max: 1200 },
  { titulo: 'Supermercado', tipo: 'gasto', categoria: 'pessoa_fisica', min: 120, max: 700 },
  { titulo: 'Almoço', tipo: 'gasto', categoria: 'sem_categoria', min: 25, max: 90 },
  { titulo: 'Uber', tipo: 'gasto', categoria: 'sem_categoria', min: 12, max: 80 },
  { titulo: 'Conta de luz', tipo: 'gasto', categoria: 'pessoa_fisica', min: 90, max: 320 },
  { titulo: 'Internet', tipo: 'gasto', categoria: 'pessoa_fisica', min: 100, max: 160 },
  { titulo: 'Curso online', tipo: 'gasto', categoria: 'pessoa_fisica', min: 47, max: 1200 },
  { titulo: 'Academia', tipo: 'gasto', categoria: 'pessoa_fisica', min: 89, max: 150 },
]

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'seed-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Gera ~40 lançamentos fictícios (3 meses) para um perfil, para testar os gráficos.
 */
export function generateSampleData(perfilId: string, reference: Date = new Date()): Lancamento[] {
  const out: Lancamento[] = []
  const entradas = MODELOS.filter((m) => m.tipo === 'entrada')
  const gastos = MODELOS.filter((m) => m.tipo === 'gasto')

  for (let back = 2; back >= 0; back--) {
    const base = new Date(reference.getFullYear(), reference.getMonth() - back, 1)
    const year = base.getFullYear()
    const month = base.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const maxDay = back === 0 ? Math.min(reference.getDate(), daysInMonth) : daysInMonth
    const qtdEntradas = 4 + Math.floor(Math.random() * 2)
    const qtdGastos = 8 + Math.floor(Math.random() * 3)

    const criar = (modelo: Modelo) => {
      const dia = 1 + Math.floor(Math.random() * maxDay)
      const valor = Math.round(rand(modelo.min, modelo.max) * 100) / 100
      const dataISO = `${year}-${pad(month + 1)}-${pad(dia)}`
      const criado = new Date(year, month, dia, 9, 0, 0).toISOString()
      out.push({
        id: uuid(),
        perfilId,
        titulo: modelo.titulo,
        data: dataISO,
        tipo: modelo.tipo,
        valor,
        categoria: modelo.categoria,
        criadoEm: criado,
        atualizadoEm: criado,
      })
    }

    for (let i = 0; i < qtdEntradas; i++) criar(pick(entradas))
    for (let i = 0; i < qtdGastos; i++) criar(pick(gastos))
  }

  return out.sort((a, b) => a.data.localeCompare(b.data))
}
