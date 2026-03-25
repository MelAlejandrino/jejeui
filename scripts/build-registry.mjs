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
