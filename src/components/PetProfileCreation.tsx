
import React, { useState } from 'react';
import Header from './ui/Header';
import ImageUploader from './ImageUploader';
import PersonalitySelector from './PersonalitySelector';
import ProfilePreview from './ProfilePreview';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { PawPrint } from 'lucide-react';

interface PetProfile {
  name: string;
  image: string | null;
  traits: string[];
}

const PetProfileCreation: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<PetProfile>({
    name: '',
    image: null,
    traits: []
  });
  
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
  
  const handleComplete = () => {
    // Here you would typically send the data to a backend
    toast.success(`${profile.name}'s profile has been created`, {
      description: "They are now in Pet Paradise",
    });
    console.log("Pet profile created:", profile);
    
    // Reset the form after submission
    // setProfile({ name: '', image: null, traits: [] });
    // setStep(1);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
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
        
      case 2:
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
        
      case 3:
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
                className="w-full bg-paradise hover:bg-paradise-dark text-white rounded-full px-8 py-6 flex items-center justify-center space-x-2 shadow-glow"
              >
                <span>Create {profile.name}'s Paradise</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6" />
                  <path d="M14 2v6h6" />
                  <path d="M18 14v4" />
                  <path d="M18 22v.01" />
                </svg>
              </Button>
            </div>
          </div>
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
          <div className="mb-6">
            <div className="progress-bar">
              <div 
                className="progress-bar-value" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
};

export default PetProfileCreation;
