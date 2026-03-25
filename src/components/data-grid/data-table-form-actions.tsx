import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

type DataTableFormActionsProps = {
    onSave?: () => void
    onCancel?: () => void
    isSubmitting?: boolean
    disabled?: boolean
}

export const DataTableFormActions = ({
    onSave,
    onCancel,
    isSubmitting = false,
    disabled = false,
}: DataTableFormActionsProps) => {
    return (
        <div className='flex justify-end gap-3 pr-1'>
            <ButtonGroup aria-label='Button group'>
                <Button
                    type='submit'
                    size='icon'
                    variant='ghost'
                    disabled={isSubmitting || disabled}
                    onClick={onSave}
                    className='hover:bg-green-100'
                    aria-label='save'
                >
                    <Check className='text-green-600' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    className='hover:bg-red-100'
                    size='icon'
                    onClick={onCancel}
                    disabled={isSubmitting}
                    aria-label='cancel'
                >
                    <X className='text-red-600' />
                </Button>
            </ButtonGroup>
        </div>
    )
}
