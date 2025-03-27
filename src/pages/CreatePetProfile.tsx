import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPetProfile } from '@/services/petProfileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import SideMenu from '@/components/SideMenu';
import { PawPrint } from 'lucide-react';

interface FormData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  traits: string[];
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  featured_media_url?: string;
  gender?: 'male' | 'female' | 'unknown';
}

const CreatePetProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    species: 'dog',
    traits: [],
    gender: 'unknown',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating pet profile with data:', formData);
      const result = await createPetProfile(formData);
      console.log('Create profile result:', result);

      if (result.success && result.profileId) {
        toast({
          title: 'Success',
          description: 'Pet profile created successfully!',
          duration: 5000,
          variant: 'default',
        });
        // Navigate to home page with the new profile data
        navigate('/', { 
          state: { 
            newProfile: {
              id: result.profileId,
              ...formData
            }
          }
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create pet profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating pet profile:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTraitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const traits = e.target.value.split(',').map(trait => trait.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      traits
    }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideMenu />
      <main className="flex-1 md:ml-64 p-6 bg-gradient-to-b from-paradise-light/20 to-serenity-light/20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-paradise/10 rounded-full flex items-center justify-center mb-4">
              <PawPrint className="h-8 w-8 text-paradise" />
            </div>
            <h1 className="text-3xl font-display font-semibold mb-2">Create Pet Profile</h1>
            <p className="text-muted-foreground">Fill in the details about your beloved pet</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Pet's Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your pet's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Select
                value={formData.species}
                onValueChange={(value: 'dog' | 'cat' | 'other') => handleInputChange('species', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed (optional)</Label>
              <Input
                id="breed"
                value={formData.breed || ''}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="Enter breed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="traits">Traits (comma-separated)</Label>
              <Input
                id="traits"
                value={formData.traits.join(', ')}
                onChange={handleTraitsChange}
                placeholder="Friendly, Playful, Loyal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'unknown') => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown/Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your pet..."
                className="h-32"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date (optional)</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deathDate">Death Date (optional)</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate || ''}
                  onChange={(e) => handleInputChange('deathDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_media_url">Profile Picture URL (optional)</Label>
              <Input
                id="featured_media_url"
                type="url"
                value={formData.featured_media_url || ''}
                onChange={(e) => handleInputChange('featured_media_url', e.target.value)}
                placeholder="https://example.com/pet-photo.jpg"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-paradise hover:bg-paradise-dark"
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePetProfile; 