import { useEffect, useState } from 'react'

import { TableCell, TableRow } from '@/components/ui/table'

import { DataTableCellRenderer } from './data-table-cell-renderer'
import { DataTableFormActions } from './data-table-form-actions'
import { ColumnMeta, FieldErrors, Resource } from './types'

interface DataTableCreateRowProps<TData extends Resource> {
    columns: ColumnMeta<TData>[]
    onCreate: (data: Partial<TData>) => Promise<void>
    isSubmitting?: boolean
    errors?: FieldErrors
    onCancel?: () => void
}

export function DataTableCreateRow<TData extends Resource>({
    columns,
    onCreate,
    isSubmitting = false,
    errors = {},
    onCancel,
}: DataTableCreateRowProps<TData>) {
    const [formData, setFormData] = useState<Partial<TData>>({})
    const [clearedFields, setClearedFields] = useState<Set<string>>(new Set())
    const [resetKey, setResetKey] = useState(0)

    const handleChange = (key: keyof TData, value: unknown) => {
        setClearedFields(prev => new Set(prev).add(String(key)))
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        await onCreate(formData)
        setFormData({})
        setClearedFields(new Set())
    }

    const handleCancel = () => {
        setFormData({})
        setClearedFields(new Set())
        setResetKey(prev => prev + 1)
        onCancel?.()
    }

    const mergedErrors: FieldErrors = Object.fromEntries(
        Object.entries(errors).filter(([key]) => !clearedFields.has(key)),
    )

    const isDirty = Object.keys(formData).length > 0

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClearedFields(new Set())
        }
    }, [errors])
    return (
        <TableRow key={resetKey} className='bg-muted/60 hover:bg-muted/60 border-primary/20 border-b-2'>
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
                        ) : null}
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
