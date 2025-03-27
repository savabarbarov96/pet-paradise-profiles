
import React from 'react';
import ImageUploader from '../ImageUploader';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';

const StepOne: React.FC<StepProps> = ({ profile, updateProfile, handleNext, totalSteps }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Step 1 of {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Welcome to Pet Paradise</h2>
        <p className="text-muted-foreground">Let's start by adding a photo of your beloved pet</p>
      </div>
      
      <ImageUploader onImageChange={(image) => updateProfile('image', image)} />
      
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

export default StepOne;
