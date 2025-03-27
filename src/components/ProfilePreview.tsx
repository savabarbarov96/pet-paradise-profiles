
import React from 'react';
import { Heart, Star } from 'lucide-react';

interface ProfilePreviewProps {
  petName: string;
  image: string | null;
  traits: string[];
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ petName, image, traits }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1';
  
  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-fade-in-up">
      <div className="glass-card p-6 overflow-hidden">
        <div className="absolute top-4 right-4">
          <Heart className="w-5 h-5 text-soft-dark" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <img
              src={image || defaultImage}
              alt={petName || "Your pet"}
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-medium"
            />
            <div className="absolute -bottom-2 -right-2 bg-paradise rounded-full p-1 shadow-soft">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-display font-semibold mb-2 text-center">
            {petName || "Your Pet's Name"}
          </h2>
          
          <div className="bg-paradise-light/50 text-paradise-dark text-xs font-medium px-3 py-1 rounded-full mb-4">
            Now in Pet Paradise
          </div>
          
          {traits.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {traits.slice(0, 5).map(trait => (
                <div key={trait} className="px-3 py-1 bg-serenity-light/70 text-serenity-dark rounded-full text-xs">
                  {trait}
                </div>
              ))}
              {traits.length > 5 && (
                <div className="px-3 py-1 bg-gentle-light/70 text-gentle-dark rounded-full text-xs">
                  +{traits.length - 5} more
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No traits selected yet</p>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
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
