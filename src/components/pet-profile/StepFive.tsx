import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { StepThreeProps } from './types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, BadgeCheck } from 'lucide-react';

const StepFive: React.FC<StepThreeProps> = ({
  profile,
  totalSteps,
  handleComplete,
  handleBack,
  isSubmitting
}) => {
  const navigate = useNavigate();

  const handleCompletionAndRedirect = async () => {
    const result = await handleComplete();
    if (result.success && result.profileId) {
      navigate('/', { 
        state: { 
          newProfileCreated: true, 
          profileId: result.profileId,
          timestamp: Date.now()
        } 
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (err) {
      return '';
    }
  };

  const birthDate = formatDate(profile.birthDate);
  const deathDate = formatDate(profile.deathDate);

  // Format date range for display
  let dateRange = '';
  if (birthDate && deathDate) {
    dateRange = `${birthDate} - ${deathDate}`;
  } else if (birthDate) {
    dateRange = `Роден${profile.gender === 'female' ? 'а' : ''} на ${birthDate}`;
  }

  const species = profile.species === 'dog' 
    ? 'Куче' 
    : profile.species === 'cat' 
      ? 'Котка' 
      : 'Друго';

  // Format traits for display
  const traitsList = profile.traits || [];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6 animate-fade-in">
        <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
          Стъпка 5 от {totalSteps}
        </span>
        <h2 className="text-2xl font-display font-semibold mb-1">Преглед на профила</h2>
        <p className="text-muted-foreground">Всичко изглежда добре? Проверете и финализирайте.</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
        <div className="relative h-48 bg-gradient-to-r from-paradise/80 to-paradise-dark/80">
          {profile.image && (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <h1 className="text-3xl font-handwritten drop-shadow-sm">{profile.name}</h1>
            {profile.nickname && (
              <p className="text-white/90 text-lg font-handwritten italic">"{profile.nickname}"</p>
            )}
            {dateRange && (
              <div className="flex items-center mt-1 text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{dateRange}</span>
              </div>
            )}
            {traitsList.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {traitsList.map((trait, idx) => (
                  <Badge key={idx} className="bg-white/20 text-white border-white/20 font-normal">
                    {trait}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Details section */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg flex items-center">
              <BadgeCheck className="h-4 w-4 mr-2 text-paradise" />
              Детайли
            </h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {species && (
                <>
                  <div className="text-muted-foreground">Вид:</div>
                  <div>{species}</div>
                </>
              )}
              
              {profile.breed && (
                <>
                  <div className="text-muted-foreground">Порода:</div>
                  <div>{profile.breed}</div>
                </>
              )}
              
              {profile.gender && profile.gender !== 'unknown' && (
                <>
                  <div className="text-muted-foreground">Пол:</div>
                  <div>{profile.gender === 'male' ? 'Мъжки' : 'Женски'}</div>
                </>
              )}
            </div>
          </div>
          
          {/* Biography section */}
          {profile.bio && (
            <div className="space-y-2">
              <h3 className="font-medium">Биография</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line font-handwritten">{profile.bio}</p>
            </div>
          )}
          
          {/* Behaviors section */}
          {profile.behaviors && (
            <div className="space-y-2">
              <h3 className="font-medium">Поведение</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line font-handwritten">{profile.behaviors}</p>
            </div>
          )}
          
          {/* Favorite things section */}
          {profile.favoriteThings && profile.favoriteThings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Любими неща</h3>
              <div className="flex flex-wrap gap-1">
                {profile.favoriteThings.map((thing, idx) => (
                  <Badge key={idx} variant="outline" className="bg-paradise/5 text-paradise border-paradise/20 font-handwritten">
                    {thing}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Photos Gallery */}
          {profile.photos && profile.photos.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Галерия</h3>
              <div className="grid grid-cols-3 gap-2">
                {profile.photos.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-md overflow-hidden">
                    <img src={photo} alt={`${profile.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={isSubmitting}
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
          onClick={handleCompletionAndRedirect}
          disabled={isSubmitting}
          className={cn(
            "bg-paradise hover:bg-paradise-dark text-white rounded-full px-8 py-6",
            "flex items-center justify-center space-x-2 shadow-glow transform transition-all",
            "hover:scale-105 active:scale-95"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">Създаване...</span>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </>
          ) : (
            <>
              <span>Създай профил</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepFive; 