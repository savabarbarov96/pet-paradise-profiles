import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from './types';
import { cn } from '@/lib/utils';

const StepTwo: React.FC<StepProps> = ({ 
  profile, 
  updateProfile, 
  handleNext, 
  handleBack, 
  totalSteps 
}) => {
  const handleGenderChange = (value: string) => {
    updateProfile('gender', value);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Стъпка 2 от {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Базова информация</h2>
        <p className="text-muted-foreground font-handwritten">Нека разберем малко повече за вашия любимец</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-base">Име на любимеца</Label>
          <Input
            id="name"
            type="text"
            placeholder="Как се казва вашият любимец?"
            value={profile.name || ''}
            onChange={(e) => updateProfile('name', e.target.value)}
            className="h-12 text-lg font-handwritten"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base">Пол</Label>
          <RadioGroup 
            value={profile.gender || 'unknown'} 
            onValueChange={handleGenderChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="male" 
                id="male" 
                className="text-paradise"
              />
              <Label htmlFor="male" className="font-normal cursor-pointer">Мъжки</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="female" 
                id="female" 
                className="text-paradise" 
              />
              <Label htmlFor="female" className="font-normal cursor-pointer">Женски</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="unknown" 
                id="unknown" 
                className="text-paradise" 
              />
              <Label htmlFor="unknown" className="font-normal cursor-pointer">Не знам</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="nickname" className="text-base">Прякор (по желание)</Label>
          <Input
            id="nickname"
            type="text"
            placeholder="Има ли вашият любимец прякор?"
            value={profile.nickname || ''}
            onChange={(e) => updateProfile('nickname', e.target.value)}
            className="h-12 text-lg font-handwritten"
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="traits" className="text-base">Черти на характера</Label>
          <p className="text-xs text-muted-foreground -mt-2">
            Разделете ги със запетая (напр. "Игрив, Любвеобилен, Енергичен")
          </p>
          <Input
            id="traits"
            type="text"
            placeholder="Опишете личността на вашия любимец"
            value={Array.isArray(profile.traits) ? profile.traits.join(', ') : ''}
            onChange={(e) => {
              // Split the comma-separated string into an array, trim whitespace, and filter empty values
              const traitsArray = e.target.value
                .split(',')
                .map(trait => trait.trim())
                .filter(trait => trait.length > 0);
              updateProfile('traits', traitsArray);
            }}
            className="h-12 text-lg"
          />
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm flex justify-between">
        <Button 
          onClick={handleBack}
          variant="outline"
          className={cn(
            "rounded-full px-6 py-6 flex items-center justify-center space-x-2",
            "transform transition-all hover:scale-105 active:scale-95 border-paradise/40"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 12-14 0" />
            <path d="m12 5-7 7 7 7" />
          </svg>
          <span>Назад</span>
        </Button>
        
        <Button 
          onClick={handleNext}
          className={cn(
            "bg-paradise hover:bg-paradise-dark text-white rounded-full px-6 py-6",
            "flex items-center justify-center space-x-2 shadow-glow transform transition-all",
            "hover:scale-105 active:scale-95"
          )}
          disabled={!profile.name}
        >
          <span>Продължи</span>
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
