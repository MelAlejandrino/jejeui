'use client';

import VirtualizedDropdown from '@/components/virtualized-dropdown';
import { useState } from 'react';

interface MockDataInterface {
  id: number;
  name: string;
}

const mockData: MockDataInterface[] = [
  {
    id: 1,
    name: 'test',
  },
  {
    id: 2,
    name: 'test - 2',
  },
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
