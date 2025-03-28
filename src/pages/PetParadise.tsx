import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPetProfile, generateMultipleStories } from '@/services/storyService';
import { deletePetProfile, updateProfilePrivacy } from '@/services/petProfileService';
import { fetchPetMedia, uploadPetMedia, deletePetMedia, setFeaturedMedia } from '@/services/mediaService';
import Navigation from '@/components/Navigation'; // Assuming this might still be needed elsewhere, keeping import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    RefreshCcw,
    Home,
    Calendar,
    Heart,
    Star,
    PawPrint,
    Image as ImageIcon, // Renamed to avoid conflict with HTML Image
    Trash2,
    Lock,
    Unlock,
    Link as LinkIcon,
    Eye,
    Settings, // Added for management dropdown idea
    UploadCloud, // Added for upload indication
    ClipboardCopy, // Changed icon for copy
    ClipboardCheck // Added for copy success
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Tributes from '@/components/Tributes';
import ChatWindow from '@/components/ChatWindow';
import PhotoAlbum from '@/components/PhotoAlbum';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { sub, format } from 'date-fns'; // Import format
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added for management actions


// Define a basic Pet Profile interface (expand as needed)
interface PetProfile {
    id: string;
    name: string;
    birth_date: string | null;
    death_date: string | null;
    traits: string[];
    is_private: boolean;
    featured_media_url: string | null;
    species?: string; // Example: Dog, Cat
    breed?: string;   // Example: Golden Retriever, Siamese
    bio?: string;     // Example: A short description or epitaph
    // Add other relevant fields from your database schema
}

// Define Media Item interface
interface MediaItem {
    id: string;
    url: string;
    thumbnail?: string; // Optional: for video previews or optimized images
    type: 'photo' | 'video';
    size?: number; // Optional: file size
    created_at?: string; // Optional: upload date
}

// Define Story Item interface
interface StoryItem {
    id: string;
    content: string;
    timestamp: Date;
}

// Helper to generate random past dates for story timestamps
const randomPastDate = (daysAgo = 30): Date => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysAgo) + 1;
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    return sub(now, { days: randomDays, hours: randomHours, minutes: randomMinutes });
};

// Helper to format dates nicely
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMMM d, yyyy'); // Example: January 1, 2023
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};

const PetParadise = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State variables
    const [pet, setPet] = useState<PetProfile | null>(null);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
    const [isGeneratingStories, setIsGeneratingStories] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [privateAccessError, setPrivateAccessError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // --- Data Fetching ---
    const loadPetData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setPrivateAccessError(null); // Reset error on reload

        try {
            const petData = await fetchPetProfile(id);

            if (petData) {
                if ('error' in petData) {
                    setPrivateAccessError(petData.error);
                    setPet(null);
                } else {
                    // Explicitly cast to PetProfile - ensure fetchPetProfile returns matching structure
                    const profile = petData as PetProfile;
                    setPet(profile);

                    // Generate initial stories only if none exist or on first load
                    if (stories.length === 0) {
                       generateAndSetStories(profile.name, profile.traits);
                    }

                    // Fetch media
                    await loadPetMedia(id);
                }
            } else {
                setPrivateAccessError("Profile not found.");
                setPet(null);
                // Optionally show toast: toast.error("Профилът не е намерен");
            }
        } catch (error) {
            console.error("Error loading pet paradise:", error);
            toast.error("Failed to load profile. Please try again later.");
            setPrivateAccessError("An error occurred while loading the profile.");
            setPet(null);
        } finally {
            setLoading(false);
        }
    }, [id, stories.length]); // Added stories.length dependency to prevent story regeneration on unrelated updates

    const loadPetMedia = useCallback(async (petId: string) => {
        try {
            const { success, data, error } = await fetchPetMedia(petId);
            if (success && data) {
                setPhotos(data);
            } else if (error) {
                console.error("Error fetching media:", error);
                setPhotos([]); // Reset photos on error
            }
        } catch (error) {
            console.error("Error in loadPetMedia:", error);
            setPhotos([]); // Reset photos on exception
        }
    }, []); // Empty dependency array as it only depends on petId passed as argument

    useEffect(() => {
        loadPetData();
    }, [loadPetData]); // Depend on the memoized loadPetData function

    // --- Story Generation ---
    const generateAndSetStories = (petName: string, petTraits: string[], count = 5, append = false) => {
        setIsGeneratingStories(true);
        try {
            const storyContents = generateMultipleStories(petName, petTraits, count);
            const newStories: StoryItem[] = storyContents.map(content => ({
                id: uuidv4(),
                content,
                timestamp: randomPastDate(append ? 7 : 30) // More recent if appending
            }));

            setStories(prevStories => {
                const combined = append ? [...newStories, ...prevStories] : newStories;
                // Sort by timestamp (newest first)
                combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                // Keep a reasonable limit, e.g., 50
                return combined.slice(0, 50);
            });

            if (append) {
                toast.success(`Generated new stories for ${petName}!`);
            }
        } catch (error) {
             console.error("Error generating stories:", error);
             toast.error("Could not generate new stories.");
        } finally {
            setIsGeneratingStories(false);
        }
    };

    const handleRegenerateStories = () => {
        if (pet) {
            generateAndSetStories(pet.name, pet.traits, 5, true); // Append 5 new stories
        }
    };

    // --- Profile Management ---
    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            const result = await deletePetProfile(id);
            if (result.success) {
                toast.success("Profile deleted successfully.");
                navigate('/profiles'); // Navigate away after deletion
            } else {
                toast.error("Error deleting profile", { description: result.error || "Please try again." });
            }
        } catch (error) {
            console.error("Error deleting pet profile:", error);
            toast.error("An unexpected error occurred.", { description: "Failed to delete profile." });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handlePrivacyToggle = async () => {
        if (!id || !pet) return;
        setIsTogglingPrivacy(true);
        const newPrivacyState = !pet.is_private;
        try {
            const result = await updateProfilePrivacy(id, newPrivacyState);
            if (result.success) {
                // Update local pet state
                setPet(prevPet => prevPet ? { ...prevPet, is_private: newPrivacyState } : null);
                toast.success(newPrivacyState ? "Profile set to Private" : "Profile set to Public");
            } else {
                toast.error("Error updating privacy", { description: result.error || "Please try again." });
            }
        } catch (error) {
            console.error("Error toggling privacy:", error);
            toast.error("An unexpected error occurred.", { description: "Failed to update privacy settings." });
        } finally {
            setIsTogglingPrivacy(false);
        }
    };

    const copyProfileLink = () => {
        if (!id) return;
        const url = `${window.location.origin}/pet/${id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopySuccess(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setCopySuccess(false), 2500);
            })
            .catch(err => {
                console.error('Error copying link:', err);
                toast.error("Failed to copy link.");
            });
    };

    // --- Media Management ---
    const handleMediaUpload = async (files: File[]) => {
        if (!id || !pet || !files.length) return;
        setIsUploading(true);
        try {
            // Pass the profile's privacy state to the upload function
            const { success, data, error } = await uploadPetMedia(id, files, pet.is_private);
            if (success && data) {
                setPhotos(prevPhotos => [...data, ...prevPhotos].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())); // Add new media and re-sort
                toast.success(`${data.length} file(s) uploaded successfully!`);
            } else {
                toast.error("Upload failed", { description: error || "Could not upload files." });
            }
        } catch (error) {
            console.error("Error uploading media:", error);
            toast.error("An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleMediaDelete = async (mediaId: string) => {
        if (!id || !mediaId || !pet) return;
        // Consider adding a confirmation dialog here too
        try {
            // Pass privacy state if needed by your service logic (e.g., for bucket access)
            const { success, error } = await deletePetMedia(mediaId, pet.is_private);
            if (success) {
                setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== mediaId));
                toast.success("Media file deleted.");
                // If the deleted media was the featured one, clear it from the pet state
                if (pet.featured_media_url === photos.find(p => p.id === mediaId)?.url) {
                    setPet(prev => prev ? { ...prev, featured_media_url: null } : null);
                    // Optionally call setFeaturedMedia(id, null) if your backend supports clearing it
                }
            } else {
                toast.error("Deletion failed", { description: error || "Could not delete the file." });
            }
        } catch (error) {
            console.error("Error deleting media:", error);
            toast.error("An unexpected error occurred during deletion.");
        }
    };

    const handleSetFeaturedMedia = async (mediaId: string | null) => { // Allow null to clear featured media
        if (!id || !pet) return;
        // Prevent setting if it's already the featured one
        const currentFeaturedUrl = photos.find(p => p.id === mediaId)?.url;
        if (mediaId && currentFeaturedUrl === pet.featured_media_url) {
            // toast.info("This is already the featured image.");
            return;
        }

        try {
            const { success, error } = await setFeaturedMedia(id, mediaId); // Pass null to backend if clearing
            if (success) {
                const newFeaturedUrl = mediaId ? photos.find(photo => photo.id === mediaId)?.url : null;
                setPet(prevPet => prevPet ? { ...prevPet, featured_media_url: newFeaturedUrl ?? null } : null);
                toast.success(mediaId ? "Featured image updated." : "Featured image cleared.");
            } else {
                toast.error("Update failed", { description: error || "Could not set featured image." });
            }
        } catch (error) {
            console.error("Error setting featured media:", error);
            toast.error("An unexpected error occurred.");
        }
    };


    // --- Render Logic ---

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen w-full">
                <SideMenu />
                <ParticleParallaxBackground>
                    <main className="flex-1 md:ml-64 w-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="loading-spinner mb-4"></div> {/* Replace with your spinner component */}
                            <p className="text-white font-display text-xl drop-shadow-md">Creating paradise for your beloved pet...</p>
                        </div>
                    </main>
                </ParticleParallaxBackground>
            </div>
        );
    }

    if (!pet) {
        // Handles both "Not Found" and "Private Access Error"
        return (
            <div className="flex flex-col md:flex-row min-h-screen w-full">
                <SideMenu />
                <ParticleParallaxBackground>
                    <main className="flex-1 md:ml-64 w-full flex items-center justify-center">
                        <div className="container mx-auto px-4 py-12 text-center bg-black/30 backdrop-blur-md rounded-lg shadow-xl max-w-md">
                            <h1 className="text-3xl font-display font-semibold text-white drop-shadow-md mb-4">
                                {privateAccessError ? "Access Denied" : "Profile Not Found"}
                            </h1>
                            <p className="mb-6 text-white/90 drop-shadow-sm">
                                {privateAccessError
                                    ? "This pet's memorial is private and can only be viewed by its creator."
                                    : "We couldn't find this profile. It might have been removed or the link is incorrect."}
                            </p>
                            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                                <Link to="/profiles"> {/* Link to profiles list or home */}
                                    <Home className="mr-2" size={16} />
                                    Back to Profiles
                                </Link>
                            </Button>
                        </div>
                    </main>
                </ParticleParallaxBackground>
            </div>
        );
    }

    const featuredImageUrl = pet.featured_media_url || '/placeholder-paradise.jpg'; // Fallback image

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full overflow-x-hidden">
            <SideMenu />
            <ParticleParallaxBackground>
                <main className="flex-1 md:ml-64 w-full max-w-full">
                    <div className="min-h-screen relative w-full overflow-hidden">
                        {/* Optional: Subtle Featured Image Banner */}
                        <div className="h-48 md:h-64 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${featuredImageUrl})` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        </div>

                        {/* Content Area */}
                        <div className="relative z-10 -mt-20 md:-mt-28 px-4 sm:px-6 lg:px-8 pb-16 max-w-full">

                            {/* Pet Header Card */}
                            <Card className="mb-6 md:mb-8 bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-lg border-white/10 shadow-xl overflow-hidden max-w-full mx-auto md:mr-0">
                                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                                    {/* Use featured image or a default */}
                                    <img
                                        src={featuredImageUrl}
                                        alt={`${pet.name}`}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/20 shadow-lg flex-shrink-0"
                                    />
                                    <div className="flex-grow text-center md:text-left">
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-handwritten font-bold text-white mb-1 drop-shadow-lg">
                                            {pet.name}'s Paradise
                                        </h1>
                                        {(pet.species || pet.breed) && (
                                            <p className="text-lg text-white/80 mb-2 drop-shadow-md font-display">
                                                {pet.species}{pet.breed ? ` - ${pet.breed}` : ''}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-white/70 mb-3">
                                            {pet.birth_date && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                    Born: {formatDate(pet.birth_date)}
                                                </div>
                                            )}
                                            {pet.death_date && (
                                                <div className="flex items-center">
                                                    <Heart className="h-3.5 w-3.5 mr-1.5" />
                                                    Remembered: {formatDate(pet.death_date)}
                                                </div>
                                            )}
                                        </div>
                                        {pet.bio && (
                                             <p className="text-white/90 text-base mb-4 italic drop-shadow-sm">"{pet.bio}"</p>
                                        )}
                                        {/* Traits */}
                                        {pet.traits && pet.traits.length > 0 && (
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                                {pet.traits.map((trait, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-2.5 py-1 bg-paradise/20 text-paradise-foreground rounded-full text-xs md:text-sm flex items-center backdrop-blur-sm border border-paradise/30"
                                                    >
                                                        <Star className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-paradise" />
                                                        {trait}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                     {/* Management Actions - Now with direct privacy toggle for better visibility */}
                                    <div className="flex-shrink-0 mt-4 md:mt-0 self-center md:self-start flex flex-col gap-2">
                                        {/* Direct Privacy Toggle */}
                                        <div className="flex items-center gap-2 mb-2 bg-white/5 p-2 rounded-md border border-white/10">
                                            <Lock className="h-4 w-4 text-white/70" />
                                            <div className="flex-grow">
                                                <Label htmlFor="privacy-toggle" className="text-sm text-white/80">
                                                    {pet.is_private ? 'Private Profile' : 'Public Profile'}
                                                </Label>
                                            </div>
                                            <Switch
                                                id="privacy-toggle"
                                                checked={!pet.is_private}
                                                onCheckedChange={() => handlePrivacyToggle()}
                                                disabled={isTogglingPrivacy}
                                                className="data-[state=checked]:bg-paradise"
                                            />
                                        </div>
                                        {/* Share Button */}
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="bg-white/5 hover:bg-white/10 text-white border-white/10 w-full"
                                            onClick={copyProfileLink}
                                        >
                                            {copySuccess ? (
                                                <>
                                                    <ClipboardCheck className="h-4 w-4 mr-2 text-green-400" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                    Share Link
                                                </>
                                            )}
                                        </Button>
                                        {/* Management Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="bg-white/5 hover:bg-white/10 text-white border-white/10 w-full">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    More Options
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-md border-white/15 text-white">
                                                <DropdownMenuLabel>Profile Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-white/15"/>
                                                <DropdownMenuItem
                                                    className="flex items-center cursor-pointer focus:bg-white/10"
                                                    onClick={copyProfileLink}
                                                >
                                                    {copySuccess ? <ClipboardCheck className="h-4 w-4 mr-2 text-green-400" /> : <ClipboardCopy className="h-4 w-4 mr-2" />}
                                                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/15"/>
                                                <DropdownMenuItem
                                                    className="flex items-center cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-300"
                                                    onClick={() => setDeleteDialogOpen(true)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    <span>Delete Profile</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Main Content Tabs */}
                            <Tabs defaultValue="stories" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-black/30 backdrop-blur-md border border-white/10 mb-4 md:mb-6">
                                    <TabsTrigger value="stories" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-md font-handwritten text-base">
                                        <RefreshCcw className="h-4 w-4 mr-2 hidden sm:inline-block"/>Stories
                                    </TabsTrigger>
                                    <TabsTrigger value="gallery" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-md font-handwritten text-base">
                                         <ImageIcon className="h-4 w-4 mr-2 hidden sm:inline-block"/>Gallery
                                    </TabsTrigger>
                                    <TabsTrigger value="tributes" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-md font-handwritten text-base">
                                         <PawPrint className="h-4 w-4 mr-2 hidden sm:inline-block"/>Tributes
                                    </TabsTrigger>
                                </TabsList>

                                {/* Stories Tab */}
                                <TabsContent value="stories">
                                    <Card className="bg-black/30 backdrop-blur-md border-white/10 shadow-lg mx-auto md:mr-0 max-w-4xl">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 md:px-6">
                                            <CardTitle className="text-xl md:text-2xl font-handwritten text-white drop-shadow-md">Stories from Paradise</CardTitle>
                                            <Button
                                                onClick={handleRegenerateStories}
                                                size="sm"
                                                variant="outline"
                                                className="bg-white/5 hover:bg-white/10 text-white border-white/10 text-xs md:text-sm"
                                                disabled={isGeneratingStories}
                                            >
                                                <RefreshCcw size={14} className={cn("mr-1.5", isGeneratingStories && "animate-spin")} />
                                                {isGeneratingStories ? 'Generating...' : 'New Story'}
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-0 md:p-2">
                                            <div className="h-[50vh] md:h-[60vh] lg:h-[65vh] "> {/* Adjusted height */}
                                                <ChatWindow
                                                    messages={stories}
                                                    petName={pet.name}
                                                    className="h-full bg-transparent" // Make chat window transparent
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Gallery Tab */}
                                <TabsContent value="gallery">
                                     <PhotoAlbum
                                        media={photos}
                                        petName={pet.name}
                                        onUpload={handleMediaUpload}
                                        onDelete={handleMediaDelete}
                                        onSetFeatured={handleSetFeaturedMedia}
                                        featuredMediaId={photos.find(p => p.url === pet.featured_media_url)?.id ?? null}
                                        isUploading={isUploading}
                                        className="bg-black/30 backdrop-blur-md border-white/10 shadow-lg rounded-lg p-4 md:p-6 mx-auto md:mr-0 max-w-4xl"
                                    />
                                </TabsContent>

                                {/* Tributes Tab */}
                                <TabsContent value="tributes">
                                    <div className="mx-auto md:mr-0 max-w-4xl bg-black/30 backdrop-blur-md border-white/10 shadow-lg rounded-lg p-4 md:p-6">
                                        <Tributes
                                            petId={id || ''}
                                            petName={pet.name}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </ParticleParallaxBackground>

            {/* Delete confirmation dialog - remains the same */}
             <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-gray-900 border-red-500/50 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">Confirm Profile Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            Are you absolutely sure you want to delete the memorial profile for <strong>{pet?.name}</strong>?
                            <br /><br />
                            This action cannot be undone. All stories, photos, tributes, and associated data will be permanently lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete Profile'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PetParadise;