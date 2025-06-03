import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: string | null;
}

const ImageUpload = ({ onImageSelect, selectedImage }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors duration-200 text-center
          ${isDragActive ? 'border-mystical-accent bg-mystical-accent/10' : 'border-white/20'}
          hover:border-mystical-accent hover:bg-mystical-accent/5
        `}
      >
        <input {...getInputProps()} />
        {selectedImage ? (
          <div className="space-y-4">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-48 object-cover rounded-lg mx-auto"
            />
            <p className="text-sm text-white/70">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-mystical-accent" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                {isDragActive ? 'Drop your image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-white/70">
                Drag and drop or click to select
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;