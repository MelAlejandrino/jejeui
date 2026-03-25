'use client';

import VirtualizedDropdown from '@/components/virtualized-dropdown';
import { useState } from 'react';
interface MockDataInterface {
  id: number;
  name: string;
}

const mockData: MockDataInterface[] = [
  { id: 1, name: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer' },
  { id: 3, name: 'Full Stack Engineer' },
  { id: 4, name: 'UI/UX Designer' },
  { id: 5, name: 'DevOps Engineer' },
  { id: 6, name: 'QA Engineer' },
  { id: 7, name: 'Product Manager' },
  { id: 8, name: 'Data Scientist' },
  { id: 9, name: 'Mobile Developer' },
  { id: 10, name: 'Systems Architect' },
  { id: 11, name: 'Security Engineer' },
  { id: 12, name: 'Database Administrator' },
  { id: 13, name: 'Frontend Developer (React)' },
  { id: 14, name: 'Backend Developer (Node.js)' },
  { id: 15, name: 'Frontend Developer (Vue)' },
  { id: 16, name: 'DevOps Engineer (AWS)' },
  { id: 17, name: 'DevOps Engineer (Azure)' },
  { id: 18, name: 'Data Analyst' },
  { id: 19, name: 'Machine Learning Engineer' },
  { id: 20, name: 'Blockchain Developer' },
  ...Array.from({ length: 5000 }, (_, i) => ({
    id: 21 + i,
    name: `Software Engineer ${String(i + 1).padStart(4, '0')}`,
  })),
];

export const VirtualizedDropdownSingleSelectDemo = () => {
  const [value, setValue] = useState<number | null>(null);
  return (
    <VirtualizedDropdown<MockDataInterface>
      single
      data={mockData}
      value={value as MockDataInterface | null}
      onChange={(val) => {
        if (!val) {
          return;
        }
        if (Array.isArray(val)) {
          return;
        }
        setValue(val.id);
      }}
    />
  );
};

export const VirtualizedDropdownMultiSelectDemo = () => {
  const [values, setValues] = useState<MockDataInterface[]>([]);

  return (
    <VirtualizedDropdown
      keepOpenOnSelect
      data={mockData}
      value={values}
      onChange={(val) => {
        if (!val) {
          return;
        }
        if (!Array.isArray(val)) {
          return;
        }
        setValues(val);
      }}
    />
  );
};

export const VirtualizedDropdownDisabledDemo = () => {
  const [value, setValue] = useState<number | null>(1);
  return (
    <VirtualizedDropdown<MockDataInterface>
      single
      disabled
      data={mockData}
      value={value as MockDataInterface | null}
      onChange={(val) => {
        if (!val) {
          return;
        }
        if (Array.isArray(val)) {
          return;
        }
        setValue(val.id);
      }}
    />
  );
};
