
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPetProfile, generateMultipleStories } from '@/services/storyService';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PetParadise = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [stories, setStories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const petData = await fetchPetProfile(id);
        
        if (petData) {
          setPet(petData);
          setStories(generateMultipleStories(petData.name, petData.traits, 3));
        } else {
          toast.error("Pet profile not found");
        }
      } catch (error) {
        console.error("Error loading pet paradise:", error);
        toast.error("Failed to load Pet Paradise");
      } finally {
        setLoading(false);
      }
    };

    loadPetData();
  }, [id]);

  const regenerateStories = () => {
    if (pet) {
      setStories(generateMultipleStories(pet.name, pet.traits, 3));
      toast.success("Generated new stories");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-paradise-light/30 to-serenity-light/30">
        <Navigation />
        <div className="h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-paradise-dark font-display text-xl">Creating paradise for your pet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-paradise-light/30 to-serenity-light/30">
        <Navigation />
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-display font-semibold text-gray-800 mb-4">Pet Not Found</h1>
          <p className="mb-6">We couldn't find this pet paradise. It may have been removed or you may have the wrong link.</p>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2" size={16} />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-paradise-light/30 to-serenity-light/30">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-semibold text-paradise-dark mb-2">
            {pet.name}'s Paradise
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A special place where {pet.name} lives on forever, full of joy and peace
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          {pet.featured_media_url && (
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-glow">
              <img 
                src={pet.featured_media_url} 
                alt={pet.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-paradise/30 to-transparent"></div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mb-8">
          <Button 
            onClick={regenerateStories}
            className="bg-paradise hover:bg-paradise-dark text-white rounded-full shadow-soft"
          >
            <RefreshCcw size={16} className="mr-2" />
            See New Stories
          </Button>
        </div>

        <div className="space-y-6">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-soft bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-paradise-light p-3 rounded-full text-paradise-dark">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-medium text-gray-800 mb-2">
                      Paradise Story {index + 1}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{story}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PetParadise;
