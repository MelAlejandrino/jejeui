import fs from 'fs';
import path from 'path';

const items = [
  {
    name: 'autocomplete',
    type: 'registry:component',
    title: 'Autocomplete',
    description: 'Combobox-style autocomplete input with filtering and free-form support.',
    dependencies: ['lucide-react', 'cmdk'],
    registryDependencies: ['command', 'skeleton'],
    files: [
      {
        path: 'components/ui/autocomplete.tsx',
        type: 'registry:component',
        source: 'src/components/autocomplete.tsx',
      },
    ],
  },
  {
    name: 'image-uploader',
    type: 'registry:component',
    title: 'Image Uploader',
    description: 'Drag-and-drop image uploader with preview and validation.',
    dependencies: ['lucide-react'],
    files: [
      {
        path: 'components/ui/image-uploader.tsx',
        type: 'registry:component',
        source: 'src/components/image-uploader.tsx',
      },
    ],
  },
  {
    name: 'virtualized-dropdown',
    type: 'registry:component',
    title: 'Virtualized Dropdown',
    description: 'A performant dropdown with virtualization for large datasets.',
    dependencies: ['@tanstack/react-virtual', 'lucide-react'],
    registryDependencies: ['command', 'popover', 'button', 'checkbox'],
    files: [
      {
        path: 'components/ui/virtualized-dropdown.tsx',
        type: 'registry:component',
        source: 'src/components/virtualized-dropdown.tsx',
      },
    ],
  },

  //   DATA GRID
  {
    name: 'data-grid',
    type: 'registry:component',
    title: 'Data Grid',
    description:
      'Inline CRUD table with create, edit, delete, validation, and pagination. No TanStack required.',
    dependencies: ['lucide-react', 'react-number-format', 'date-fns'],
    registryDependencies: [
      'field',
      'popover',
      'calendar',
      'table',
      'button',
      'input',
      'textarea',
      'spinner',
      'checkbox',
      'button-group',
      'select',
      'dropdown-menu',
      `https://diceui.com/r/scroller.json`,
      `https://jejeui.vercel.app/r/virtualized-dropdown.json`,
      `https://jejeui.vercel.app/r/date-picker.json`,
    ],
    files: [
      {
        path: 'components/data-grid/types.ts',
        target: 'components/data-grid/types.ts',
        type: 'registry:file',
        source: 'src/components/data-grid/types.ts',
      },
      {
        path: 'components/data-grid/use-table.ts',
        target: 'components/data-grid/use-table.ts',
        type: 'registry:file',
        source: 'src/components/data-grid/use-table.ts',
      },
      {
        path: 'components/data-grid/data-grid.tsx',
        target: 'components/data-grid/data-grid.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-grid.tsx',
      },
      {
        path: 'components/data-grid/data-table.tsx',
        target: 'components/data-grid/data-table.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table.tsx',
      },
      {
        path: 'components/data-grid/data-table-actions.tsx',
        target: 'components/data-grid/data-table-actions.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-actions.tsx',
      },
      {
        path: 'components/data-grid/data-table-cell-renderer.tsx',
        target: 'components/data-grid/data-table-cell-renderer.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-cell-renderer.tsx',
      },
      {
        path: 'components/data-grid/data-table-create-row.tsx',
        target: 'components/data-grid/data-table-create-row.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-create-row.tsx',
      },
      {
        path: 'components/data-grid/data-table-edit-row.tsx',
        target: 'components/data-grid/data-table-edit-row.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-edit-row.tsx',
      },
      {
        path: 'components/data-grid/data-table-form-actions.tsx',
        target: 'components/data-grid/data-table-form-actions.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-form-actions.tsx',
      },
      {
        path: 'components/data-grid/data-table-pagination.tsx',
        target: 'components/data-grid/data-table-pagination.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-pagination.tsx',
      },
      {
        path: 'components/data-grid/data-table-progress-spinner.tsx',
        target: 'components/data-grid/data-table-progress-spinner.tsx',
        type: 'registry:file',
        source: 'src/components/data-grid/data-table-progress-spinner.tsx',
      },
    ],
  },
  {
    name: 'date-picker',
    type: 'registry:component',
    title: 'Date Picker',
    description: 'A date picker component built on top of shadcn calendar and popover.',
    dependencies: ['date-fns', 'lucide-react'],
    registryDependencies: ['popover', 'calendar', 'button', 'field'],
    files: [
      {
        path: 'components/date-picker/date-picker.tsx',
        target: 'components/date-picker/date-picker.tsx',
        type: 'registry:file',
        source: 'src/components/date-picker/date-picker.tsx',
      },
    ],
  },
];

fs.mkdirSync('public/r', { recursive: true });

for (const item of items) {
  const files = item.files.map(({ source, ...rest }) => ({
    ...rest,
    content: fs.readFileSync(source, 'utf-8'),
  }));

  const output = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...item,
    files,
  };

  const outPath = path.join('public/r', `${item.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`built ${outPath}`);
}
