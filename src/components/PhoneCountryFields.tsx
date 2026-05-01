'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  getPhoneCountryOptionByIso2,
  PHONE_COUNTRY_DIAL_OPTIONS,
  phoneCountryFlagUrl,
} from '@/lib/phone-country-options'
import { cn } from '@/lib/utils'

export type PhoneCountryFieldsProps = {
  countryIso: string
  nationalNumber: string
  onCountryIsoChange: (iso2: string) => void
  onNationalChange: (digits: string) => void
  disabled?: boolean
  className?: string
  inputClassName?: string
}

function FlagImg({ iso2, className }: { iso2: string; className?: string }) {
  const upper = iso2.toUpperCase()
  return (
    <img
      src={phoneCountryFlagUrl(upper)}
      alt=""
      width={20}
      height={15}
      className={cn('h-[15px] w-5 shrink-0 rounded-sm object-cover', className)}
      loading="lazy"
      decoding="async"
    />
  )
}

export function PhoneCountryFields({
  countryIso,
  nationalNumber,
  onCountryIsoChange,
  onNationalChange,
  disabled,
  className,
  inputClassName,
}: PhoneCountryFieldsProps) {
  const [open, setOpen] = React.useState(false)
  const upperIso = (countryIso || DEFAULT_PHONE_COUNTRY_ISO).toUpperCase()
  const selected = getPhoneCountryOptionByIso2(upperIso) ?? getPhoneCountryOptionByIso2(DEFAULT_PHONE_COUNTRY_ISO)!

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Country calling code"
            disabled={disabled}
            className={cn(
              'h-12 w-full shrink-0 justify-between rounded-xl border-slate-100 px-3 font-normal sm:w-[240px]',
              disabled && 'opacity-70'
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <FlagImg iso2={selected.iso2} />
              <span className="truncate text-sm font-medium">{selected.label}</span>
            </span>
            <ChevronsUpDown className="ml-1 size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,360px)] p-0 rounded-xl" align="start">
          <Command>
            <CommandInput placeholder="Search country or code…" className="h-11" />
            <CommandList className="max-h-[280px]">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {PHONE_COUNTRY_DIAL_OPTIONS.map((o) => (
                  <CommandItem
                    key={o.iso2}
                    value={`${o.name} ${o.iso2} ${o.dialCode}`}
                    onSelect={() => {
                      onCountryIsoChange(o.iso2)
                      setOpen(false)
                    }}
                    className="rounded-lg"
                  >
                    <FlagImg iso2={o.iso2} className="mr-1" />
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    <Check
                      className={cn('ml-auto size-4 shrink-0', upperIso === o.iso2 ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="Phone number"
        title={
          selected.minLength === selected.maxLength
            ? `${selected.minLength} digits (${selected.name})`
            : `${selected.minLength}–${selected.maxLength} digits (${selected.name})`
        }
        maxLength={selected.maxLength}
        value={nationalNumber}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, selected.maxLength)
          onNationalChange(digits)
        }}
        disabled={disabled}
        className={cn('h-12 min-w-0 flex-1 rounded-xl border-slate-100', inputClassName)}
      />
    </div>
  )
}
