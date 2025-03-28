import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle, VolumeX, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

import SideMenu from '@/components/SideMenu';
import FloatingPetProfiles from '@/components/FloatingPetProfiles';
import PremiumBackground from '@/components/PremiumBackground';
import { getUserPetProfiles, getMockPetProfiles } from '@/services/petProfileService';
import { PetProfile } from '@/services/petProfileService';
import { SimplePetProfile } from '@/components/floating-profiles/types';

interface DebugInfo {
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [simpleProfiles, setSimpleProfiles] = useState<SimplePetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [newProfileId, setNewProfileId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    message: '',
    timestamp: new Date().toISOString()
  });
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Define fetchProfiles using useCallback to avoid dependency issues
  const fetchProfiles = useCallback(async () => {
    console.log('HomePage: Fetching profiles...');
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserPetProfiles();
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('HomePage: Got profile data from database:', result.data);
        setProfiles(result.data);
        setUsingMockData(false);
      } else {
        // If no profiles or error, fall back to mock data for better UX
        console.log('HomePage: No profiles found or error, using mock data');
        setProfiles(getMockPetProfiles());
        setUsingMockData(true);
        
        if (result.error) {
          toast({
            title: "Could not connect to database",
            description: "Using sample data instead. Your profiles will not be saved.",
            variant: "destructive",
          });
          setDebugInfo({
            message: 'Failed to load profiles',
            error: result.error,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('HomePage: Error fetching profiles:', err);
      setProfiles(getMockPetProfiles());
      setUsingMockData(true);
      setDebugInfo({
        message: 'Exception when loading profiles',
        error: String(err),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initialize audio player with autoplay attempt
  useEffect(() => {
    // Initialize audio when component mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set initial volume to 30%
      audioRef.current.loop = true; // Loop the music
      
      // Try to play audio immediately (may be blocked by browser)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, set up event listeners for user interaction
          const playAudio = () => {
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play().catch(e => 
                console.error("Failed to play audio after user interaction:", e)
              );
              
              // Remove listeners after successful play attempt
              document.removeEventListener('click', playAudio);
              document.removeEventListener('keydown', playAudio);
              document.removeEventListener('touchstart', playAudio);
              document.removeEventListener('scroll', playAudio);
            }
          };
          
          // Add event listeners for common user interactions
          document.addEventListener('click', playAudio, { once: true });
          document.addEventListener('keydown', playAudio, { once: true });
          document.addEventListener('touchstart', playAudio, { once: true });
          document.addEventListener('scroll', playAudio, { once: true });
        });
      }
    }
  }, []);

  // Toggle mute/unmute function
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Fetch profiles when component mounts or location changes
  useEffect(() => {
    console.log('HomePage: Component mounted or location changed, fetching profiles...');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchProfiles();
  }, [location.key]);

  useEffect(() => {
    if (location.state?.newProfile) {
      console.log('HomePage: New profile created, updating state...');
      const newProfile = location.state.newProfile;
      
      // Update profiles list with the new profile
      setProfiles(prevProfiles => {
        const updatedProfiles = [newProfile, ...prevProfiles];
        console.log('HomePage: Updated profiles list:', updatedProfiles);
        return updatedProfiles;
      });
      
      // Set the new profile ID for highlighting
      setNewProfileId(newProfile.id);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Profile created successfully! You can now see your pet on the home page',
        duration: 5000
      });
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  const handleCreateNew = () => {
    navigate('/create-profile');
  };

  const handleRefresh = () => {
    fetchProfiles();
  };

  // Convert PetProfile to SimplePetProfile for FloatingPetProfiles
  const convertToSimplePetProfiles = useCallback((profiles: PetProfile[]): SimplePetProfile[] => {
    return profiles.map(profile => ({
      id: profile.id || 'temp-' + Math.random().toString(36).substring(7),
      name: profile.name,
      featured_media_url: profile.featured_media_url
    }));
  }, []);

  // Update simpleProfiles whenever profiles change
  useEffect(() => {
    setSimpleProfiles(convertToSimplePetProfiles(profiles));
  }, [profiles, convertToSimplePetProfiles]);

  if (loading) {
    console.log('HomePage: Rendering loading state...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-paradise border-r-transparent"></div>
          <p className="mt-4 text-white">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('HomePage: Rendering error state:', error);
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-xl font-bold text-red-500">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  console.log('HomePage: Rendering profiles:', profiles);
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        src="/sounds/pet-paradise-background-music.mp3" 
        autoPlay 
        loop
        muted={isMuted}
        preload="auto"
      />
      
      {/* Music Controls */}
      <button 
        onClick={toggleMute} 
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition-all duration-300 shadow-lg"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      <SideMenu />
      <main className="flex-1 md:ml-64">
        <div className="relative min-h-screen">
          {/* Premium background */}
          <PremiumBackground />

          {/* Content */}
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <motion.h1 
                className="text-3xl font-handwritten font-semibold text-white text-center md:text-left w-full md:w-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Рай за Домашни Любимци
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  onClick={handleCreateNew}
                  className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-handwritten rounded-xl"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Вкарай душа в рая
                </Button>
              </motion.div>
            </div>

            {/* Always show the FloatingPetProfiles component */}
            <div className="flex-1 w-full h-[calc(100vh-150px)] relative bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
              {profiles.length === 0 && !loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Pet Profiles Found</h3>
                    <p className="text-white/60 mb-4">Create your first pet profile to get started!</p>
                    <Button onClick={handleCreateNew}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <FloatingPetProfiles 
                  profiles={simpleProfiles} 
                  highlightProfileId={newProfileId} 
                />
              )}
              
              {/* Show info banner if using mock data */}
              {!loading && usingMockData && (
                <div className="absolute bottom-4 left-4 right-4 bg-paradise-dark/80 text-white p-3 rounded-lg backdrop-blur-sm text-sm">
                  <p>⚠️ Using sample data as we couldn't connect to the database.</p>
                  <button 
                    onClick={fetchProfiles}
                    className="underline text-paradise-light mt-1"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            <motion.div 
              className="mt-auto py-4 text-center text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p className="font-handwritten">
                Запазете спомените за вашите любими домашни любимци завинаги
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 