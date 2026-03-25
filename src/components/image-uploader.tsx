'use client';

import Image from 'next/image';

import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Trash2Icon, Upload } from 'lucide-react';

type ImageValue = File | string;

export interface ImageUploaderProps {
  multiple?: boolean;
  value?: ImageValue | ImageValue[] | null;
  onChange?: (value: ImageValue | ImageValue[] | null) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  onError?: (message: string) => void;
  onSuccess?: () => void;
}

export function ImageUploader({
  multiple = true,
  value,
  onChange,
  onError,
  maxFiles = 10,
  maxFileSize = 10,
  onSuccess,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<ImageValue[]>(() =>
    value ? (Array.isArray(value) ? value : [value]) : []
  );
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync parent value if it changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!value) return setFiles([]);
    const arr = Array.isArray(value) ? value : [value];
    setFiles(arr);
  }, [value]);

  const processFiles = (incoming: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const newFiles: ImageValue[] = [];
    let errorMessage: string | null = null;

    incoming.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errorMessage = `"${file.name}" is not allowed. Only JPEG, PNG, or WEBP are accepted.`;
        return;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        errorMessage = `"${file.name}" exceeds ${maxFileSize}MB`;
        return;
      }
      newFiles.push(file);
    });

    if (errorMessage && newFiles.length === 0) {
      onError?.(errorMessage);
      return;
    }

    let updatedFiles = multiple ? [...files, ...newFiles] : [...newFiles];

    if (updatedFiles.length > maxFiles) {
      errorMessage = `You can upload up to ${maxFiles} files`;
      updatedFiles = updatedFiles.slice(0, maxFiles);
    }

    setFiles(updatedFiles);
    onChange?.(multiple ? updatedFiles : (updatedFiles[0] ?? null));

    if (errorMessage) {
      onError?.(errorMessage);
    } else {
      onSuccess?.();
    }
  };

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 0) return;
    processFiles(dropped);
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    onChange?.(multiple ? updated : (updated[0] ?? null));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload area */}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-muted' : 'hover:bg-muted'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={'rounded-sm border p-3'}>
          <Upload className="h-6 w-6" />
        </div>
        <p className="font-medium">
          {multiple ? `Drag and drop files or browse` : `Drag and drop file or browse`}
        </p>
        <p className="text-sm text-gray-500">JPEG, PNG, WEBP - Max {maxFileSize}MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={handleFilesChange}
        />
      </label>

      {/* Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file, i) => {
            const url = typeof file === 'string' ? file : URL.createObjectURL(file);
            return (
              <div key={i} className="relative overflow-hidden rounded-md shadow-md">
                <div className="relative h-32 w-full overflow-hidden rounded-md shadow-md">
                  <Image src={url} alt="image-preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 rounded-full bg-white/80 p-1 hover:bg-white"
                >
                  <Trash2Icon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
