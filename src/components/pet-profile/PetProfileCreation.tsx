import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../ui/Header';
import { toast } from 'sonner';
import { createPetProfile, deletePetProfile } from '@/services/petProfileService';
import ProgressBar from './ProgressBar';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import { PetProfile } from './types';

const PetProfileCreation: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<PetProfile>({
    name: '',
    image: null,
    traits: '',
    bio: '',
    behaviors: '',
    species: 'dog',
    photos: [],
    gender: 'unknown',
    favoriteThings: [],
    is_private: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 5;
  
  const updateProfile = (field: keyof PetProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  const handleNext = () => {
    // Validate current step
    if (step === 1 && !profile.image) {
      toast.error("Моля, качете снимка на вашия любимец", {
        description: "Нуждаем се от снимка, за да създадем профила"
      });
      return;
    }
    
    if (step === 2 && !profile.name.trim()) {
      toast.error("Моля, въведете името на вашия любимец", {
        description: "Името е задължително"
      });
      return;
    }
    
    if (step === totalSteps) {
      return handleComplete();
    }
    
    setStep(prev => prev + 1);
  };
  
  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Convert profile data to match the service interface requirements
      const profileData = {
        name: profile.name.trim(),
        traits: typeof profile.traits === 'string' 
          ? [profile.traits] // Convert string to single-item array for database compatibility
          : profile.traits || [],
        bio: profile.bio || '',
        behaviors: profile.behaviors || '',
        birthDate: profile.birthDate,
        deathDate: profile.deathDate,
        species: profile.species || 'other',
        breed: profile.breed || '',
        favoriteThings: profile.favoriteThings || [],
        is_private: profile.is_private || false,
        can_remember_photo: true, // Always allow photos and tributes regardless of privacy setting
        color: '' // Add the missing color field which is required in the database
      };
      
      // Get primary image and additional photos
      const primaryImage = profile.image;
      const additionalImages = profile.photos || [];
      
      const result = await createPetProfile(
        profileData,
        primaryImage,
        additionalImages
      );
      
      if (result.success) {
        toast.success(`Профилът на ${profile.name} е създаден успешно`, {
          description: "Вече е част от Рай за Домашни Любимци",
        });
        
        // Return the result for navigation in StepFive
        return result;
      } else {
        toast.error("Неуспешно създаване на профил", {
          description: result.error || "Моля, опитайте по-късно",
        });
        return { success: false };
      }
    } catch (error) {
      console.error("Error creating pet profile:", error);
      toast.error("Възникна грешка", {
        description: "Моля, опитайте по-късно",
      });
      return { success: false };
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
            handleBack={handlePrevious}
            totalSteps={totalSteps} 
          />
        );
        
      case 3:
        return (
          <StepThree 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            handleBack={handlePrevious}
            totalSteps={totalSteps}
          />
        );
        
      case 4:
        return (
          <StepFour 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            handleBack={handlePrevious}
            totalSteps={totalSteps}
          />
        );
        
      case 5:
        return (
          <StepFive 
            profile={profile} 
            updateProfile={updateProfile} 
            handleNext={handleNext} 
            handleBack={handlePrevious}
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
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Header currentStep={step} totalSteps={totalSteps} />
        
        <main className="container px-4 py-6 max-w-xl mx-auto">
          <motion.div 
            className="w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 relative z-20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProgressBar currentStep={step} totalSteps={totalSteps} />
            
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="relative z-30"
            >
              {renderStepContent()}
            </motion.div>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
};

export default PetProfileCreation;
