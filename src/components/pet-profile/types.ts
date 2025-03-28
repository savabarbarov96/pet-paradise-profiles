export interface PetProfile {
  name: string;
  image: string | null;
  traits: string | string[];
  bio?: string;
  behaviors?: string;
  birthDate?: string;
  deathDate?: string;
  species?: 'dog' | 'cat' | 'other';
  breed?: string;
  favoriteThings?: string[];
  photos?: string[];
  gender?: 'male' | 'female' | 'unknown';
  nickname?: string;
  is_private?: boolean;
  can_remember_photo?: boolean;
}

export interface StepProps {
  profile: PetProfile;
  updateProfile: (field: keyof PetProfile, value: any) => void;
  handleNext: () => void;
  handleBack?: () => void;
  totalSteps: number;
}

export interface StepFiveProps extends StepProps {
  handleComplete: () => Promise<any>;
  isSubmitting: boolean;
}

export interface StepThreeProps extends StepProps {
  handleComplete?: () => Promise<any>;
  isSubmitting?: boolean;
}

export interface StepFourProps extends StepProps {
}
