import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideMenu from '@/components/SideMenu';
import FloatingPetProfiles from '@/components/FloatingPetProfiles';
import { getUserPetProfiles } from '@/services/petProfileService';
import { PetProfile } from '@/services/petProfileService';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ParadisePage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const result = await getUserPetProfiles();
      
      if (result.success && result.data) {
        setProfiles(result.data);
      } else {
        setProfiles([]);
        
        if (result.error) {
          setError(result.error);
          toast({
            title: 'Грешка',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      setProfiles([]);
      setError('Възникна неочаквана грешка');
      toast({
        title: 'Грешка',
        description: 'Възникна неочаквана грешка при зареждане на профили',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/create-profile');
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <SideMenu />
        <main className="flex-1 md:ml-64">
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-paradise border-r-transparent"></div>
              <p className="mt-4 text-paradise-dark">Зареждане на профили...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideMenu />
      <main className="flex-1 md:ml-64">
        <div className="relative min-h-screen">
          {/* Content */}
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <motion.h1 
                className="text-3xl font-handwritten font-semibold text-paradise"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Райски Кът за Любимците
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
                  Създаване на нов профил
                </Button>
              </motion.div>
            </div>

            <motion.div 
              className="mt-auto py-4 text-center text-paradise/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p className="font-handwritten mb-12">
                Запазете спомените за вашите любими домашни любимци завинаги
              </p>
            </motion.div>

            {/* Full height container for floating profiles */}
            <div className="flex-1 relative min-h-[calc(100vh-200px)]">
              {profiles.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center font-handwritten">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-paradise" />
                    <h3 className="text-xl font-semibold mb-2 text-paradise">Няма намерени профили</h3>
                    <p className="text-paradise/60 mb-4">Създайте първия си профил на домашен любимец!</p>
                    <Button onClick={handleCreateNew} className="font-handwritten">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Създаване на профил
                    </Button>
                  </div>
                </div>
              ) : (
                <FloatingPetProfiles 
                  profiles={profiles} 
                  highlightProfileId={null} 
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParadisePage; 