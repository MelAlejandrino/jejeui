import * as React from 'react'

import { CalendarIcon } from 'lucide-react'

import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldDescription } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type DatePickerProps = {
    /** Controlled value */
    value?: Date | null
    /** Uncontrolled initial value */
    defaultValue?: Date | null
    /** Change handler */
    onValueChange?: (date: Date | null) => void

    /** Weekly mode: show start → end */
    isWeekly?: boolean

    /** Label & helper text */
    label?: string
    description?: string

    /** Placeholder text when no date selected */
    placeholder?: string

    /** Disable entire picker */
    disabled?: boolean

    /** Min / max selectable dates */
    minDate?: Date
    maxDate?: Date

    /** Additional className for wrapper */
    className?: string

    /** Calendar props passthrough */
    calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>
}

export function DatePicker({
    value,
    defaultValue = null,
    onValueChange,
    isWeekly = false,
    description,
    placeholder = 'Pick a date',
    disabled,
    minDate,
    maxDate,
    className,
    calendarProps,
}: DatePickerProps) {
    const isControlled = value !== undefined

    const [internalDate, setInternalDate] = React.useState<Date | null>(defaultValue)

    const selectedDate = isControlled ? (value ?? null) : internalDate

    const setDate = React.useCallback(
        (date: Date | undefined) => {
            const normalized = date ?? null

            if (!isControlled) setInternalDate(normalized)
            onValueChange?.(normalized)
        },
        [isControlled, onValueChange],
    )

    const isDateDisabled = React.useCallback(
        (date: Date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
        },
        [minDate, maxDate],
    )

    // Compute end date for weekly
    const endDate =
        isWeekly && selectedDate
            ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 6)
            : null

    return (
        <Field className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id='date-picker'
                        type='button'
                        variant='outline'
                        disabled={disabled}
                        className='w-full cursor-pointer justify-start font-normal'
                    >
                        <CalendarIcon />
                        {selectedDate ? (
                            isWeekly && endDate ? (
                                `${format(selectedDate, 'yyyy-MM-dd')} → ${format(endDate, 'yyyy-MM-dd')}`
                            ) : (
                                format(selectedDate, 'yyyy-MM-dd')
                            )
                        ) : (
                            <span className='text-muted-foreground'>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                        mode='single'
                        selected={selectedDate ?? undefined}
                        onSelect={setDate}
                        defaultMonth={selectedDate ?? undefined}
                        disabled={isDateDisabled}
                        {...calendarProps}
                    />
                </PopoverContent>
            </Popover>

            {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
    )
}
