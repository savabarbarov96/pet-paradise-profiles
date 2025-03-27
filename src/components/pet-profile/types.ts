
export interface PetProfile {
  name: string;
  image: string | null;
  traits: string[];
}

export interface StepProps {
  profile: PetProfile;
  updateProfile: (field: keyof PetProfile, value: any) => void;
  handleNext: () => void;
  totalSteps: number;
}
