'use client';

import { useState } from 'react';
import { useTable } from '@/components/data-grid/use-table';
import { DataGrid } from '@/components/data-grid/data-grid';
import { Resource } from '@/components/data-grid/types';

interface Employee extends Resource {
  id: number;
  name: string;
  age: number;
  notes: string;
  salary: number;
  status: string;
  department: { id: number; name: string };
  start_date: Date | null;
  is_active: boolean;
}

const DEPARTMENTS = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Marketing' },
  { id: 4, name: 'Finance' },
  { id: 5, name: 'Operations' },
];

const STATUS_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
];

const INITIAL_DATA: Employee[] = [
  {
    id: 1,
    name: 'Alice Santos',
    age: 28,
    notes: 'Lead developer',
    salary: 85000,
    status: 'full_time',
    department: { id: 1, name: 'Engineering' },
    start_date: new Date('2022-03-15'),
    is_active: true,
  },
  {
    id: 2,
    name: 'Bob Reyes',
    age: 34,
    notes: 'UI/UX specialist',
    salary: 72000,
    status: 'full_time',
    department: { id: 2, name: 'Design' },
    start_date: new Date('2021-07-01'),
    is_active: true,
  },
  {
    id: 3,
    name: 'Carlo Mendoza',
    age: 25,
    notes: 'Intern',
    salary: 25000,
    status: 'intern',
    department: { id: 3, name: 'Marketing' },
    start_date: new Date('2024-01-10'),
    is_active: false,
  },
];

export const DataGridDemo = () => {
  const [data, setData] = useState<Employee[]>(INITIAL_DATA);

  const { tableProps, setError } = useTable<Employee>({
    data,
    pagination: {
      pageSize: 10,
    },
    fields: {
      name: { label: 'Name', type: 'text', placeholder: 'Enter name...' },
      age: {
        label: 'Age',
        type: 'number',
        placeholder: 'Enter age...',
        size: 80,
        render: (value) => (
          <span className="break-words whitespace-normal">{value ? Number(value) : ''}</span>
        ),
      },
      notes: {
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Enter notes...',
        rows: 2,
        size: 200,
        render: (value) => (
          <span className="break-words whitespace-normal">{String(value ?? '')}</span>
        ),
      },
      salary: {
        label: 'Salary',
        type: 'number',
        placeholder: 'Enter salary...',
        getInitialValue: (row) => (row as Employee).salary,
        render: (value) => <p>{value ? `₱${Number(value).toLocaleString()}` : ''} </p>,
        thousandSeparator: true,
        decimalScale: 2,
        size: 150,
      },
      status: {
        label: 'Status',
        type: 'select',
        options: STATUS_OPTIONS,
      },
      department: {
        label: 'Department',
        type: 'virtualized-dropdown',
        data: DEPARTMENTS,
        nameSet: 'name',
        getInitialValue: (row) => (row as Employee).department,
        idSet: 'id',
        single: true,
      },
      start_date: { label: 'Start Date', type: 'date', sortable: true },
      is_active: { label: 'Active', type: 'checkbox' },
    },
    // sort: {
    //     onSortChange: (key, direction) => {
    //         // server side
    //         console.log('key', key)
    //         console.log('direction', direction)
    //     }
    // },
    validation: {
      name: (value) => (!value ? 'Name is required' : null),
    },
    onSave: async (id, updated) => {
      await new Promise((r) => setTimeout(r, 800));

      // simulate backend error
      if ((updated.name?.length ?? 0) > 20) {
        setError('name', 'Max 20 characters');
        throw new Error('Max 20 characters on Edit');
      }

      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...updated } : row)));
    },
    onCreate: async (newData) => {
      await new Promise((r) => setTimeout(r, 800));

      // simulate backend error
      if ((newData.name?.length ?? 0) > 20) {
        setError('name', 'Max 20 characters');
        throw new Error('Max 20 characters');
      }

      const dept = DEPARTMENTS.find((d) => d.id === (newData.department as { id: number })?.id);
      setData((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newData.name ?? '',
          age: newData.age ?? 0,
          notes: newData.notes ?? '',
          salary: newData.salary ?? 0,
          status: newData.status ?? 'full_time',
          department: dept ?? { id: 1, name: 'Engineering' },
          start_date: newData.start_date ?? null,
          is_active: newData.is_active ?? true,
        },
      ]);
    },
    onDelete: async (id) => {
      await new Promise((r) => setTimeout(r, 400));
      setData((prev) => prev.filter((row) => row.id !== id));
    },
  });

  return <DataGrid tableProps={tableProps} />;
};
