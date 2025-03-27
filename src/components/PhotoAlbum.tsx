import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image, Plus, X, Upload, Video, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface MediaItem {
  id: string;
  url: string;
  thumbnail?: string;
  type: 'photo' | 'video';
  size?: number;
}

interface PhotoAlbumProps {
  media: MediaItem[];
  className?: string;
  petName: string;
  onUpload?: (files: File[]) => Promise<void>;
  onDelete?: (mediaId: string) => Promise<void>;
  onSetFeatured?: (mediaId: string) => Promise<void>;
  featuredMediaId?: string;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const PhotoAlbum: React.FC<PhotoAlbumProps> = ({
  media = [],
  className = '',
  petName,
  onUpload,
  onDelete,
  onSetFeatured,
  featuredMediaId
}) => {
  const [activeTab, setActiveTab] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate files
    const invalidFiles = files.filter(file => {
      if (file.type.startsWith('image/')) {
        return !SUPPORTED_IMAGE_TYPES.includes(file.type);
      } else if (file.type.startsWith('video/')) {
        return !SUPPORTED_VIDEO_TYPES.includes(file.type) || file.size > MAX_VIDEO_SIZE;
      }
      return true;
    });

    if (invalidFiles.length > 0) {
      toast({
        description: "Моля, качете само поддържани формати изображения (JPG, PNG, WebP) и видеа (MP4, WebM до 100MB)",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      await onUpload?.(files);
      toast({
        description: "Медийните файлове бяха качени успешно"
      });
    } catch (error) {
      toast({
        description: "Възникна проблем при качването на файловете",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await onDelete?.(mediaId);
      toast({
        description: "Файлът беше изтрит успешно"
      });
    } catch (error) {
      toast({
        description: "Възникна проблем при изтриването на файла",
        variant: "destructive"
      });
    }
  };

  const handleSetFeatured = async (mediaId: string) => {
    try {
      await onSetFeatured?.(mediaId);
      toast({
        description: "Избрано е за главно изображение"
      });
    } catch (error) {
      toast({
        description: "Възникна проблем при задаването на главно изображение",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="grid">Решетка</TabsTrigger>
            <TabsTrigger value="list">Списък</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].join(',')}
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>Качване...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Качи файлове
                </>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="grid">
          <ScrollArea className="h-[500px]">
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {media.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Все още няма качени снимки или видеа</p>
                </div>
              ) : (
                <>
                  {media.map((item, index) => (
                    <div key={item.id} className="mb-4 break-inside-avoid">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                            {featuredMediaId === item.id && (
                              <div className="absolute top-2 left-2 z-10">
                                <div className="bg-paradise/80 text-white p-1 rounded-full">
                                  <Star className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                            <AspectRatio ratio={1}>
                              {item.type === 'photo' ? (
                                <img 
                                  src={item.url} 
                                  alt={`${petName}'s photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={item.thumbnail || item.url} 
                                    alt={`${petName}'s video ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Video className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                              )}
                            </AspectRatio>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {onSetFeatured && item.type === 'photo' && (
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetFeatured(item.id);
                                  }}
                                  disabled={featuredMediaId === item.id}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
                          <div className="relative">
                            {item.type === 'photo' ? (
                              <img 
                                src={item.url} 
                                alt={`${petName}'s photo ${index + 1}`}
                                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                              />
                            ) : (
                              <video
                                src={item.url}
                                controls
                                className="w-full h-auto max-h-[85vh] rounded-lg"
                                poster={item.thumbnail}
                              />
                            )}
                            <button 
                              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                              onClick={() => handleDelete(item.id)}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {media.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Все още няма качени снимки или видеа</p>
                </div>
              ) : (
                media.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden relative">
                        {featuredMediaId === item.id && (
                          <div className="absolute top-0.5 left-0.5 z-10">
                            <div className="bg-paradise/80 text-white p-0.5 rounded-full">
                              <Star className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                        {item.type === 'photo' ? (
                          <img 
                            src={item.url} 
                            alt={`${petName}'s photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img 
                              src={item.thumbnail || item.url} 
                              alt={`${petName}'s video ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {item.type === 'photo' ? 'Снимка' : 'Видео'} {index + 1}
                        </p>
                        {item.type === 'video' && item.size && (
                          <p className="text-xs text-muted-foreground">
                            {Math.round(item.size / 1024 / 1024)}MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onSetFeatured && item.type === 'photo' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSetFeatured(item.id)}
                          disabled={featuredMediaId === item.id}
                        >
                          <Star className={`h-4 w-4 ${featuredMediaId === item.id ? 'text-paradise' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhotoAlbum; 