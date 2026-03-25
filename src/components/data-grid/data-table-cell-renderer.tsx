import { NumericFormat } from 'react-number-format'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { DatePicker } from '@/components/date-picker/date-picker'
import VirtualizedDropdown from '@/components/virtualized-dropdown'

import { FieldDef, Resource } from './types'

interface DataTableCellRendererProps<TData extends Resource> {
    field: FieldDef<TData>
    value: unknown
    onChange: (value: unknown) => void
    disabled?: boolean
    error?: string
}

export const DataTableCellRenderer = <TData extends Resource>({
    field,
    value,
    onChange,
    disabled,
    error,
}: DataTableCellRendererProps<TData>) => {
    return (
        <div className='flex flex-col gap-1'>
            <CellInput field={field} value={value} onChange={onChange} disabled={disabled} />
            {error && <span className='text-destructive text-xs'>{error}</span>}
        </div>
    )
}

interface CellInputProps<TData extends Resource> {
    field: FieldDef<TData>
    value: unknown
    onChange: (value: unknown) => void
    disabled?: boolean
}

const CellInput = <TData extends Resource>({ field, value, onChange, disabled }: CellInputProps<TData>) => {
    switch (field.type) {
        case 'text':
            return (
                <Input
                    value={typeof value === 'string' ? value : ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    className='min-w-0'
                />
            )

        case 'number':
            return (
                <NumericFormat
                    value={typeof value === 'number' && !Number.isNaN(value) ? value : ''}
                    onValueChange={({ floatValue }) => {
                        if (floatValue === undefined || Number.isNaN(floatValue)) {
                            onChange(undefined)
                        } else {
                            onChange(floatValue)
                        }
                    }}
                    placeholder={field.placeholder}
                    decimalScale={field.decimalScale}
                    fixedDecimalScale={!!field.decimalScale}
                    thousandSeparator={field.thousandSeparator}
                    disabled={disabled}
                    customInput={Input}
                    className='min-w-0'
                />
            )

        case 'textarea':
            return (
                <Textarea
                    value={typeof value === 'string' ? value : ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 2}
                    disabled={disabled}
                    className='w-full min-w-0 resize-none break-all'
                />
            )

        case 'checkbox':
            return (
                <Checkbox
                    checked={typeof value === 'boolean' ? value : false}
                    onCheckedChange={checked => onChange(checked)}
                    disabled={disabled}
                />
            )

        case 'date':
            return (
                <DatePicker
                    value={value instanceof Date ? value : undefined}
                    onValueChange={date => onChange(date)}
                    disabled={disabled}
                />
            )

        case 'select':
            return (
                <Select
                    value={typeof value === 'string' ? value : ''}
                    onValueChange={val => onChange(val)}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder='Select...' />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        case 'readonly':
            return null

        case 'virtualized-dropdown':
            return (
                <VirtualizedDropdown
                    data={field.data as never}
                    single={field.single}
                    nameSet={field.nameSet as string}
                    idSet={field.idSet as string}
                    value={value as never}
                    onChange={selected => onChange(selected)}
                    customEmptyMessage={field.customEmptyMessage}
                    keepOpenOnSelect={field.keepOpenOnSelect}
                    disabled={disabled}
                />
            )

        default:
            return null
    }
}
