import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GuestActions from '@/components/GuestActions';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, PawPrint, Lock, Unlock, Trash2, Image as ImageIcon, Flame } from 'lucide-react';
import ParticleParallaxBackground from '@/components/ParticleParallaxBackground';
import { useAuth } from '@/context/AuthContext';
import SideMenu from '@/components/SideMenu';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CandleLighting from '@/components/pet-profile/CandleLighting';

interface PetProfile {
  id: string;
  name: string;
  bio?: string;
  birth_date?: string;
  death_date?: string;
  species?: string;
  breed?: string;
  traits: string[];
  featured_media_url?: string;
  is_private: boolean;
  user_id: string;
}

interface PetMedia {
  id: string;
  storage_path: string;
  title?: string;
  description?: string;
  created_at: string;
  guest_name?: string;
}

interface PetTribute {
  id: string;
  content?: string;
  message?: string;  // Database might have 'message' field instead of 'content'
  created_at: string;
  guest_name?: string;
  author_name?: string; // Database might have 'author_name' field instead of 'guest_name'
}

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [media, setMedia] = useState<PetMedia[]>([]);
  const [tributes, setTributes] = useState<PetTribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchPetProfile();
    }
  }, [id]);

  const fetchPetProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setIsPrivate(profileData.is_private);

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('pet_media')
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData);

      // Fetch tributes
      const { data: tributeData, error: tributeError } = await supabase
        .from('pet_tributes')
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (tributeError) throw tributeError;
      
      // Map the tribute data to match our interface
      const mappedTributes = tributeData.map(tribute => ({
        id: tribute.id,
        content: tribute.message,
        created_at: tribute.created_at,
        guest_name: tribute.author_name
      }));
      
      setTributes(mappedTributes);

    } catch (error) {
      console.error('Error fetching pet profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async () => {
    if (!profile || !user) return;
    
    // Only the owner can update privacy
    if (profile.user_id !== user.id) {
      toast({
        title: "Not Authorized",
        description: "Only the owner can change profile privacy settings.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUpdatingPrivacy(true);
      const newIsPrivate = !isPrivate;
      
      const { error } = await supabase
        .from('pet_profiles')
        .update({ is_private: newIsPrivate })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      setIsPrivate(newIsPrivate);
      setProfile({...profile, is_private: newIsPrivate});
      
      toast({
        title: "Privacy Updated",
        description: `Profile is now ${newIsPrivate ? 'private' : 'public'}.`,
      });
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive"
      });
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (err) {
      return '';
    }
  };

  // Function to refresh media only
  const refreshMedia = async () => {
    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('pet_media')
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData);
    } catch (error) {
      console.error('Error refreshing media:', error);
    }
  };
  
  // Delete a media item
  const handleDeleteMedia = async (mediaId: string, storagePath: string) => {
    if (!user || !profile || user.id !== profile.user_id) return;
    
    try {
      // First delete from the database
      const { error: dbError } = await supabase
        .from('pet_media')
        .delete()
        .eq('id', mediaId);
        
      if (dbError) throw dbError;
      
      // Extract the storage path from the URL
      const pathParts = storagePath.split('/');
      const storageKey = pathParts.slice(pathParts.indexOf('public')).join('/');
      
      if (storageKey) {
        // Then try to delete from storage
        const { error: storageError } = await supabase.storage
          .from('pet_media')
          .remove([storageKey]);
          
        if (storageError) {
          console.error('Warning: File deleted from database but not from storage:', storageError);
        }
      }
      
      // Refresh the media list
      refreshMedia();
      
      toast({
        title: "Снимката е изтрита",
        description: "Снимката беше успешно изтрита от профила",
      });
      
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при изтриване на снимката",
        variant: "destructive"
      });
    }
  };
  
  // Function to refresh tributes only
  const refreshTributes = async () => {
    try {
      const { data: tributeData, error: tributeError } = await supabase
        .from('pet_tributes')
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (tributeError) throw tributeError;
      
      // Map the tribute data to match our interface
      const mappedTributes = tributeData.map(tribute => ({
        id: tribute.id,
        content: tribute.message,
        created_at: tribute.created_at,
        guest_name: tribute.author_name
      }));
      
      setTributes(mappedTributes);
    } catch (error) {
      console.error('Error refreshing tributes:', error);
    }
  };

  // Function to handle opening the image gallery
  const openImageGallery = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-paradise border-r-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Профилът не е намерен</h1>
          <p className="text-muted-foreground">Търсеният профил на домашен любимец не съществува.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Side Menu */}
      <SideMenu />
      
      <ParticleParallaxBackground>
        <div className="min-h-screen py-8 px-4 md:px-6 lg:px-8 w-full md:ml-20 lg:ml-72">
          <div className="max-w-7xl mx-auto">
            {/* Owner privacy controls */}
            {user && profile && user.id === profile.user_id && (
              <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPrivate ? (
                    <Lock className="h-5 w-5 text-paradise" />
                  ) : (
                    <Unlock className="h-5 w-5 text-paradise" />
                  )}
                  <div>
                    <p className="text-white font-medium">Поверителност на профила</p>
                    <p className="text-white/70 text-sm">
                      {isPrivate 
                        ? "Само вие можете да видите този профил" 
                        : "Профилът е публичен и гостите могат да добавят снимки и послания"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="privacy-mode" className="text-white">
                    {updatingPrivacy ? "Актуализиране..." : (isPrivate ? "Личен" : "Публичен")}
                  </Label>
                  <Switch
                    id="privacy-mode"
                    checked={isPrivate}
                    onCheckedChange={togglePrivacy}
                    disabled={updatingPrivacy}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-white/10">
                  <div className="h-64 md:h-96 relative bg-gradient-to-r from-paradise/60 to-paradise-dark/60">
                    {profile?.featured_media_url && (
                      <img 
                        src={profile.featured_media_url}
                        alt={profile.name}
                        className="w-full h-full object-cover opacity-70"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {profile?.name}
                      </h1>
                      {(profile?.birth_date || profile?.death_date) && (
                        <div className="flex items-center mt-2 text-lg opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          <Calendar className="h-5 w-5 mr-2" />
                          {formatDate(profile.birth_date)} 
                          {profile?.birth_date && profile?.death_date && " - "} 
                          {formatDate(profile?.death_date)}
                        </div>
                      )}
                      {profile?.species && (
                        <div className="flex items-center mt-2 text-lg opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          <PawPrint className="h-5 w-5 mr-2" />
                          {profile.species.charAt(0).toUpperCase() + profile.species.slice(1)}
                          {profile.breed && ` • ${profile.breed}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {profile?.bio && (
                      <p className="text-white/90 text-lg whitespace-pre-line">
                        {profile.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile?.traits.map((trait, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-paradise/30 text-white text-sm rounded-full font-handwritten drop-shadow-sm"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Photo Gallery */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-white">Галерия</h2>
                    {media.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Виж всички снимки
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-md border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-h-[80vh] overflow-y-auto">
                            {media.map((item, index) => (
                              <div 
                                key={item.id} 
                                className="aspect-square cursor-pointer relative group rounded-lg overflow-hidden"
                                onClick={() => openImageGallery(index)}
                              >
                                <img
                                  src={item.storage_path}
                                  alt={item.title || 'Снимка на любимец'}
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                                {item.guest_name && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                                    Добавено от {item.guest_name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.slice(0, 8).map((item, index) => (
                      <div 
                        key={item.id} 
                        className="aspect-square relative group cursor-pointer"
                        onClick={() => openImageGallery(index)}
                      >
                        <img
                          src={item.storage_path}
                          alt={item.title || 'Снимка на любимец'}
                          className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        {item.guest_name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                            Добавено от {item.guest_name}
                          </div>
                        )}
                        {user && profile && user.id === profile.user_id && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(item.id, item.storage_path);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {media.length === 0 && (
                      <p className="text-white/70 text-center italic col-span-full">Все още няма снимки</p>
                    )}
                    {media.length > 8 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="aspect-square flex items-center justify-center cursor-pointer bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="text-center">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-white/70" />
                              <p className="text-white/70">+{media.length - 8} още</p>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-md border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-h-[80vh] overflow-y-auto">
                            {media.map((item, index) => (
                              <div 
                                key={item.id} 
                                className="aspect-square cursor-pointer relative group rounded-lg overflow-hidden"
                                onClick={() => openImageGallery(index)}
                              >
                                <img
                                  src={item.storage_path}
                                  alt={item.title || 'Снимка на любимец'}
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                                {item.guest_name && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                                    Добавено от {item.guest_name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Memorial Candle Section - shown for all pets */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10">
                  <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-amber-500" />
                    Запали свещ за {profile.name}
                  </h2>
                  <CandleLighting petName={profile.name} petId={profile.id} />
                </div>

                {/* Tributes */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Послания</h2>
                  <div className="space-y-4">
                    {tributes.map((tribute) => (
                      <div 
                        key={tribute.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <p className="text-white/90 whitespace-pre-line">{tribute.content}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-white/70">
                          <span>{tribute.guest_name || 'Анонимен'}</span>
                          <span>{new Date(tribute.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {tributes.length === 0 && (
                      <p className="text-white/70 text-center italic">Все още няма послания</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <GuestActions 
                    petId={profile?.id || ''} 
                    isPrivate={isPrivate} 
                    onMediaAdded={refreshMedia}
                    onTributeAdded={refreshTributes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ParticleParallaxBackground>

      {/* Full screen image viewer */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative w-full max-w-5xl max-h-[90vh]">
            <Button 
              variant="ghost" 
              className="absolute top-4 right-4 text-white rounded-full bg-black/50"
              onClick={() => setSelectedImageIndex(null)}
            >
              ✕
            </Button>
            <Button 
              variant="ghost" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white rounded-full bg-black/50 h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev !== null ? 
                  (prev === 0 ? media.length - 1 : prev - 1) : null);
              }}
            >
              ←
            </Button>
            <Button 
              variant="ghost" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white rounded-full bg-black/50 h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev !== null ? 
                  (prev === media.length - 1 ? 0 : prev + 1) : null);
              }}
            >
              →
            </Button>
            <img 
              src={selectedImageIndex !== null ? media[selectedImageIndex]?.storage_path : ''} 
              alt="Full size view" 
              className="max-h-[90vh] max-w-full mx-auto object-contain"
            />
            {selectedImageIndex !== null && media[selectedImageIndex]?.guest_name && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/80">
                Added by {media[selectedImageIndex].guest_name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetProfile; 