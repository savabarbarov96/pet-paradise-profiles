
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageChange: (image: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in-up">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        aria-label="Upload pet image"
      />
      
      {preview ? (
        <div className="relative w-64 h-64 mb-6">
          <img
            src={preview}
            alt="Pet preview"
            className="w-full h-full object-cover rounded-full shadow-medium border-4 border-white"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-medium"
            aria-label="Remove image"
          >
            <X className="w-5 h-5 text-soft-dark" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-64 h-64 rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-paradise-light/50 to-serenity-light/50 border-4 border-white/80 shadow-medium mb-6 cursor-pointer transition-all hover:shadow-glow"
        >
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            <>
              <Camera className="w-12 h-12 text-paradise-dark/70 mb-3" />
              <p className="text-sm text-center text-muted-foreground px-6 font-medium">
                Tap to upload a photo of your beloved pet
              </p>
            </>
          )}
        </div>
      )}

      <div className="glass-panel rounded-xl p-4 text-center max-w-xs">
        <p className="text-sm text-muted-foreground">
          Choose a beautiful photo that captures your pet's essence and personality
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
