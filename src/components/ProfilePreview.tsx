import React, { useState, useRef } from 'react';
import { Heart, Star, Camera, Upload, X } from 'lucide-react';
import { uploadPetMedia } from '@/services/mediaService';

interface ProfilePreviewProps {
  petName: string;
  image: string | null;
  traits: string[];
  className?: string;
  petId?: string;
  isPublic?: boolean;
  onImageUpload?: (newImageUrl: string) => void;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ 
  petName, 
  image, 
  traits, 
  className = '',
  petId,
  isPublic = false,
  onImageUpload
}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1';
  const [isUploading, setIsUploading] = useState(false);
  const [showGuestNameInput, setShowGuestNameInput] = useState(false);
  const [guestName, setGuestName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (isPublic) {
      setShowGuestNameInput(true);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleGuestUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCancelGuestInput = () => {
    setShowGuestNameInput(false);
    setGuestName('');
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !petId) return;
    
    setIsUploading(true);
    try {
      // Upload the image using mediaService with isPublicProfile=true for public profiles
      // and pass the guest name for public uploads
      const result = await uploadPetMedia(
        petId, 
        [files[0]], 
        isPublic, 
        guestName || 'Anonymous Guest'
      );
      
      if (result.success && result.data && result.data.length > 0) {
        // Call the callback with the new image URL
        if (onImageUpload) {
          onImageUpload(result.data[0].url);
        }
        // Reset the guest name input
        setShowGuestNameInput(false);
        setGuestName('');
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className={`w-full animate-fade-in-up ${className}`}>
      <div className="glass-card p-6 overflow-hidden">
        <div className="absolute top-4 right-4">
          <Heart className="w-5 h-5 text-soft-dark" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-32 md:w-40 lg:w-48 aspect-square mb-4">
            <img
              src={image || defaultImage}
              alt={petName || "Your pet"}
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-medium"
            />
            <div className="absolute -bottom-2 -right-2 bg-paradise rounded-full p-1 shadow-soft">
              <Star className="w-5 h-5 text-white" />
            </div>
            
            {petId && isPublic && !showGuestNameInput && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleUploadClick}>
                <Camera className="w-8 h-8 text-white" />
                {isUploading && <span className="absolute text-xs text-white">Uploading...</span>}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
            
            {showGuestNameInput && (
              <div className="absolute -right-4 -left-4 -bottom-4 top-0 bg-white/90 rounded-xl shadow-medium flex flex-col items-center justify-center p-3 z-10">
                <button 
                  className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                  onClick={handleCancelGuestInput}
                >
                  <X className="w-5 h-5" />
                </button>
                <p className="text-xs text-center mb-2">Please enter your name to upload an image</p>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mb-2 p-1 text-sm border border-gray-300 rounded w-full"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <button
                  className="bg-paradise text-white text-xs px-3 py-1 rounded-full"
                  onClick={handleGuestUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            )}
          </div>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-semibold mb-2 text-center">
            {petName || "Your Pet's Name"}
          </h2>
          
          <div className="bg-paradise-light/50 text-paradise-dark text-xs md:text-sm font-medium px-3 py-1 rounded-full mb-4">
            Now in Pet Paradise
          </div>
          
          {traits.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {traits.slice(0, 5).map(trait => (
                <div key={trait} className="px-3 py-1 bg-serenity-light/70 text-serenity-dark rounded-full text-xs md:text-sm">
                  {trait}
                </div>
              ))}
              {traits.length > 5 && (
                <div className="px-3 py-1 bg-gentle-light/70 text-gentle-dark rounded-full text-xs md:text-sm">
                  +{traits.length - 5} more
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm md:text-base italic">No traits selected yet</p>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm md:text-base">
              {traits.length > 0 
                ? `${petName || "Your pet"} was ${traits[0].toLowerCase()}${traits.length > 1 ? ` and ${traits[1].toLowerCase()}` : ''}.` 
                : "Add some personality traits to see a preview."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
