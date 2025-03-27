
import React, { useState } from 'react';
import Header from '../ui/Header';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPetProfile } from '@/services/petProfileService';
import ProgressBar from './ProgressBar';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { PetProfile } from './types';

const PetProfileCreation: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<PetProfile>({
    name: '',
    image: null,
    traits: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const totalSteps = 3;
  
  const updateProfile = (field: keyof PetProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNext = () => {
    // Validate current step
    if (step === 1 && !profile.image) {
      toast.error("Please upload a photo of your pet");
      return;
    }
    
    if (step === 2 && !profile.name.trim()) {
      toast.error("Please enter your pet's name");
      return;
    }
    
    if (step === totalSteps) {
      handleComplete();
      return;
    }
    
    setStep(prev => prev + 1);
  };
  
  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      const result = await createPetProfile(
        {
          name: profile.name,
          traits: profile.traits,
        }, 
        profile.image
      );
      
      if (result.success) {
        toast.success(`${profile.name}'s profile has been created`, {
          description: "They are now in Pet Paradise",
        });
        
        // Could redirect to a new page showing all pets or the specific pet
        // For now, we'll just reset the form
        setProfile({ name: '', image: null, traits: [] });
        setStep(1);
      } else {
        toast.error("Failed to create profile", {
          description: result.error || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error creating pet profile:", error);
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepOne 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            totalSteps={totalSteps} 
          />
        );
        
      case 2:
        return (
          <StepTwo 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            totalSteps={totalSteps} 
          />
        );
        
      case 3:
        return (
          <StepThree 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            totalSteps={totalSteps}
            handleComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-paradise-light/30 to-serenity-light/30">
      <Header currentStep={step} totalSteps={totalSteps} />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="w-full">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
          
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
};

export default PetProfileCreation;
