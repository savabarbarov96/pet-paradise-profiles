import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPetProfile, generateMultipleStories } from '@/services/storyService';
import { deletePetProfile, updateProfilePrivacy } from '@/services/petProfileService';
import { fetchPetMedia, uploadPetMedia, deletePetMedia, setFeaturedMedia } from '@/services/mediaService';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCcw, 
  Home, 
  Calendar, 
  Heart, 
  Star, 
  PawPrint, 
  Image, 
  Trash2, 
  Lock, 
  Unlock, 
  Link as LinkIcon, 
  Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Tributes from '@/components/Tributes';
import ChatWindow from '@/components/ChatWindow';
import PhotoAlbum from '@/components/PhotoAlbum'; 
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { sub } from 'date-fns';
import SideMenu from '@/components/SideMenu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ParticleParallaxBackground from '@/components/ParticleParallaxBackground';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper to generate random past dates for story timestamps
const randomPastDate = (daysAgo = 30) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo) + 1;
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  return sub(now, {
    days: randomDays,
    hours: randomHours,
    minutes: randomMinutes
  });
};

interface MediaItem {
  id: string;
  url: string;
  thumbnail?: string;
  type: 'photo' | 'video';
  size?: number;
}

const PetParadise = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stories');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showAllTributes, setShowAllTributes] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [privateAccessError, setPrivateAccessError] = useState<string | null>(null);
  
  // Mock photo data - in a real app, this would come from the database
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadPetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const petData = await fetchPetProfile(id);
        
        if (petData) {
          // Check if this is an error response
          if ('error' in petData) {
            setPrivateAccessError(petData.error);
            setPet(null);
          } else {
            setPet(petData);
            setIsPrivate(petData.is_private || false);
            
            // Generate stories with timestamps for chat display
            const storyContents = generateMultipleStories(petData.name, petData.traits, 5);
            const formattedStories = storyContents.map(content => ({
              id: uuidv4(),
              content,
              timestamp: randomPastDate()
            }));
            
            // Sort stories by timestamp (newest first)
            formattedStories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setStories(formattedStories);
            
            // Fetch media for this pet profile
            await loadPetMedia(id);
          }
        } else {
          toast.error("Профилът не е намерен");
        }
      } catch (error) {
        console.error("Error loading pet paradise:", error);
        toast.error("Неуспешно зареждане на профил");
      } finally {
        setLoading(false);
      }
    };

    loadPetData();
  }, [id]);

  // New function to load pet media from Supabase
  const loadPetMedia = async (petId: string) => {
    try {
      const { success, data, error } = await fetchPetMedia(petId);
      
      if (success && data) {
        setPhotos(data);
      } else if (error) {
        console.error("Error fetching media:", error);
        // No need to show toast, just use empty array
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error loading pet media:", error);
      setPhotos([]);
    }
  };

  const regenerateStories = () => {
    if (pet) {
      const storyContents = generateMultipleStories(pet.name, pet.traits, 5);
      
      const newStories = storyContents.map(content => ({
        id: uuidv4(),
        content,
        timestamp: randomPastDate(7) // More recent stories
      }));
      
      // Combine with old stories and sort
      const allStories = [...newStories, ...stories];
      allStories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); 
      
      // Keep only the most recent 20 stories
      setStories(allStories.slice(0, 20));
      toast.success("Генерирани нови истории за " + pet.name);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const result = await deletePetProfile(id);
      if (result.success) {
        toast.success("Профилът е изтрит успешно");
        navigate('/profiles');
      } else {
        toast.error("Грешка при изтриване на профил", {
          description: result.error || "Моля, опитайте по-късно"
        });
      }
    } catch (error) {
      console.error("Error deleting pet profile:", error);
      toast.error("Възникна грешка", {
        description: "Неуспешно изтриване на профил"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePrivacyToggle = async () => {
    if (!id) return;
    
    try {
      setIsToggling(true);
      const newPrivacyState = !isPrivate;
      
      const result = await updateProfilePrivacy(id, newPrivacyState);
      if (result.success) {
        setIsPrivate(newPrivacyState);
        toast.success(newPrivacyState 
          ? "Профилът е вече личен" 
          : "Профилът е вече публичен"
        );
      } else {
        toast.error("Грешка при промяна на настройките", {
          description: result.error || "Моля, опитайте по-късно"
        });
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
      toast.error("Грешка при промяна на настройките");
    } finally {
      setIsToggling(false);
    }
  };

  const copyProfileLink = () => {
    if (!id) return;
    
    const url = window.location.origin + `/pet/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess(true);
        toast.success("Връзката е копирана в клипборда");
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Error copying link: ', err);
        toast.error("Грешка при копиране на връзката");
      });
  };

  // New handler for uploading media
  const handleMediaUpload = async (files: File[]) => {
    if (!id || !files.length) return;
    
    setUploading(true);
    try {
      const { success, data, error } = await uploadPetMedia(id, files, !isPrivate);
      
      if (success && data) {
        // Add the new media to the existing photos
        setPhotos(prevPhotos => [...data, ...prevPhotos]);
        toast.success("Медийните файлове бяха качени успешно");
      } else {
        toast.error("Грешка при качване", { description: error });
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Възникна проблем при качването на файловете");
    } finally {
      setUploading(false);
    }
  };

  // New handler for deleting media
  const handleMediaDelete = async (mediaId: string) => {
    if (!id || !mediaId) return;
    
    try {
      const { success, error } = await deletePetMedia(mediaId, !isPrivate);
      
      if (success) {
        // Remove the deleted media from the photos array
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== mediaId));
        toast.success("Медийният файл беше изтрит успешно");
      } else {
        toast.error("Грешка при изтриване", { description: error });
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Възникна проблем при изтриването на файла");
    }
  };

  // New handler for setting featured media
  const handleSetFeaturedMedia = async (mediaId: string) => {
    if (!id || !mediaId) return;
    
    try {
      const { success, error } = await setFeaturedMedia(id, mediaId);
      
      if (success) {
        // Update the pet object with the new featured media
        const mediaItem = photos.find(photo => photo.id === mediaId);
        if (mediaItem && pet) {
          setPet({
            ...pet,
            featured_media_url: mediaItem.url
          });
        }
        toast.success("Главното изображение беше променено успешно");
      } else {
        toast.error("Грешка при промяна на главното изображение", { description: error });
      }
    } catch (error) {
      console.error("Error setting featured media:", error);
      toast.error("Възникна проблем при промяната на главното изображение");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <SideMenu />
        <ParticleParallaxBackground>
          <main className="flex-1 md:ml-64 w-full">
            <div className="min-h-screen w-full">
              <div className="h-[80vh] flex items-center justify-center">
                <div className="text-center">
                  <div className="loading-spinner mb-4"></div>
                  <p className="text-white font-display text-xl drop-shadow-md">Създаване на рай за вашия любимец...</p>
                </div>
              </div>
            </div>
          </main>
        </ParticleParallaxBackground>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <SideMenu />
        <ParticleParallaxBackground>
          <main className="flex-1 md:ml-64 w-full">
            <div className="min-h-screen w-full">
              <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-display font-semibold text-white drop-shadow-md mb-4">
                  {privateAccessError || "Профилът не е намерен"}
                </h1>
                <p className="mb-6 text-white/90 drop-shadow-sm">
                  {privateAccessError 
                    ? "Този профил е зададен като личен от неговия създател и не е публично достъпен."
                    : "Не успяхме да намерим този профил. Възможно е да е бил премахнат или да имате грешна връзка."}
                </p>
                <Button asChild className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                  <Link to="/">
                    <Home className="mr-2" size={16} />
                    Към Началото
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </ParticleParallaxBackground>
      </div>
    );
  }

  // Format the pet's traits as badges
  const renderTraits = () => {
    if (!pet.traits || pet.traits.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {pet.traits.map((trait: string, index: number) => (
          <div 
            key={index} 
            className="px-3 py-1 bg-paradise/10 text-paradise-dark rounded-full text-sm flex items-center"
          >
            <Star className="h-3.5 w-3.5 mr-1 text-paradise" />
            {trait}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <SideMenu />
      <ParticleParallaxBackground>
        <main className="flex-1 md:ml-64 w-full">
          <div className="min-h-screen relative overflow-hidden w-full">
            {/* Content */}
            <div className="relative z-20 min-h-screen pb-28 lg:pb-16 w-full">
              <div className="w-full px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-16">
                
                {/* Header area with pet info */}
                <div className="mb-6 md:mb-8 text-center">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 drop-shadow-lg font-handwritten">
                    {pet.name} в Рая
                  </h1>
                  
                  <div className="mx-auto">
                    <p className="text-white/90 text-base md:text-lg drop-shadow-md mb-3 md:mb-6 font-handwritten">
                      Специално място, където {pet.name} живее във вашите спомени, изпълнени с любов и радост
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-8 mb-3 md:mb-6">
                      {/* Privacy Toggle and Copy Link buttons */}
                      <div className="flex flex-wrap gap-3 justify-center mb-3 md:mb-0">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Switch 
                            id="private-mode" 
                            checked={isPrivate} 
                            onCheckedChange={handlePrivacyToggle}
                            disabled={isToggling}
                          />
                          <Label htmlFor="private-mode" className="text-white cursor-pointer flex items-center text-sm">
                            {isPrivate ? (
                              <>
                                <Lock className="h-3.5 w-3.5 mr-1" />
                                <span>Личен</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3.5 w-3.5 mr-1" />
                                <span>Публичен</span>
                              </>
                            )}
                          </Label>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyProfileLink} 
                          className={`bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm ${
                            copySuccess ? 'bg-green-400/20 border-green-400/20' : ''
                          }`}
                        >
                          {copySuccess ? (
                            <>Копирано!</>
                          ) : (
                            <>
                              <LinkIcon className="h-3.5 w-3.5 mr-1" />
                              Копирай връзка
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pet info dates */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-8 text-white/80 mb-6">
                      {pet.birth_date && (
                        <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm">
                          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                          <span>Роден: {new Date(pet.birth_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {pet.death_date && (
                        <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm">
                          <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                          <span>Напуснал ни: {new Date(pet.death_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Traits */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
                      {pet.traits && pet.traits.map((trait: string, index: number) => (
                        <div 
                          key={index} 
                          className="px-2.5 md:px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs md:text-sm flex items-center font-handwritten"
                        >
                          <Star className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          {trait}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Main content area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                  {/* Chat window (takes 2/3 on large screens) */}
                  <div className={cn(
                    "lg:col-span-2",
                    activeTab === 'stories' ? 'block' : 'hidden lg:block'
                  )}>
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h2 className="text-xl md:text-2xl font-display font-semibold text-white drop-shadow-md font-handwritten">
                        Истории от Рая
                      </h2>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setDeleteDialogOpen(true)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/70 hover:bg-red-500/90 text-white backdrop-blur-sm text-xs md:text-sm"
                        >
                          <Trash2 size={14} className="mr-1.5 md:mr-2" />
                          Изтрий
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-[450px] md:h-[600px]">
                      <ChatWindow 
                        messages={stories} 
                        petName={pet.name}
                        className="h-full"
                      />
                    </div>
                  </div>
                  
                  {/* Photo album / tributes sidebar */}
                  <div className={cn(
                    activeTab === 'photos' || activeTab === 'tributes' ? 'block' : 'hidden lg:block'
                  )}>
                    <Tabs 
                      defaultValue="photos" 
                      value={activeTab} 
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="w-full grid grid-cols-2 bg-white/20 backdrop-blur-sm">
                        <TabsTrigger 
                          value="photos" 
                          className="data-[state=active]:bg-white/30 data-[state=active]:text-white font-handwritten text-sm"
                        >
                          <Image className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                          Снимки
                        </TabsTrigger>
                        <TabsTrigger 
                          value="tributes" 
                          className="data-[state=active]:bg-white/30 data-[state=active]:text-white font-handwritten text-sm"
                        >
                          <PawPrint className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                          Трибюти
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="photos" className="mt-3 md:mt-4">
                        <PhotoAlbum 
                          media={photos} 
                          petName={pet.name} 
                          onUpload={handleMediaUpload}
                          onDelete={handleMediaDelete}
                          onSetFeatured={handleSetFeaturedMedia}
                          featuredMediaId={photos.find(photo => photo.url === pet.featured_media_url)?.id}
                        />
                      </TabsContent>
                      
                      <TabsContent value="tributes" className="mt-3 md:mt-4">
                        <Card className="bg-white/20 backdrop-blur-md border-white/30">
                          <CardContent className="p-3 md:p-4">
                            <div className="flex justify-end mb-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowAllTributes(prev => !prev)}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-handwritten text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
                              >
                                <Eye className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5" />
                                {showAllTributes ? "Скрий" : "Виж всички"}
                              </Button>
                            </div>
                            <Tributes 
                              petId={id || ''} 
                              petName={pet.name} 
                              showAll={showAllTributes}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
              
              {/* Mobile navigation for content tabs */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-paradise-dark/60 backdrop-blur-lg p-2 z-50 border-t border-white/10 shadow-lg">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={activeTab === 'stories' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('stories')}
                    className={`${
                      activeTab === 'stories' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-white/80 border-white/15'
                    } font-handwritten text-sm py-1.5 h-auto hover:bg-white/15 hover:text-white shadow-md transition-all duration-300`}
                  >
                    Истории
                  </Button>
                  <Button 
                    variant={activeTab === 'photos' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('photos')}
                    className={`${
                      activeTab === 'photos' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-white/80 border-white/15'
                    } font-handwritten text-sm py-1.5 h-auto hover:bg-white/15 hover:text-white shadow-md transition-all duration-300`}
                  >
                    Снимки
                  </Button>
                  <Button 
                    variant={activeTab === 'tributes' ? 'default' : 'outline'} 
                    onClick={() => setActiveTab('tributes')}
                    className={`${
                      activeTab === 'tributes' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-white/80 border-white/15'
                    } font-handwritten text-sm py-1.5 h-auto col-span-2 hover:bg-white/15 hover:text-white shadow-md transition-all duration-300`}
                  >
                    Трибюти
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ParticleParallaxBackground>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на профил</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете профила на <strong>{pet?.name}</strong>?
              <br /><br />
              Това действие не може да бъде отменено. Всички снимки и данни, свързани с този профил,
              ще бъдат изтрити завинаги.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Изтриване...
                </>
              ) : (
                'Изтрий'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PetParadise; 