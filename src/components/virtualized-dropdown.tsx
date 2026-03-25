'use client'
import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react'

import {ChevronDown} from 'lucide-react'

import {useVirtualizer} from '@tanstack/react-virtual'

import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

import {cn} from '@/lib/utils'

export type BaseOption = { id: string | number; name?: string }

type VirtualizedDropdownProps<T extends BaseOption> = {
    data: T[]
    label?: string
    single?: boolean
    value: T[] | T | null
    onChange?: (val: T[] | T | null) => void
    disabled?: boolean
    keepOpenOnSelect?: boolean
    classname?: string
    nameSet?: string | ((item: T) => string)
    idSet?: string | ((item: T) => string)
    customEmptyMessage?: string
}

function VirtualizedDropdown<T extends BaseOption>({
                                                       data,
                                                       label = 'Select...',
                                                       single = false,
                                                       value,
                                                       onChange,
                                                       disabled,
                                                       keepOpenOnSelect = false,
                                                       classname,
                                                       nameSet = 'name',
                                                       idSet = 'id',
                                                       customEmptyMessage,
                                                   }: VirtualizedDropdownProps<T>) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const getOptionKey = (opt: T) => {
        const name = typeof nameSet === 'function' ? nameSet(opt) : (opt[nameSet as keyof T] ?? opt.name)
        const id = typeof idSet === 'function' ? idSet(opt) : (opt[idSet as keyof T] ?? opt.id)
        return `${id}::${name}`
    }

    const getOptionName = useCallback(
        (opt: T) => {
            if (typeof nameSet === 'function') {
                return String(nameSet(opt) ?? '')
            }

            if (typeof nameSet === 'string' && nameSet.includes('+')) {
                // Split by '+' and trim spaces
                const keys = nameSet.split('+').map(k => k.trim())
                return keys
                    .map(k => (opt[k as keyof T] ?? '').toString())
                    .filter(Boolean)
                    .join(' ')
            }

            // Single key fallback
            return String(opt[nameSet as keyof T] ?? opt.name ?? '')
        },
        [nameSet],
    )

    // Map selection to objects
    const selected: T[] = useMemo(() => {
        if (!value) return []
        const values = single ? [value as T] : (value as T[])
        return values.map(v => {
            const found = data.find(d => {
                const idV = typeof v === 'object' && 'id' in v ? (v as unknown as { id: number }).id : v
                const idD = typeof idSet === 'function' ? idSet(d) : (d[idSet as keyof T] ?? d.id)
                return idV === idD
            })
            return found ?? (typeof v === 'object' ? v : ({id: v, name: String(v)} as unknown as T))
        })
    }, [value, data, single, idSet])

    // Filter options client-side
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return data
        const term = search.toLowerCase()

        return data.filter(opt => getOptionName(opt).toLowerCase().includes(term))
    }, [data, search, getOptionName])

    const toggleValue = useCallback(
        (option: T) => {
            if (!onChange) return

            if (single) {
                onChange(option)
                setOpen(false)
            } else {
                const exists = selected.some(s => {
                    const idS = typeof idSet === 'function' ? idSet(s) : (s[idSet as keyof T] ?? s.id)
                    const idO = typeof idSet === 'function' ? idSet(option) : (option[idSet as keyof T] ?? option.id)
                    return idS === idO
                })

                const newSelected = exists
                    ? selected.filter(s => {
                        const idS = typeof idSet === 'function' ? idSet(s) : (s[idSet as keyof T] ?? s.id)
                        const idO =
                            typeof idSet === 'function' ? idSet(option) : (option[idSet as keyof T] ?? option.id)
                        return idS !== idO
                    })
                    : [...selected, option]

                onChange(newSelected)
                if (!keepOpenOnSelect) setOpen(false)
            }
        },
        [onChange, single, selected, keepOpenOnSelect, idSet],
    )

    // Virtualizer
    const parentRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36,
        overscan: 5,
    })

    useLayoutEffect(() => {
        if (open) {
            const id = requestAnimationFrame(() => rowVirtualizer.measure())
            return () => cancelAnimationFrame(id)
        }
    }, [open, filteredOptions, rowVirtualizer])

    return (
        <Popover
            open={open}
            onOpenChange={val => {
                setOpen(val)
                if (!val) setSearch('')
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-auto w-full cursor-pointer justify-between py-2 text-left font-normal',
                        !selected.length && 'text-muted-foreground',
                        classname,
                    )}
                >
                    <span className='block w-full break-words whitespace-normal'>
                        {selected.length ? selected.map(s => getOptionName(s)).join(', ') : label}
                    </span>
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className='popover-content-width-full p-0'
                align='start'
                onWheel={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
            >
                <Command shouldFilter={false}>
                    <CommandInput placeholder='Search...' value={search} onValueChange={setSearch}/>
                    <CommandList ref={parentRef} className='max-h-[300px] overflow-y-auto pt-2'>
                        {filteredOptions.length === 0 && (
                            <CommandEmpty>{customEmptyMessage ?? 'No results found.'}</CommandEmpty>
                        )}

                        {filteredOptions.length > 0 && (
                            <>
                                {/* Select All — only for multi */}
                                {!single && (
                                    <CommandItem
                                        onSelect={() => {
                                            const allSelected = filteredOptions.every(opt =>
                                                selected.some(s => {
                                                    const idS =
                                                        typeof idSet === 'function'
                                                            ? idSet(s)
                                                            : (s[idSet as keyof T] ?? s.id)
                                                    const idO =
                                                        typeof idSet === 'function'
                                                            ? idSet(opt)
                                                            : (opt[idSet as keyof T] ?? opt.id)
                                                    return idS === idO
                                                }),
                                            )

                                            if (allSelected) {
                                                // deselect all filtered
                                                const newSelected = selected.filter(
                                                    s =>
                                                        !filteredOptions.some(opt => {
                                                            const idS =
                                                                typeof idSet === 'function'
                                                                    ? idSet(s)
                                                                    : (s[idSet as keyof T] ?? s.id)
                                                            const idO =
                                                                typeof idSet === 'function'
                                                                    ? idSet(opt)
                                                                    : (opt[idSet as keyof T] ?? opt.id)
                                                            return idS === idO
                                                        }),
                                                )
                                                onChange?.(newSelected)
                                            } else {
                                                // select all filtered, merge with existing
                                                const toAdd = filteredOptions.filter(
                                                    opt =>
                                                        !selected.some(s => {
                                                            const idS =
                                                                typeof idSet === 'function'
                                                                    ? idSet(s)
                                                                    : (s[idSet as keyof T] ?? s.id)
                                                            const idO =
                                                                typeof idSet === 'function'
                                                                    ? idSet(opt)
                                                                    : (opt[idSet as keyof T] ?? opt.id)
                                                            return idS === idO
                                                        }),
                                                )
                                                onChange?.([...selected, ...toAdd] as T[])
                                            }
                                        }}
                                        className='border-border mb-1 rounded-none border-b'
                                    >
                                        <Checkbox
                                            checked={
                                                filteredOptions.length > 0 &&
                                                filteredOptions.every(opt =>
                                                    selected.some(s => {
                                                        const idS =
                                                            typeof idSet === 'function'
                                                                ? idSet(s)
                                                                : (s[idSet as keyof T] ?? s.id)
                                                        const idO =
                                                            typeof idSet === 'function'
                                                                ? idSet(opt)
                                                                : (opt[idSet as keyof T] ?? opt.id)
                                                        return idS === idO
                                                    }),
                                                )
                                            }
                                            className='mr-2 [&_svg]:text-white!'
                                        />
                                        Select All
                                    </CommandItem>
                                )}

                                <CommandGroup
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                                        const option = filteredOptions[virtualRow.index]
                                        const isSelected = selected.some(s => {
                                            const idS =
                                                typeof idSet === 'function' ? idSet(s) : (s[idSet as keyof T] ?? s.id)
                                            const idO =
                                                typeof idSet === 'function'
                                                    ? idSet(option)
                                                    : (option[idSet as keyof T] ?? option.id)
                                            return idS === idO
                                        })
                                        return (
                                            <CommandItem
                                                key={getOptionKey(option)}
                                                value={getOptionKey(option)}
                                                onSelect={() => toggleValue(option)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <Checkbox checked={isSelected} className='mr-2'/>
                                                <span className='flex-1 truncate' title={getOptionName(option)}>
                                                    {getOptionName(option)}
                                                </span>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default VirtualizedDropdown
