import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PlusCircle, X, Heart, EyeOff, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const StepFour: React.FC<StepProps> = ({
  profile,
  updateProfile,
  handleNext,
  handleBack,
  totalSteps
}) => {
  const [newFavorite, setNewFavorite] = useState('');
  const [favorites, setFavorites] = useState<string[]>(profile.favoriteThings || []);
  const [isPrivate, setIsPrivate] = useState<boolean>(profile.is_private || false);

  const handleAddFavorite = () => {
    if (newFavorite.trim() !== '' && favorites.length < 10) {
      const updatedFavorites = [...favorites, newFavorite.trim()];
      setFavorites(updatedFavorites);
      updateProfile('favoriteThings', updatedFavorites);
      setNewFavorite('');
    }
  };

  const handleRemoveFavorite = (index: number) => {
    const updatedFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(updatedFavorites);
    updateProfile('favoriteThings', updatedFavorites);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFavorite();
    }
  };

  const handlePrivacyToggle = (checked: boolean) => {
    setIsPrivate(checked);
    updateProfile('is_private', checked);
    
    // Ensure can_remember_photo remains true even when profile is private
    updateProfile('can_remember_photo', true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Стъпка 4 от {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Поведение и предпочитания</h2>
        <p className="text-muted-foreground font-handwritten">Разкажете ни за навиците и любимите неща на {profile.name}</p>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        {/* Behaviors section */}
        <div className="space-y-3">
          <Label htmlFor="behaviors" className="text-base flex items-center gap-2">
            <span>Навици и поведение</span>
          </Label>
          <p className="text-xs text-muted-foreground -mt-2">
            Опишете особеностите в поведението на вашия любимец - как се държи, какво прави когато е щастлив/гладен/уморен, какви навици има
          </p>
          <Textarea
            id="behaviors"
            placeholder="Напр.: Обича да се крие под леглото когато чуе силни звуци. Винаги ме посреща на вратата когато се прибирам вкъщи..."
            value={profile.behaviors || ''}
            onChange={(e) => updateProfile('behaviors', e.target.value)}
            rows={5}
            className="resize-none font-handwritten"
          />
        </div>

        {/* Favorite things section */}
        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-paradise fill-paradise" />
            <span>Любими неща</span>
          </Label>
          <p className="text-xs text-muted-foreground -mt-2">
            Добавете любимите активности, играчки, храни или места на вашия любимец (до 10)
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="Напр. Игра с топка, Гушкане, Риба тон..."
              value={newFavorite}
              onChange={(e) => setNewFavorite(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 font-handwritten"
            />
            <Button
              type="button"
              onClick={handleAddFavorite}
              disabled={newFavorite.trim() === '' || favorites.length >= 10}
              className="bg-paradise hover:bg-paradise-dark"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Display favorite things as badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {favorites.map((fav, index) => (
              <Badge
                key={index}
                className="px-3 py-1.5 bg-paradise/10 hover:bg-paradise/20 text-paradise border-paradise/20 flex items-center gap-1.5 font-handwritten"
              >
                {fav}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleRemoveFavorite(index)}
                />
              </Badge>
            ))}

            {favorites.length === 0 && (
              <p className="text-xs italic text-muted-foreground">
                Все още няма добавени любими неща
              </p>
            )}
          </div>

          {favorites.length >= 10 && (
            <p className="text-xs text-amber-600">
              Достигнахте максималния брой любими неща (10)
            </p>
          )}
        </div>

        {/* Privacy settings section */}
        <div className="space-y-3 border-t pt-6">
          <Label htmlFor="privacy-toggle" className="text-base flex items-center gap-2">
            {isPrivate ? 
              <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
              <Eye className="h-4 w-4 text-paradise" />
            }
            <span>Настройки за поверителност</span>
          </Label>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Направи профила личен</p>
              <p className="text-xs text-muted-foreground">
                При личен профил, само вие ще виждате снимките и детайлите
              </p>
            </div>
            <Switch 
              id="privacy-toggle"
              checked={isPrivate}
              onCheckedChange={handlePrivacyToggle}
            />
          </div>
          
          <p className="text-xs text-paradise">
            Дори при личен профил, всеки ще може да запали свещ за почит и да добави снимка или спомен
          </p>
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

export default StepFour; 