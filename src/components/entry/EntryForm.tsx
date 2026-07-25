import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { lancamentoFormSchema, type LancamentoFormValues } from '../../lib/schema'
import { TIPO_COLOR } from '../../lib/labels'
import type { Perfil } from '../../types'
import { Button } from '../ui/Button'
import { CurrencyInput } from '../ui/CurrencyInput'
import { Field, Textarea } from '../ui/Input'
import { SegmentedControl } from '../ui/SegmentedControl'
import { CategorySelect } from './CategorySelect'
import { DateField } from './DateField'

interface EntryFormProps {
  defaultValues: LancamentoFormValues
  isEditing: boolean
  submitting?: boolean
  /** demais perfis, para "Mover para outro perfil" (só no modo edição). */
  outrosPerfis?: Perfil[]
  onSubmit: (values: LancamentoFormValues) => void
  onCancel: () => void
  onDelete?: () => void
  onMove?: (perfilId: string) => void
  titleId?: string
}

export function EntryForm({
  defaultValues,
  isEditing,
  submitting,
  outrosPerfis = [],
  onSubmit,
  onCancel,
  onDelete,
  onMove,
  titleId,
}: EntryFormProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [moving, setMoving] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LancamentoFormValues>({
    resolver: zodResolver(lancamentoFormSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  const tipo = watch('tipo')

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit(onSubmit)()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={onKeyDown} className="flex flex-col">
      <div className="flex flex-col gap-4 px-6 pb-5 pt-6">
        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <input
            id={titleId}
            autoFocus
            placeholder="Sem título"
            className="w-full bg-transparent text-[20px] font-semibold text-ink placeholder:text-subtle focus:outline-none"
            {...register('titulo')}
          />
          {errors.titulo && <span className="text-legend text-gasto">{errors.titulo.message}</span>}
        </div>

        {/* Data */}
        <Field label="Data">
          <Controller
            control={control}
            name="data"
            render={({ field }) => <DateField value={field.value} onChange={field.onChange} />}
          />
        </Field>

        {/* Tipo */}
        <Field label="Tipo" error={errors.tipo?.message}>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'entrada', label: 'Entrada', activeColor: 'var(--green)' },
                  { value: 'gasto', label: 'Gasto', activeColor: 'var(--red)' },
                ]}
                className="w-full [&>button]:flex-1"
              />
            )}
          />
        </Field>

        {/* Valor */}
        <Field label="Valor" error={errors.valor?.message}>
          <Controller
            control={control}
            name="valor"
            render={({ field }) => (
              <CurrencyInput
                value={field.value ?? 0}
                onChange={field.onChange}
                onBlur={field.onBlur}
                color={TIPO_COLOR[tipo]}
              />
            )}
          />
        </Field>

        {/* Categoria — lista fixa */}
        <Field label="Categoria">
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <CategorySelect value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>

        {/* Observação */}
        <Field label="Observação">
          <Textarea rows={3} placeholder="Detalhes (opcional)" {...register('observacao')} />
        </Field>

        {/* Mover para outro perfil (edição) */}
        {isEditing && onMove && outrosPerfis.length > 0 && (
          <div>
            {!moving ? (
              <button
                type="button"
                onClick={() => setMoving(true)}
                className="text-legend font-medium text-subtle transition-colors hover:text-ink"
              >
                Mover para outro perfil…
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 rounded-xl bg-surface-2 p-2.5">
                <span className="text-micro font-medium uppercase text-subtle">Mover para</span>
                <div className="flex flex-wrap gap-1.5">
                  {outrosPerfis.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onMove(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-legend font-medium text-ink transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                    >
                      <span aria-hidden>{p.emoji}</span>
                      {p.nome}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMoving(false)}
                    className="rounded-lg px-2.5 py-1.5 text-legend font-medium text-subtle hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-2 border-t border-hairline px-6 py-4">
        <div>
          {isEditing &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-legend text-subtle">Tem certeza?</span>
                <Button size="sm" variant="danger" onClick={onDelete}>
                  Excluir
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-legend font-medium text-gasto transition-colors hover:bg-gasto/10"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            Salvar
          </Button>
        </div>
      </div>
    </form>
  )
}
