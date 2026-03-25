import { Eye, MoreVertical, SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { ExtraAction, Resource } from './types'

interface Props<T extends Resource> {
    onView?: (resourceId: T['id']) => void
    onEdit?: (resourceId: T['id']) => void
    onDelete?: (resourceId: T['id']) => Promise<void> | void
    extraActions?: ExtraAction<T>[]
    resource: T
}

export function DataTableActions<T extends Resource>({
    onView,
    onEdit,
    onDelete,
    resource,
    extraActions,
}: Readonly<Props<T>>) {
    return (
        <div className='flex justify-end pr-0'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='group h-8 w-8 cursor-pointer p-0 transition-all duration-200 hover:shadow-md'
                    >
                        <span className='sr-only'>Open menu</span>
                        <MoreVertical className='h-4 w-4 transition-colors duration-200' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    {extraActions?.map(action => (
                        <DropdownMenuItem
                            key={action.key}
                            onClick={() => action.onClick(resource.id, resource)}
                            className={action.destructive ? 'text-destructive focus:text-destructive' : ''}
                        >
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                    {onView && (
                        <DropdownMenuItem onClick={() => onView(resource.id)}>
                            <Eye /> View
                        </DropdownMenuItem>
                    )}
                    {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(resource.id)}>
                            <SquarePen /> Edit
                        </DropdownMenuItem>
                    )}
                    {onDelete && (
                        <DropdownMenuItem
                            onClick={async () => await onDelete(resource.id)}
                            className='text-destructive focus:text-destructive'
                        >
                            <Trash2 color='red' /> Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
