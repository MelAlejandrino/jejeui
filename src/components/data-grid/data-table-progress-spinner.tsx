import { Spinner } from '@/components/ui/spinner'

type Props = {
    isFetching: boolean
}

export function DataTableProgressSpinner({ isFetching }: Readonly<Props>) {
    if (isFetching) {
        return (
            <div className='absolute z-20 flex h-full w-full items-center justify-center bg-gray-100/50'>
                <Spinner className='size-6' />
            </div>
        )
    }

    return null
}
