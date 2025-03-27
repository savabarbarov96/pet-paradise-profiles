import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

import SideMenu from '@/components/SideMenu';
import FloatingPetProfiles from '@/components/FloatingPetProfiles';
import PremiumBackground from '@/components/PremiumBackground';
import { getUserPetProfiles, getMockPetProfiles } from '@/services/petProfileService';
import { PetProfile } from '@/services/petProfileService';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [newProfileId, setNewProfileId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('HomePage: Component mounted or location changed, fetching profiles...');
    fetchProfiles();
  }, [location.key, toast]);

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

  const fetchProfiles = async () => {
    console.log('HomePage: Starting to fetch pet profiles...');
    setLoading(true);
    try {
      const result = await getUserPetProfiles();
      console.log('HomePage: Profile fetch result:', result);
      setDebugInfo(prev => ({ ...prev, fetchResult: result }));

      if (result.success && result.data) {
        console.log('HomePage: Successfully fetched profiles:', result.data);
        setProfiles(result.data);
        setUsingMockData(false);
      } else {
        // Only use mock data if there's an error or no data
        console.log('HomePage: No profiles found or error occurred, using mock data');
        const mockData = getMockPetProfiles();
        setProfiles(mockData);
        setUsingMockData(true);
        
        if (result.error) {
          console.error('HomePage: Error fetching profiles:', result.error);
          setError(result.error);
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('HomePage: Unexpected error:', err);
      const mockData = getMockPetProfiles();
      setProfiles(mockData);
      setUsingMockData(true);
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/create-profile');
  };

  const handleRefresh = () => {
    fetchProfiles();
  };

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
      <SideMenu />
      <main className="flex-1 md:ml-64">
        <div className="relative min-h-screen">
          {/* Premium background */}
          <PremiumBackground />

          {/* Content */}
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <motion.h1 
                className="text-3xl font-handwritten text-bulgarian font-semibold text-white pl-10 md:pl-0"
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
                  className="bg-paradise hover:bg-paradise-dark font-handwritten"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Създаване на профил
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
                  profiles={profiles} 
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