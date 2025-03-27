import React from 'react';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StepThree: React.FC<StepProps> = ({ 
  profile, 
  updateProfile,
  handleNext,
  handleBack,
  totalSteps
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Стъпка 3 от {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Разкажете повече за {profile.name}</h2>
        <p className="text-muted-foreground font-handwritten">Споделете специални подробности за вашия любимец</p>
      </div>
      
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        {/* Pet's biographical details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birth-date" className="text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4 text-paradise" />
                Дата на раждане
              </Label>
              <Input 
                id="birth-date"
                type="date"
                value={profile.birthDate || ''}
                onChange={(e) => updateProfile('birthDate', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="death-date" className="text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Дата на смърт (ако е приложимо)
              </Label>
              <Input 
                id="death-date"
                type="date"
                value={profile.deathDate || ''}
                onChange={(e) => updateProfile('deathDate', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="species" className="text-sm">Вид</Label>
              <Select 
                value={profile.species || 'dog'} 
                onValueChange={(value: 'dog' | 'cat' | 'other') => updateProfile('species', value)}
              >
                <SelectTrigger id="species" className="mt-1">
                  <SelectValue placeholder="Изберете вид" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Куче</SelectItem>
                  <SelectItem value="cat">Котка</SelectItem>
                  <SelectItem value="other">Друго</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="breed" className="text-sm">Порода (по желание)</Label>
              <Input 
                id="breed"
                type="text"
                placeholder="Напр. Булдог"
                value={profile.breed || ''}
                onChange={(e) => updateProfile('breed', e.target.value)}
                className="mt-1 font-handwritten"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio" className="text-sm flex items-center gap-1">
              <Info className="h-4 w-4 text-paradise" />
              Биография
            </Label>
            <p className="text-xs text-muted-foreground mb-1">
              Разкажете историята на вашия любимец - какво обича, откъде е, какви са неговите/нейните навици
            </p>
            <Textarea 
              id="bio"
              placeholder="Споделете интересни факти за вашия любимец..."
              value={profile.bio || ''}
              onChange={(e) => updateProfile('bio', e.target.value)}
              rows={4}
              className="resize-none font-handwritten"
            />
          </div>
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

export default StepThree;
