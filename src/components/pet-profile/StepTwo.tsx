
import React from 'react';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import PersonalitySelector from '../PersonalitySelector';
import { StepProps } from './types';

const StepTwo: React.FC<StepProps> = ({ profile, updateProfile, handleNext, totalSteps }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Step 2 of {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">What's their name?</h2>
        <p className="text-muted-foreground">Tell us what your furry friend was called</p>
      </div>
      
      <div className="relative w-full max-w-sm mb-4 animate-fade-in-up">
        <img
          src={profile.image || 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'}
          alt="Pet"
          className="w-20 h-20 mx-auto object-cover rounded-full border-2 border-white shadow-medium mb-6"
        />
        
        <div className="input-glass relative w-full">
          <PawPrint className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-paradise" />
          <input
            type="text"
            placeholder="Enter your pet's name"
            value={profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            className="bg-transparent border-none w-full pl-12 focus:outline-none focus:ring-0"
            maxLength={20}
          />
        </div>
        
        <p className="text-xs text-right mt-1 text-muted-foreground">
          {profile.name.length}/20 characters
        </p>
      </div>
      
      <PersonalitySelector onTraitsChange={(traits) => updateProfile('traits', traits)} />
      
      <div className="mt-8 w-full max-w-sm flex justify-center">
        <Button 
          onClick={handleNext}
          className="bg-paradise hover:bg-paradise-dark text-white rounded-full px-8 py-6 flex items-center justify-center space-x-2 shadow-glow"
        >
          <span>Continue</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
