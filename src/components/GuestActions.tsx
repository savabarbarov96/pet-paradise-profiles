import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Heart, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface GuestActionsProps {
  petId: string;
  isPrivate: boolean;
  onMediaAdded?: () => void;
  onTributeAdded?: () => void;
}

const GuestActions: React.FC<GuestActionsProps> = ({ 
  petId, 
  isPrivate, 
  onMediaAdded, 
  onTributeAdded 
}) => {
  const [uploading, setUploading] = useState(false);
  const [addingTribute, setAddingTribute] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [tributeText, setTributeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const guestUserId = uuidv4();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `public/${petId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet_media')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet_media')
        .getPublicUrl(filePath);

      // Create the database insert object
      const insertData = user ? {
        pet_id: petId,
        user_id: user.id,
        storage_path: publicUrl,
        media_type: 'photo',
        title: selectedFile.name,
      } : {
        pet_id: petId,
        user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for guests
        guest_user_id: guestUserId,
        guest_name: guestName || 'Anonymous Guest',
        storage_path: publicUrl,
        media_type: 'photo',
        title: selectedFile.name,
      };

      const { error: dbError } = await supabase
        .from('pet_media')
        .insert(insertData);

      if (dbError) throw dbError;

      // Reset form
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Show success toast
      toast({
        title: "Photo Uploaded",
        description: "Your photo has been uploaded successfully.",
      });
      
      // Notify parent component to refetch media
      if (onMediaAdded) {
        onMediaAdded();
      }
      
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your photo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTributeSubmit = async () => {
    if (!tributeText) return;
    if (!user && !guestName) {
      toast({
        title: "Name Required",
        description: "Please enter your name to add a tribute.",
        variant: "destructive"
      });
      return;
    }

    setAddingTribute(true);
    try {
      const guestUserId = uuidv4();
      
      // Create the database insert object
      const insertData = user ? {
        pet_id: petId,
        user_id: user.id,
        message: tributeText,
        author_name: user.email
      } : {
        pet_id: petId,
        user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for guests
        guest_user_id: guestUserId,
        message: tributeText,
        author_name: guestName
      };

      const { error } = await supabase
        .from('pet_tributes')
        .insert(insertData);

      if (error) throw error;

      // Reset form
      setTributeText('');
      if (!user) setGuestName('');
      
      // Show success toast
      toast({
        title: "Tribute Added",
        description: "Your tribute has been added successfully.",
      });
      
      // Notify parent component to refetch tributes
      if (onTributeAdded) {
        onTributeAdded();
      }
      
    } catch (error: any) {
      console.error('Error adding tribute:', error);
      toast({
        title: "Failed to Add Tribute",
        description: error.message || "There was an error adding your tribute.",
        variant: "destructive"
      });
    } finally {
      setAddingTribute(false);
    }
  };

  // Display a message about privacy but still show the functionality
  if (isPrivate) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 mb-4">
          <div className="flex items-center gap-3 text-white">
            <Info className="h-5 w-5 text-paradise" />
            <div>
              <h3 className="text-lg font-semibold">Уважение към паметта</h3>
              <p className="text-white/70">Този профил е личен, но все пак можете да добавите снимки или послания към любимеца.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Добави снимка</h3>
          <div className="space-y-4">
            {!user && (
              <div>
                <Label htmlFor="photo-guest-name" className="text-white">Вашето име</Label>
                <Input
                  id="photo-guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Въведете вашето име"
                  className="mt-1"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || (!user && !guestName)}
                className="bg-paradise hover:bg-paradise-dark"
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? 'Качване...' : 'Качи'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Добави трибют</h3>
          <div className="space-y-4">
            {!user && (
              <div>
                <Label htmlFor="guestName" className="text-white">Вашето име</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Въведете вашето име"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="tribute" className="text-white">Вашето послание</Label>
              <Textarea
                id="tribute"
                value={tributeText}
                onChange={(e) => setTributeText(e.target.value)}
                placeholder="Напишете вашето послание..."
                className="mt-1"
                rows={4}
              />
            </div>
            <Button
              onClick={handleTributeSubmit}
              disabled={!tributeText || addingTribute || (!user && !guestName)}
              className="w-full bg-paradise hover:bg-paradise-dark"
            >
              <Heart className="h-4 w-4 mr-2" />
              {addingTribute ? 'Добавяне...' : 'Добави послание'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">Добави снимка</h3>
        <div className="space-y-4">
          {!user && (
            <div>
              <Label htmlFor="photo-guest-name" className="text-white">Вашето име</Label>
              <Input
                id="photo-guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Въведете вашето име"
                className="mt-1"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || (!user && !guestName)}
              className="bg-paradise hover:bg-paradise-dark"
            >
              <Camera className="h-4 w-4 mr-2" />
              {uploading ? 'Качване...' : 'Качи'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">Добави трибют</h3>
        <div className="space-y-4">
          {!user && (
            <div>
              <Label htmlFor="guestName" className="text-white">Вашето име</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Въведете вашето име"
                className="mt-1"
              />
            </div>
          )}
          <div>
            <Label htmlFor="tribute" className="text-white">Вашето послание</Label>
            <Textarea
              id="tribute"
              value={tributeText}
              onChange={(e) => setTributeText(e.target.value)}
              placeholder="Напишете вашето послание..."
              className="mt-1"
              rows={4}
            />
          </div>
          <Button
            onClick={handleTributeSubmit}
            disabled={!tributeText || addingTribute || (!user && !guestName)}
            className="w-full bg-paradise hover:bg-paradise-dark"
          >
            <Heart className="h-4 w-4 mr-2" />
            {addingTribute ? 'Добавяне...' : 'Добави послание'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestActions; 