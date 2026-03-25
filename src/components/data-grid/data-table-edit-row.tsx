import { useEffect, useState } from 'react'

import { isSameDay } from 'date-fns'

import { TableCell, TableRow } from '@/components/ui/table'

import { DataTableCellRenderer } from './data-table-cell-renderer'
import { DataTableFormActions } from './data-table-form-actions'
import { ColumnMeta, FieldErrors, Resource } from './types'

interface DataTableEditRowProps<TData extends Resource> {
    row: TData
    columns: ColumnMeta<TData>[]
    onSave: (id: TData['id'], data: Partial<TData>) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
    errors?: FieldErrors
}

export function DataTableEditRow<TData extends Resource>({
    row,
    columns,
    onSave,
    onCancel,
    isSubmitting = false,
    errors = {},
}: DataTableEditRowProps<TData>) {
    const getInitialFormData = () => {
        const initial: Partial<TData> = { ...row }
        columns.forEach(col => {
            const field = col.field
            if (field?.getInitialValue) {
                initial[col.key] = field.getInitialValue(row) as TData[keyof TData]
            }
        })
        return initial
    }

    const [formData, setFormData] = useState<Partial<TData>>(getInitialFormData)
    const [clearedFields, setClearedFields] = useState<Set<string>>(new Set())

    const handleChange = (key: keyof TData, value: unknown) => {
        setClearedFields(prev => new Set(prev).add(String(key)))
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        await onSave(row.id, formData)
    }

    const handleCancel = () => {
        setClearedFields(new Set())
        onCancel()
    }

    const mergedErrors: FieldErrors = Object.fromEntries(
        Object.entries(errors).filter(([key]) => !clearedFields.has(key)),
    )

    const isDirty = !isEqual(formData, row)
    console.log('formData.start_date', formData.start_date)
    console.log('row.start_date', row.start_date)
    console.log('isEqual result', isEqual(formData.start_date, row.start_date))
    console.log('isDirty', isDirty)

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClearedFields(new Set())
        }
    }, [errors])

    return (
        <TableRow className='bg-blue-50/40 hover:bg-blue-50/40 dark:bg-blue-950/20 dark:hover:bg-blue-950/20'>
            {columns.map(col => {
                const field = col.field
                return (
                    <TableCell
                        key={String(col.key)}
                        className='border-border border-r last:border-r-0'
                        style={
                            col.size !== undefined
                                ? {
                                      minWidth: `${col.size}px`,
                                      width: `${col.size}px`,
                                  }
                                : undefined
                        }
                    >
                        {field && field.type !== 'readonly' ? (
                            <DataTableCellRenderer
                                field={field}
                                value={formData[col.key] ?? ''}
                                onChange={val => handleChange(col.key, val)}
                                disabled={isSubmitting}
                                error={mergedErrors[String(col.key)]}
                            />
                        ) : (
                            <span className='text-muted-foreground text-sm'>
                                {field?.render
                                    ? field.render(formData[col.key] as TData[keyof TData], formData as TData)
                                    : String(formData[col.key] ?? '—')}
                            </span>
                        )}
                    </TableCell>
                )
            })}
            <TableCell style={{ width: '1px', whiteSpace: 'nowrap' }}>
                <DataTableFormActions
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    disabled={!isDirty}
                />
            </TableCell>
        </TableRow>
    )
}

function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a instanceof Date && b instanceof Date) return isSameDay(a, b)
    if (a === null || b === null) return a === b
    if (typeof a !== 'object' || typeof b !== 'object') return a === b
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((item, i) => isEqual(item, b[i]))
    }
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)
    if (keysA.length !== keysB.length) return false
    return keysA.every(key => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}
