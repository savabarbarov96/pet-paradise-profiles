import React, { useState, useRef } from 'react';
import ImageUploader from '../ImageUploader';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';
import { Plus, X, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const StepOne: React.FC<StepProps> = ({ profile, updateProfile, handleNext, totalSteps }) => {
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(profile.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAdditionalPhotoUpload = (photoDataUrl: string | null) => {
    if (!photoDataUrl) return;
    
    const updatedPhotos = [...additionalPhotos, photoDataUrl];
    setAdditionalPhotos(updatedPhotos);
    updateProfile('photos', updatedPhotos);
  };
  
  const handleMultiplePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Limit total number of photos to 5
    const availableSlots = 5 - additionalPhotos.length;
    const filesToProcess = Math.min(files.length, availableSlots);
    
    if (filesToProcess <= 0) {
      alert("Достигнат е максимумът от 5 снимки. Моля премахнете някоя, за да добавите нова.");
      return;
    }
    
    setIsUploading(true);
    
    // Process each file
    const newPhotos: string[] = [];
    let processed = 0;
    
    for (let i = 0; i < filesToProcess; i++) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        newPhotos.push(reader.result as string);
        processed++;
        
        // When all files are processed
        if (processed === filesToProcess) {
          const updatedPhotos = [...additionalPhotos, ...newPhotos];
          setAdditionalPhotos(updatedPhotos);
          updateProfile('photos', updatedPhotos);
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(files[i]);
    }
    
    // Reset input
    e.target.value = '';
  };
  
  const removeAdditionalPhoto = (index: number) => {
    const updatedPhotos = additionalPhotos.filter((_, i) => i !== index);
    setAdditionalPhotos(updatedPhotos);
    updateProfile('photos', updatedPhotos);
  };
  
  const openMultiFileUpload = () => {
    if (multiFileInputRef.current) {
      multiFileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Стъпка 1 от {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Добре дошли в Рай за Домашни Любимци</h2>
        <p className="text-muted-foreground font-handwritten">Нека започнем със създаването на профила на вашия любимец</p>
      </div>
      
      {/* Main profile photo upload */}
      <div className="w-full max-w-md">
        <h3 className="text-md font-medium mb-2 text-center">Профилна снимка</h3>
        <ImageUploader onImageChange={(image) => updateProfile('image', image)} />
        
        {/* Additional photos section */}
        <div className="mt-8">
          <h3 className="text-md font-medium mb-3 text-center">Допълнителни снимки</h3>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Добавете още снимки на вашия любимец (по желание)
          </p>
          
          {/* Multiple file input (hidden) */}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={multiFileInputRef}
            onChange={handleMultiplePhotosUpload}
          />
          
          {/* Upload multiple button */}
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={openMultiFileUpload}
              disabled={additionalPhotos.length >= 5 || isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <span>Зареждане...</span>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Качете множество снимки</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            {/* Display uploaded additional photos */}
            {additionalPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden border border-input bg-background"
              >
                <img 
                  src={photo} 
                  alt={`Допълнителна снимка ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAdditionalPhoto(index)}
                  className="absolute top-1 right-1 bg-background/80 p-1 rounded-full"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
            
            {/* Add photo button */}
            {additionalPhotos.length < 5 && (
              <div className="relative aspect-square rounded-lg overflow-hidden border border-dashed border-paradise/40 bg-paradise/5 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleAdditionalPhotoUpload(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                />
                <div className="flex flex-col items-center text-paradise">
                  <Plus className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Добави</span>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-center mt-3 text-muted-foreground">
            Можете да добавите до 5 допълнителни снимки
          </p>
        </div>
      </div>
      
      <div className="mt-8 w-full max-w-sm flex justify-center">
        <Button 
          onClick={handleNext}
          className={cn(
            "bg-paradise hover:bg-paradise-dark text-white rounded-full px-8 py-6",
            "flex items-center justify-center space-x-2 shadow-glow transform transition-all",
            "hover:scale-105 active:scale-95"
          )}
        >
          <span>Продължи</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
