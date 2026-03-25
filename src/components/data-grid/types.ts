import React from 'react'

export interface Resource {
    id: number | string

    [key: string]: unknown
}

export interface SelectOption {
    value: string
    label: string
}

export interface DropdownItem {
    [key: string]: unknown
}

export type FieldErrors = Record<string, string>

export type SortDirection = 'asc' | 'desc'

export interface SortState {
    key: string
    direction: SortDirection
}

// field definitions — controls both input and display
export type FieldDef<TData> =
    | {
          label: string
          type: 'text'
          placeholder?: string
          size?: number
          sortable?: boolean
          required?: boolean
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'number'
          placeholder?: string
          size?: number
          required?: boolean
          sortable?: boolean
          decimalScale?: number
          thousandSeparator?: boolean
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'textarea'
          placeholder?: string
          size?: number
          sortable?: boolean
          required?: boolean
          rows?: number
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'checkbox'
          sortable?: boolean
          size?: number
          required?: boolean
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'date'
          size?: number
          sortable?: boolean
          required?: boolean
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'select'
          options: SelectOption[]
          size?: number
          sortable?: boolean
          required?: boolean
          getInitialValue?: (row: unknown) => unknown
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          type: 'virtualized-dropdown'
          data: DropdownItem[]
          nameSet?: string | ((item: DropdownItem) => string)
          idSet?: string | ((item: DropdownItem) => string)
          getInitialValue?: (row: unknown) => unknown
          single?: boolean
          customEmptyMessage?: string
          keepOpenOnSelect?: boolean
          size?: number
          sortable?: boolean
          required?: boolean
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
      }
    | {
          label: string
          sortable?: boolean
          type: 'readonly'
          size?: number
          render?: (value: TData[keyof TData], row: TData) => React.ReactNode
          getInitialValue?: (row: unknown) => unknown
      }

export type FieldsDef<TData> = Partial<Record<keyof TData, FieldDef<TData>>>

export type ValidationFn<TData> = Partial<Record<keyof TData, (value: unknown, row: Partial<TData>) => string | null>>

export interface ColumnMeta<TData> {
    key: keyof TData
    label: string
    size?: number
    sortable?: boolean
    field?: FieldDef<TData>
}

export interface ExtraAction<T extends Resource> {
    key: string
    label: string
    icon?: React.ReactNode
    onClick: (id: T['id'], resource: T) => void | Promise<void>
    destructive?: boolean
}

export interface TableProps<TData extends Resource> {
    rows: TData[]
    columns: ColumnMeta<TData>[]
    editingRowId: TData['id'] | null
    isSubmitting: boolean
    createErrors: FieldErrors
    editErrors: FieldErrors
    onSave: (id: TData['id'], data: Partial<TData>) => Promise<void>
    onCancelEdit: () => void
    onCreate?: (data: Partial<TData>) => Promise<void>
    onDelete?: (id: TData['id']) => Promise<void> | void
    onView?: (id: TData['id']) => void
    onEdit: (id: TData['id']) => void
    extraActions?: ExtraAction<TData>[]
    pagination?: PaginationState
    onCancelCreate?: () => void
    sort?: SortState | null
    onSort?: (key: string, direction: SortDirection) => void
}

export interface DataGridProps<TData extends Resource> {
    tableProps: TableProps<TData>
    className?: string
    isLoading?: boolean
    customEmptyMessage?: string
}

export interface UseTableOptions<TData extends Resource> {
    data: TData[]
    fields: FieldsDef<TData>
    validation?: ValidationFn<TData>
    onSave?: (id: TData['id'], data: Partial<TData>) => Promise<void> | void
    onCreate?: (data: Partial<TData>) => Promise<void> | void
    onDelete?: (id: TData['id']) => Promise<void> | void
    onView?: (id: TData['id']) => void
    extraActions?: ExtraAction<TData>[]
    sort?: {
        onSortChange?: (key: string, direction: SortDirection) => void
    }
    pagination?: {
        page?: number
        pageSize?: number
        total?: number
        onPageChange?: (page: number, pageSize: number) => void
    }
}

export interface PaginationState {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}
