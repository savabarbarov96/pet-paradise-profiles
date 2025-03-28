import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPetProfiles, deletePetProfile } from '@/services/petProfileService';
import SideMenu from '@/components/SideMenu';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit, Eye, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
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

interface PetProfile {
  id?: string;
  name: string;
  featured_media_url?: string;
  traits: string[];
  bio?: string;
  birth_date?: string;
  death_date?: string;
  species?: 'dog' | 'cat' | 'other';
}

const PetProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

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
        toast.error("Грешка при зареждане на профили", {
          description: result.error || "Моля, опитайте по-късно"
        });
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Възникна грешка", {
        description: "Неуспешно зареждане на профили"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/create-profile');
  };

  const handleView = (id: string) => {
    navigate(`/pet/${id}`);
  };

  const handleEdit = (id: string) => {
    // In a real app, you would navigate to the edit page
    toast.info("Редактиране на профил", {
      description: "Функционалността за редактиране ще бъде добавена скоро"
    });
  };

  const confirmDelete = (id: string, name: string) => {
    setSelectedProfileId(id);
    setSelectedProfileName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProfileId) return;
    
    setIsDeleting(true);
    try {
      const result = await deletePetProfile(selectedProfileId);
      if (result.success) {
        toast.success("Профилът е изтрит успешно");
        setProfiles(profiles.filter(profile => profile.id !== selectedProfileId));
      } else {
        toast.error("Грешка при изтриване на профил", {
          description: result.error || "Моля, опитайте по-късно"
        });
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Възникна грешка", {
        description: "Неуспешно изтриване на профил"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedProfileId(null);
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideMenu />
      <ParticleParallaxBackground>
        <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                Профили на домашни любимци
              </h1>
              <Button 
                onClick={handleCreateNew}
                className="bg-paradise hover:bg-paradise-dark shadow-md w-full md:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Създай нов профил
              </Button>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-paradise border-r-transparent"></div>
                <p className="mt-4 text-white/90 drop-shadow-sm">Зареждане на профили...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center shadow-xl border border-white/10">
                <div className="mx-auto w-16 h-16 bg-paradise/20 rounded-full flex items-center justify-center mb-4 shadow-paradise/20 shadow-inner">
                  <PawPrint className="h-8 w-8 text-paradise" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Нямате профили на домашни любимци
                </h2>
                <p className="text-white/90 mb-6 font-handwritten text-base md:text-lg drop-shadow-sm">
                  Създайте профил на вашия любимец, за да започнете да използвате Рай за Домашни Любимци
                </p>
                <Button 
                  onClick={handleCreateNew}
                  className="bg-paradise hover:bg-paradise-dark shadow-md"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Създай първия профил
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {profiles.map((profile) => (
                  <div 
                    key={profile.id} 
                    className="bg-white/20 backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px] border border-white/20 flex flex-col"
                  >
                    <div className="h-40 md:h-48 lg:h-56 relative bg-gradient-to-r from-paradise/60 to-paradise-dark/60">
                      {profile.featured_media_url ? (
                        <img 
                          src={profile.featured_media_url} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white bg-gradient-to-t from-black/70 to-transparent">
                        <h2 className="text-xl md:text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          {profile.name}
                        </h2>
                        {(profile.birth_date || profile.death_date) && (
                          <div className="text-sm opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                            {formatDate(profile.birth_date)} 
                            {profile.birth_date && profile.death_date && " - "} 
                            {formatDate(profile.death_date)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="flex flex-wrap gap-1">
                        {profile.traits && profile.traits.slice(0, 3).map((trait, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-paradise/30 text-white text-xs md:text-sm rounded-full font-handwritten drop-shadow-sm"
                          >
                            {trait}
                          </span>
                        ))}
                        {profile.traits && profile.traits.length > 3 && (
                          <span className="px-2 py-0.5 bg-paradise/20 text-white text-xs rounded-full">
                            +{profile.traits.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between pt-2 gap-2">
                        <Button 
                          onClick={() => handleView(profile.id!)}
                          className="flex-1 bg-paradise/20 hover:bg-paradise/30 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Преглед
                        </Button>
                        <Button
                          onClick={() => handleEdit(profile.id!)}
                          className="flex-1 bg-paradise/20 hover:bg-paradise/30 text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Редакция
                        </Button>
                        <Button
                          onClick={() => confirmDelete(profile.id!, profile.name)}
                          variant="destructive"
                          className="bg-red-500/20 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </ParticleParallaxBackground>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на профил</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете профила на {selectedProfileName}? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
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

export default PetProfiles; 