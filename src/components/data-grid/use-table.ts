// registry/new-york/data-grid/use-table.ts
import { useRef, useState } from 'react'

import {
    ColumnMeta,
    FieldErrors,
    PaginationState,
    Resource,
    SortDirection,
    SortState,
    TableProps,
    UseTableOptions,
    ValidationFn,
} from './types'

export function useTable<TData extends Resource>({
    data,
    fields,
    validation,
    onSave,
    onCreate,
    onDelete,
    onView,
    extraActions,
    pagination: paginationOptions,
    sort: sortOptions,
}: UseTableOptions<TData>) {
    const [editingRowId, setEditingRowId] = useState<TData['id'] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [createErrors, setCreateErrors] = useState<FieldErrors>({})
    const [editErrors, setEditErrors] = useState<FieldErrors>({})
    const [page, setPage] = useState(paginationOptions?.page ?? 0)
    const [pageSize, setPageSize] = useState(paginationOptions?.pageSize ?? 10)
    const [sortState, setSortState] = useState<SortState | null>(null)

    const isServerSide = paginationOptions?.total !== undefined
    const total = isServerSide ? (paginationOptions?.total ?? 0) : data.length

    const columns: ColumnMeta<TData>[] = (Object.keys(fields) as Array<keyof TData>).map(key => {
        const field = fields[key]!
        return { key, label: field.label, size: field.size, sortable: field.sortable, field }
    })

    const validate = (formData: Partial<TData>): FieldErrors => {
        if (!validation) return {}
        const errors: FieldErrors = {}
        ;(Object.keys(validation) as Array<keyof TData>).forEach(key => {
            const fn = (validation as ValidationFn<TData>)[key]
            if (!fn) return
            const result = fn(formData[key], formData)
            if (result) errors[String(key)] = result
        })
        return errors
    }

    const editingRowIdRef = useRef<TData['id'] | null>(null)

    const onEdit = (id: TData['id']) => {
        setEditingRowId(id)
        editingRowIdRef.current = id
        setEditErrors({})
    }

    const onCancelEdit = () => {
        setEditingRowId(null)
        editingRowIdRef.current = null
        setEditErrors({})
    }

    const handleSave = async (id: TData['id'], formData: Partial<TData>) => {
        const payload = Object.fromEntries(
            Object.entries(formData).filter(([key]) => {
                const field = fields[key as keyof TData]
                return field?.type !== 'readonly'
            }),
        ) as Partial<TData>

        const validationErrors = validate(payload)
        if (Object.keys(validationErrors).length > 0) {
            setEditErrors(validationErrors)
            throw new Error('Validation failed')
        }
        try {
            setIsSubmitting(true)
            await onSave?.(id, formData)
            setEditingRowId(null)
            setEditErrors({})
            editingRowIdRef.current = null
        } catch (e) {
            throw e
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreate = async (formData: Partial<TData>) => {
        const validationErrors = validate(formData)
        if (Object.keys(validationErrors).length > 0) {
            setCreateErrors(validationErrors)
            throw new Error('Validation failed')
        }
        try {
            setIsSubmitting(true)
            setCreateErrors({})
            await onCreate?.(formData)
        } catch (e) {
            throw e
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: TData['id']) => {
        await onDelete?.(id)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        paginationOptions?.onPageChange?.(newPage, pageSize)
    }

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        setPage(0)
        paginationOptions?.onPageChange?.(0, newSize)
    }

    const handleSort = (key: string, direction: SortDirection) => {
        setSortState({ key, direction })
        sortOptions?.onSortChange?.(key, direction)
    }

    // client-side sort
    const sortData = (rows: TData[]): TData[] => {
        if (!sortState || sortOptions?.onSortChange) return rows // skip if server-side
        const { key, direction } = sortState
        return [...rows].sort((a, b) => {
            const aVal = a[key as keyof TData]
            const bVal = b[key as keyof TData]
            if (aVal === null || aVal === undefined) return 1
            if (bVal === null || bVal === undefined) return -1
            if (aVal instanceof Date && bVal instanceof Date) {
                return direction === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime()
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal
            }
            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()
            if (direction === 'asc') return aStr.localeCompare(bStr)
            return bStr.localeCompare(aStr)
        })
    }

    const rawRows = paginationOptions
        ? isServerSide
            ? data
            : data.slice(page * pageSize, page * pageSize + pageSize)
        : data

    const rows = sortData(rawRows)

    const setError = (field: keyof TData, message: string) => {
        if (editingRowIdRef.current !== null) {
            setEditErrors(prev => ({ ...prev, [String(field)]: message }))
        } else {
            setCreateErrors(prev => ({ ...prev, [String(field)]: message }))
        }
    }

    const paginationState: PaginationState | undefined = paginationOptions
        ? { page, pageSize, total, onPageChange: handlePageChange, onPageSizeChange: handlePageSizeChange }
        : undefined

    const onCancelCreate = () => {
        setCreateErrors({})
    }

    const tableProps: TableProps<TData> = {
        rows,
        columns,
        editingRowId,
        isSubmitting,
        createErrors,
        editErrors,
        onSave: handleSave,
        onCancelEdit,
        onCreate: handleCreate,
        onDelete: handleDelete,
        onView,
        onEdit,
        extraActions,
        pagination: paginationState,
        onCancelCreate,
        sort: sortState,
        onSort: handleSort,
    }

    return {
        tableProps,
        setError,
        setCreateErrors,
        setEditErrors,
    }
}
