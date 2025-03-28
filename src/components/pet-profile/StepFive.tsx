import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { StepThreeProps } from './types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, BadgeCheck, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Image Viewer Modal component
const ImageViewer = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex,
  onNext,
  onPrevious,
  altText
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  images: string[]; 
  currentIndex: number;
  onNext: (specificIndex?: number) => void;
  onPrevious: () => void;
  altText: string;
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      if (e.key === 'ArrowLeft') onPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Disable scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onNext, onPrevious, onClose, currentIndex, images.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div 
          className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the content
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-50 bg-black/40 text-white hover:bg-black/60 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            {images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 z-40 bg-black/40 text-white hover:bg-black/60 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 z-40 bg-black/40 text-white hover:bg-black/60 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            <div className="max-h-[80vh] overflow-hidden flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`${altText} - ${currentIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white scale-125" : "bg-white/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Set active index directly
                    onNext(idx);
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Component for a single floating petal/feather
const FloatingPetal = ({ delay }: { delay: number }) => {
  const startX = Math.random() * 100;
  const startScale = 0.2 + Math.random() * 0.5;
  const duration = 8 + Math.random() * 7;
  
  return (
    <motion.div
      initial={{ 
        x: `${startX}%`, 
        y: -20, 
        opacity: 0,
        scale: startScale,
        rotate: Math.random() * 180
      }}
      animate={{ 
        y: "110vh", 
        x: `${startX + (Math.random() * 20 - 10)}%`,
        opacity: [0, 0.7, 0.5, 0],
        rotate: Math.random() * 360
      }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }}
      className="absolute pointer-events-none"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5.72C15.17 5.72 17.72 8.27 17.72 11.44C17.72 14.61 15.17 17.16 12 17.16C8.83 17.16 6.28 14.61 6.28 11.44C6.28 8.27 8.83 5.72 12 5.72ZM12 3C7.31 3 3.5 6.81 3.5 11.5C3.5 16.19 7.31 20 12 20C16.69 20 20.5 16.19 20.5 11.5C20.5 6.81 16.69 3 12 3Z" 
        fill="white" fillOpacity="0.3" />
      </svg>
    </motion.div>
  );
};

// Array of petals/feathers for the memorial scene
const FloatingPetals = () => {
  const petals = Array.from({ length: 20 }).map((_, i) => (
    <FloatingPetal key={i} delay={i * 0.5} />
  ));
  
  return <div className="fixed inset-0 overflow-hidden z-10">{petals}</div>;
};

const StepFive: React.FC<StepThreeProps> = ({
  profile,
  totalSteps,
  handleComplete,
  handleBack,
  isSubmitting
}) => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  // Create an array of all images (primary + gallery)
  const allImages = React.useMemo(() => {
    const images: string[] = [];
    if (profile.image) images.push(profile.image);
    if (profile.photos && profile.photos.length > 0) {
      images.push(...profile.photos);
    }
    return images;
  }, [profile.image, profile.photos]);

  // Function to open the image viewer
  const openImageViewer = (images: string[], startIndex: number) => {
    setViewerImages(images);
    setActiveImageIndex(startIndex);
    setViewerOpen(true);
  };

  // Navigation functions for the viewer
  const goToNextImage = (specificIndex?: number) => {
    if (typeof specificIndex === 'number') {
      setActiveImageIndex(specificIndex);
      return;
    }
    setActiveImageIndex((prev) => 
      prev === viewerImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToPreviousImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? viewerImages.length - 1 : prev - 1
    );
  };

  const handleCompletionAndTransition = async () => {
    // Include the privacy setting but make sure tributes and photos are always allowed
    if (profile.is_private) {
      profile.can_remember_photo = true;
    }
    
    const result = await handleComplete();
    if (result.success && result.profileId) {
      setProfileId(result.profileId);
      setIsSuccess(true);
    }
  };

  const navigateToMemorial = () => {
    navigate('/', { 
      state: { 
        newProfileCreated: true, 
        profileId: profileId,
        timestamp: Date.now()
      } 
    });
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
  const traitsList = typeof profile.traits === 'string' 
    ? profile.traits 
    : Array.isArray(profile.traits) && profile.traits.length > 0 
      ? profile.traits.join(', ') 
      : '';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        currentIndex={activeImageIndex}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
        altText={profile.name}
      />
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="profile-form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="text-center mb-6 animate-fade-in">
              <span className="inline-block px-3 py-1 bg-paradise-light text-paradise-dark rounded-full text-xs font-medium mb-2">
                Стъпка 5 от {totalSteps}
              </span>
              <h2 className="text-2xl font-display font-semibold mb-1">Преглед на профила</h2>
              <p className="text-muted-foreground">Всичко изглежда добре? Проверете и финализирайте.</p>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up mx-auto">
              <div 
                className="relative h-48 bg-gradient-to-r from-paradise/80 to-paradise-dark/80 cursor-pointer group"
                onClick={() => profile.image && openImageViewer([profile.image], 0)}
              >
                {profile.image && (
                  <>
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover opacity-50 transition-all duration-300 group-hover:opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        Щракнете за увеличаване
                      </div>
                    </div>
                  </>
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
                  {traitsList && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {typeof traitsList === 'string' ? (
                        <Badge className="bg-white/20 text-white border-white/20 font-normal">
                          {traitsList}
                        </Badge>
                      ) : (
                        Array.isArray(profile.traits) && profile.traits.map((trait, idx) => (
                          <Badge key={idx} className="bg-white/20 text-white border-white/20 font-normal">
                            {trait}
                          </Badge>
                        ))
                      )}
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
                        <div 
                          key={idx} 
                          className="aspect-square rounded-md overflow-hidden cursor-pointer relative group"
                          onClick={() => openImageViewer(profile.photos || [], idx)}
                        >
                          <img 
                            src={photo} 
                            alt={`${profile.name} ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-xs">Преглед</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 w-full max-w-sm flex justify-between mx-auto">
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
                onClick={handleCompletionAndTransition}
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
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"
            />
            <FloatingPetals />
            <motion.div 
              key="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1.5,
                delay: 0.5,
                staggerChildren: 0.3
              }}
              className="w-full max-w-md text-center mx-auto py-12 text-white z-20 relative"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.8 
                }}
                className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-8"
              >
                <Heart className="w-12 h-12 text-white/80" fill="#ffffff50" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.2 }}
                className="text-3xl font-handwritten text-white mb-6"
              >
                Спомените ще живеят вечно
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.6 }}
                className="text-lg text-white/80 mb-8 font-handwritten"
              >
                Профилът на {profile.name} вече е част от нашия рай. 
                Там, където любовта и спомените остават завинаги.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.2 }}
              >
                <Button 
                  onClick={navigateToMemorial}
                  className={cn(
                    "bg-transparent hover:bg-white/10 border border-white/40 text-white rounded-full px-8 py-6 mt-4",
                    "flex items-center justify-center space-x-2 shadow-glow transform transition-all",
                    "hover:scale-105 active:scale-95 mx-auto"
                  )}
                >
                  <span>Отиди при спомените за {profile.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepFive; 