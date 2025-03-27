
import React from 'react';
import { Button } from '@/components/ui/button';
import ProfilePreview from '../ProfilePreview';
import { StepProps } from './types';

const StepThree: React.FC<StepProps & { handleComplete: () => void; isSubmitting: boolean }> = ({ 
  profile, 
  totalSteps,
  handleComplete,
  isSubmitting
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Step 3 of {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Almost Done</h2>
        <p className="text-muted-foreground">Here's how your pet's profile will look</p>
      </div>
      
      <ProfilePreview
        petName={profile.name}
        image={profile.image}
        traits={profile.traits}
      />
      
      <div className="mt-8 w-full max-w-sm">
        <p className="text-center text-sm text-muted-foreground mb-4">
          {profile.name} will now live forever in Pet Paradise. You'll be able to revisit their memorial anytime.
        </p>
        
        <Button 
          onClick={handleComplete}
          disabled={isSubmitting}
          className="w-full bg-paradise hover:bg-paradise-dark text-white rounded-full px-8 py-6 flex items-center justify-center space-x-2 shadow-glow"
        >
          {isSubmitting ? (
            <span>Creating...</span>
          ) : (
            <>
              <span>Create {profile.name}'s Paradise</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6" />
                <path d="M14 2v6h6" />
                <path d="M18 14v4" />
                <path d="M18 22v.01" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
