# Nummo

Aplicativo web local de **controle financeiro mensal**, com visual inspirado nos
apps nativos da Apple (Calendar, Reminders, Health). Cada lançamento é uma
**Entrada** ou um **Gasto** registrado em um dia do calendário, dentro de um
**Perfil** (espaço financeiro independente — ex.: "Pessoal", "Minha Empresa").

Navegação em **sidebar** à esquerda (recolhível, `Cmd/Ctrl+B`), com três visões
que compartilham filtros e barra de resumo:

- **Por Dia** — calendário estilo Apple (hoje em círculo vermelho, hover com "+", drag & drop de lançamentos entre dias).
- **Por Tipo** — kanban (Entrada / Gasto / Sem categoria) com arrastar para mudar o tipo.
- **Resumo** — dashboard com seletor de período (mês / 3 / 6 meses / ano) e gráficos (entradas×gastos, saldo acumulado, gastos por categoria, top categorias, 6 meses, maiores lançamentos).

**Perfis:** cada perfil tem lançamentos, totais e gráficos totalmente separados;
trocar de perfil recarrega tudo. Há ainda o modo **"Todos os perfis"**
(consolidado). Perfis são criados/editados/excluídos em *Configurações*.

Tudo em português do Brasil, moeda em Real (BRL), com tema **Claro / Escuro / Sistema**.

## Stack

Vite · React 18 + TypeScript (strict) · Tailwind CSS v3 · Framer Motion ·
Recharts · lucide-react · date-fns (ptBR) · react-hook-form + zod ·
**Supabase** (Postgres + Auth, com RLS) · **TanStack Query** (cache + atualização otimista).

A persistência fica na nuvem (Supabase), atrás de uma camada abstrata em
[`src/lib/repository.ts`](src/lib/repository.ts) — nenhum componente importa o
cliente Supabase diretamente. Login por e-mail/senha; cada usuário só enxerga os
próprios dados (RLS no servidor). O Dexie/IndexedDB permanece só como origem da
**migração** dos dados locais antigos.

## Como rodar

Antes: siga o **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** (criar `.env.local`, rodar
`supabase/schema.sql`, ativar o provider de e-mail).

```bash
npm install
npm run dev      # sobe em http://localhost:5173
```

Outros scripts:

```bash
npm run build    # type-check + build de produção
npm run lint     # oxlint
npm run seed     # gera public/seed.json (~40 lançamentos em 3 meses)
```

## Dados de exemplo

Duas formas de popular o app para testar os gráficos:

- **Menu ⋯ › Carregar dados de exemplo** — gera e insere os lançamentos direto no navegador (mais rápido).
- **`npm run seed`** — gera `public/seed.json`; depois use **Menu ⋯ › Importar JSON** para carregá-lo.

## Exportar / Importar

Pelo menu **⋯** no cabeçalho: exportar **JSON** (inclui perfis + lançamentos,
reimportável) ou **CSV** (amigável ao Excel-BR), e importar **JSON** com prévia
antes de confirmar. Na importação, perfis inexistentes são recriados (casando por
nome); lançamentos sem perfil vão para o perfil ativo.

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| `1` / `2` / `3` | alternar entre Por Dia / Por Tipo / Resumo |
| `←` / `→` | mês anterior / próximo |
| `T` | ir para hoje |
| `N` | novo lançamento |
| `Cmd/Ctrl + B` | recolher / expandir a sidebar |
| `Cmd/Ctrl + P` | abrir o seletor de perfil |
| `Esc` | fechar modal |
| `Cmd/Ctrl + Enter` | salvar no modal |

## Estrutura

```
src/
  contexts/    ProfileContext
  lib/         db (Dexie v2), migrations, repository, format, calendar, stats, schema, io, sampleData
  hooks/       useLancamentos, usePerfis, useMonth, useTheme, useFilters, useEntryModal, useKeyboardShortcuts, useMediaQuery
  components/
    ui/        Button, SegmentedControl, Modal, Tooltip, Popover, Toast, Input, CurrencyInput, ...
    layout/    Sidebar, SidebarNavItem, MobileTabBar, Header, SummaryBar, PeriodSelector
    profile/   ProfileSwitcher, ProfilePopover, ManageProfilesModal, ProfileForm, ProfileAvatar
    calendar/  CalendarView, CalendarGrid, DayCell, EntryChip, AddButton, DayPopover, MobileAgenda
    board/     KanbanBoard, KanbanColumn, EntryCard
    dashboard/ ResumoView, KpiCard, WeeklyBarChart, BalanceAreaChart, CategoryDonut, CategoryBars, MonthlyComparison, TopEntries
    entry/     EntryModal, EntryForm, DateField
    filters/   FilterPopover, ActiveFilterChips
    data/      DataMenu, ImportPreviewModal
```

Abaixo de 768px a sidebar vira uma **tab bar inferior** e o calendário vira uma
lista agrupada por dia; entre 768–1023px a sidebar inicia recolhida.
