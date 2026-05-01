'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchUniversities } from '@/features/professional/actions'
import { cn } from '@/lib/utils'

type QualificationInstitutionInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  /** When false, pending searches are cancelled and the suggestion panel closes. */
  active?: boolean
}

const DEBOUNCE_MS = 320

export function QualificationInstitutionInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Start typing to search, or enter any institution name',
  active = true,
}: QualificationInstitutionInputProps) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const requestId = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  /** After choosing a suggestion, `value` still has 2+ chars — skip reopening the panel on that update. */
  const skipSearchAfterPickRef = useRef(false)

  useEffect(() => {
    if (!active) {
      skipSearchAfterPickRef.current = false
      setOpen(false)
      setResults([])
      setLoading(false)
      setSearched(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const q = value.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      setSearched(false)
      setOpen(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    if (skipSearchAfterPickRef.current) {
      skipSearchAfterPickRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      setOpen(false)
      setLoading(false)
      return
    }

    setOpen(true)
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const id = ++requestId.current
      void (async () => {
        setLoading(true)
        setSearched(false)
        if (process.env.NODE_ENV === 'development') {
          console.info('[QualificationInstitutionInput] requesting search', { query: q })
        }
        const res = await searchUniversities({ query: q })
        if (requestId.current !== id) {
          if (process.env.NODE_ENV === 'development') {
            console.info('[QualificationInstitutionInput] stale response ignored', { query: q, id })
          }
          return
        }
        setLoading(false)
        setSearched(true)
        if (res.success) {
          setResults(res.results)
          if (process.env.NODE_ENV === 'development') {
            console.info('[QualificationInstitutionInput] results', {
              query: q,
              count: res.results.length,
              first: res.results[0],
            })
          }
        } else {
          setResults([])
          console.warn('[QualificationInstitutionInput] search failed', res.error)
        }
      })()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, active])

  const pick = (name: string) => {
    skipSearchAfterPickRef.current = true
    requestId.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange(name)
    setOpen(false)
    setResults([])
    setSearched(false)
    setLoading(false)
  }

  const showPanel = active && open && value.trim().length >= 2

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (active && value.trim().length >= 2) setOpen(true)
        }}
        onBlur={() => {
          window.setTimeout(() => {
            if (!containerRef.current?.contains(document.activeElement)) {
              setOpen(false)
            }
          }, 180)
        }}
        disabled={disabled}
        className="rounded-xl"
        autoComplete="off"
      />
      {showPanel && (
        <div
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-popover text-popover-foreground shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
              Searching…
            </div>
          )}
          {!loading && searched && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              No matches in the directory. Keep typing—your text will be saved as entered.
            </div>
          )}
          {!loading &&
            results.map((name) => (
              <button
                key={name}
                type="button"
                className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => pick(name)}
              >
                <span className="break-words">{name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
