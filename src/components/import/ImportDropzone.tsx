import { FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

interface ImportDropzoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

/** Área de arrastar-e-soltar + botão para escolher o .csv. */
export function ImportDropzone({ onFile, disabled }: ImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const receber = (files: FileList | null) => {
    const f = files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!disabled) receber(e.dataTransfer.files)
      }}
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center transition-colors',
        dragOver ? 'border-acento bg-acento/5' : 'border-hairline bg-surface-2',
        disabled && 'opacity-50',
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-subtle">
        {dragOver ? <Upload className="h-6 w-6" /> : <FileSpreadsheet className="h-6 w-6" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-body font-medium text-ink">Arraste o extrato aqui</p>
        <p className="text-legend text-subtle">
          .csv do seu banco ou .json de backup do Nummo
        </p>
      </div>
      {/* TODO: importar PDF do Inter (aguardando layout de exemplo) */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv,.json,application/json"
        className="hidden"
        onChange={(e) => {
          receber(e.target.files)
          e.target.value = ''
        }}
      />
      <Button variant="secondary" disabled={disabled} onClick={() => inputRef.current?.click()}>
        Escolher arquivo
      </Button>
    </div>
  )
}
