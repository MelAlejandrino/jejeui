import { useEffect, useState } from 'react'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { PaginationState } from './types'

interface DataTablePaginationProps {
    pagination: PaginationState
}

export function DataTablePagination({ pagination }: DataTablePaginationProps) {
    const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.ceil(total / pageSize)
    const canPrevious = page > 0
    const canNext = page < totalPages - 1

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false)
    }, [page])

    const handlePrevious = () => {
        if (isLoading || !canPrevious) return
        setIsLoading(true)
        onPageChange(page - 1)
    }

    const handleNext = () => {
        if (isLoading || !canNext) return
        setIsLoading(true)
        onPageChange(page + 1)
    }

    const handlePageClick = (targetPage: number) => {
        if (targetPage === page) return
        onPageChange(targetPage)
    }

    // show 3 pages starting from current
    const pageButtons = Array.from({ length: 3 })
        .map((_, idx) => page + idx)
        .filter(p => p < totalPages)

    return (
        <div className='mt-2 flex w-full flex-col items-center justify-between space-y-4 px-2 lg:flex-row lg:space-y-0'>
            <div className='flex items-center space-x-2'>
                <p className='text-sm font-medium'>Rows per page</p>
                <Select value={`${pageSize}`} onValueChange={value => onPageSizeChange(Number(value))}>
                    <SelectTrigger className='h-8 w-[70px] rounded-sm py-5 hover:cursor-pointer focus:ring-neutral-300'>
                        <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side='top'>
                        {[10, 50, 100, 150, 200].map(size => (
                            <SelectItem key={size} value={`${size}`} className='hover:cursor-pointer'>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='flex items-center space-x-2'>
                <Button
                    variant='ghost'
                    className='cursor-pointer'
                    onClick={handlePrevious}
                    disabled={!canPrevious || isLoading}
                >
                    <ChevronLeftIcon className='h-4 w-4' />
                    Previous
                </Button>

                <div className='flex items-center justify-center space-x-1 text-sm font-medium'>
                    {pageButtons.map(p => (
                        <Button
                            key={p}
                            variant={p === page ? 'outline' : 'ghost'}
                            className='cursor-pointer rounded-sm'
                            onClick={() => handlePageClick(p)}
                        >
                            {p + 1}
                        </Button>
                    ))}
                </div>

                <Button
                    variant='ghost'
                    className='cursor-pointer'
                    onClick={handleNext}
                    disabled={!canNext || isLoading}
                >
                    Next
                    <ChevronRightIcon className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}
