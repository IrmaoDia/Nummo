import { isSameMonth, startOfMonth } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { KanbanBoard } from './components/board/KanbanBoard'
import { CalendarView } from './components/calendar/CalendarView'
import { DataMenu } from './components/data/DataMenu'
import { MigrateModal } from './components/data/MigrateModal'
import { ActiveFilterChips } from './components/filters/ActiveFilterChips'
import { FilterPopover } from './components/filters/FilterPopover'
import { Header } from './components/layout/Header'
import { MobileTabBar } from './components/layout/MobileTabBar'
import { Sidebar } from './components/layout/Sidebar'
import { SummaryBar } from './components/layout/SummaryBar'
import { WelcomeModal } from './components/onboarding/WelcomeModal'
import { ManageProfilesModal } from './components/profile/ManageProfilesModal'
import { ContentSkeleton } from './components/ui/Skeleton'
import { OfflineBanner } from './components/ui/OfflineBanner'
import { useToast } from './components/ui/Toast'
import { useAuth } from './contexts/AuthContext'
import { useProfile } from './contexts/ProfileContext'
import { useEntryModal } from './hooks/useEntryModal'
import { useFilters } from './hooks/useFilters'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useLancamentos } from './hooks/useLancamentos'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useMonth } from './hooks/useMonth'
import { toISODate } from './lib/format'
import { filterByMonth, totais } from './lib/stats'
import type { Periodo, View } from './types'

const ResumoView = lazy(() =>
  import('./components/dashboard/ResumoView').then((m) => ({ default: m.ResumoView })),
)

const COLLAPSE_KEY = 'financas.sidebarCollapsed'

export function AppShell() {
  const [view, setView] = useState<View>('dia')
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const { month, direction, next, prev, goToday } = useMonth()
  const filters = useFilters()
  const { all, update, loading } = useLancamentos()
  const { openNew, openEdit, isOpen } = useEntryModal()
  const { activeId, isAll, perfis } = useProfile()
  const { user, justSignedUp, clearJustSignedUp } = useAuth()
  const { showToast } = useToast()

  // Boas-vindas: só após cadastro e uma única vez por usuário neste navegador.
  const [showWelcome, setShowWelcome] = useState(false)
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const onboardingKey = user ? `onboarding_visto_${user.id}` : ''

  useEffect(() => {
    const pendente =
      justSignedUp ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('onboarding_pendente') === '1')
    if (pendente && user && localStorage.getItem(`onboarding_visto_${user.id}`) !== '1') {
      setShowWelcome(true)
    }
  }, [justSignedUp, user])

  const marcarOnboardingVisto = () => {
    if (onboardingKey) localStorage.setItem(onboardingKey, '1')
    try {
      localStorage.removeItem('onboarding_pendente')
    } catch {
      /* ignore */
    }
    clearJustSignedUp()
  }

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const [userCollapsed, setUserCollapsed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1',
  )
  const collapsed = isTablet || userCollapsed
  const toggleCollapse = () => {
    setUserCollapsed((v) => {
      const nv = !v
      localStorage.setItem(COLLAPSE_KEY, nv ? '1' : '0')
      return nv
    })
  }

  const filteredAll = useMemo(() => filters.apply(all), [filters, all])
  const monthItems = useMemo(() => filterByMonth(all, month), [all, month])
  const filtered = useMemo(() => filterByMonth(filteredAll, month), [filteredAll, month])
  const resumo = useMemo(() => totais(filtered), [filtered])
  const hasAnyThisMonth = monthItems.length > 0
  const showSkeleton = loading && all.length === 0

  const defaultIso = isSameMonth(month, new Date())
    ? toISODate(new Date())
    : toISODate(startOfMonth(month))

  useKeyboardShortcuts({
    onPrevMonth: prev,
    onNextMonth: next,
    onToday: goToday,
    onNew: () => openNew({ data: defaultIso }),
    enabled: !isOpen && view !== 'resumo',
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        toggleCollapse()
        return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        document.querySelector<HTMLButtonElement>('[data-profile-switcher]')?.click()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typing || isOpen) return
      if (e.key === '1') setView('dia')
      else if (e.key === '2') setView('tipo')
      else if (e.key === '3') setView('resumo')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {!isMobile && (
        <Sidebar
          view={view}
          onViewChange={setView}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <Header
          view={view}
          month={month}
          periodo={periodo}
          onPrev={prev}
          onNext={next}
          onToday={goToday}
          onPeriodChange={setPeriodo}
          showProfileAvatar={isMobile}
          actionsSlot={<DataMenu />}
          activeChips={
            view === 'dia' ? (
              <ActiveFilterChips
                filtros={filters.filtros}
                onChange={filters.setPartial}
                onToggleCategoria={filters.toggleCategoria}
              />
            ) : undefined
          }
          filtersSlot={
            view === 'dia' ? (
              <FilterPopover
                filtros={filters.filtros}
                activeCount={filters.activeCount}
                onChange={filters.setPartial}
                onToggleCategoria={filters.toggleCategoria}
                onReset={filters.reset}
              />
            ) : undefined
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-5">
            {showSkeleton ? (
              <ContentSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'dia' && (
                    <CalendarView
                      month={month}
                      direction={direction}
                      items={filtered}
                      onAdd={(iso) => openNew({ data: iso })}
                      onEdit={openEdit}
                      onMoveToDay={(id, iso) => void update(id, { data: iso })}
                      hasAnyThisMonth={hasAnyThisMonth}
                    />
                  )}
                  {view === 'tipo' && (
                    <KanbanBoard
                      month={month}
                      items={monthItems}
                      hasAnyThisMonth={hasAnyThisMonth}
                      onEdit={openEdit}
                      onUpdate={(id, patch) => void update(id, patch)}
                      onAddNew={(tipo) => openNew({ tipo, data: defaultIso })}
                    />
                  )}
                  {view === 'resumo' && (
                    <Suspense
                      fallback={<div className="py-20 text-center text-subtle">Carregando gráficos…</div>}
                    >
                      <ResumoView
                        month={month}
                        periodo={periodo}
                        filteredAll={all}
                        isAll={isAll}
                        perfis={perfis}
                        onSelect={openEdit}
                        onAdd={() => openNew({ data: defaultIso })}
                      />
                    </Suspense>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        {view === 'dia' && <SummaryBar totais={resumo} />}
        {isMobile && <MobileTabBar view={view} onViewChange={setView} />}
      </div>

      <MigrateModal />

      <WelcomeModal
        open={showWelcome}
        onCreateProfile={() => {
          setShowWelcome(false)
          marcarOnboardingVisto()
          setCreateProfileOpen(true)
        }}
        onDismiss={() => {
          setShowWelcome(false)
          marcarOnboardingVisto()
        }}
      />

      <ManageProfilesModal
        open={createProfileOpen}
        initialCreate
        createOnly
        onClose={() => setCreateProfileOpen(false)}
        onCreated={() => {
          setCreateProfileOpen(false)
          showToast({ message: 'Perfil criado' })
        }}
      />
    </div>
  )
}
