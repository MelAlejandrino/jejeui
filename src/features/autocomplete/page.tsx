'use client';
import { AutoComplete, Option } from '@/components/autocomplete';
import { useState } from 'react';

const countries: Option[] = [
  { value: 'ph', label: 'Philippines' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'de', label: 'Germany' },
  { value: 'au', label: 'Australia' },
];

export const AutocompleteDemo = () => {
  const [freeForm, setFreeForm] = useState<Option | null>(null);

  return (
    <div>
      <AutoComplete
        options={countries}
        placeholder="Search or type anything..."
        value={freeForm}
        onValueChange={setFreeForm}
        onClear={() => setFreeForm(null)}
      />
      <p>Selected value: {freeForm?.label}</p>
    </div>
  );
};
