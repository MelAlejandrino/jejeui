'use client';
import { ImageUploader } from '@/components/image-uploader';
import { toast } from 'sonner';

export const ImageUploaderSingle = () => {
  return (
    <ImageUploader
      multiple={false}
      onSuccess={() => toast.success('File uploaded successfully!')}
      onError={(message) => toast.error(message)}
      maxFileSize={5}
    />
  );
};

export const ImageUploaderMultiple = () => {
  return (
    <ImageUploader
      onSuccess={() => toast.success('File uploaded successfully!')}
      onError={(message) => toast.error(message)}
      multiple
      maxFiles={8}
    />
  );
};
