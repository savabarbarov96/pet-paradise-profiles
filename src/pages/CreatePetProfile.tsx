import React, { useState, KeyboardEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { motion } from 'framer-motion';

// Service & Hooks
import { createPetProfile } from '@/services/petProfileService';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils"; // Assuming you have a cn utility from shadcn

// UI Components (Make sure all these are installed from shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import SideMenu from '@/components/SideMenu'; // Your SideMenu component
import PetMemorialMessage from '@/components/PetMemorialMessage'; // Import the new component

// Icons (Ensure lucide-react is installed)
import {
    PawPrint,
    Calendar as CalendarIcon,
    Loader2,
    Dog,
    Cat,
    Bird, // Example for 'Other' species
    X,
    HelpCircle, // Example for 'Unknown' gender
    // Alternatives if Venus/Mars fail: Female, Male
} from 'lucide-react';

// --- Translations ---
const translations = {
    pageTitle: 'Създай Профил на Домашен Любимец',
    pageDescription: 'Попълнете детайлите за вашия обичан любимец',
    formLabels: {
        name: 'Име на любимеца',
        species: 'Вид',
        breed: 'Порода (опционално)',
        traits: 'Характерни черти',
        gender: 'Пол',
        bio: 'Биография (опционално)',
        birthDate: 'Дата на раждане (опционално)',
        deathDate: 'Дата на смърт (опционално)',
        featured_media_url: 'URL на профилна снимка (опционално)',
    },
    formPlaceholders: {
        name: 'Въведете името на любимеца',
        breed: 'Напр. Лабрадор, Персийска',
        traits: 'Добавете черта и натиснете Enter',
        bio: 'Разкажете ни за вашия любимец...',
        featured_media_url: 'https://example.com/pet-photo.jpg',
        selectDate: 'Изберете дата',
    },
    speciesOptions: {
        dog: 'Куче',
        cat: 'Котка',
        other: 'Друго',
    },
    genderOptions: {
        male: 'Мъжки',
        female: 'Женски',
        unknown: 'Неизвестен',
    },
    buttons: {
        createProfile: 'Създай Профил',
        creatingProfile: 'Създаване...',
    },
    toastMessages: {
        successTitle: 'Успех',
        successDescription: 'Профилът на любимеца е създаден успешно!',
        errorTitle: 'Грешка',
        errorDescription: 'Неуспешно създаване на профил',
        unexpectedError: 'Възникна неочаквана грешка',
        isRequired: 'е задължително поле',
        traitAdded: 'Черта добавена',
        traitExists: 'Тази черта вече е добавена',
        traitRemoved: 'Черта премахната',
    },
    addTraitHelpText: 'Въведете черта и натиснете Enter. Натиснете \'x\' за премахване.',
};
// --- End Translations ---

// --- Style Constants ---
const glassyInputBase = "bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm placeholder:text-gray-400/70 focus:ring-2 focus:ring-inset focus:ring-paradise/50 text-gray-800"; // Added default text color
const glassyCardBase = "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl";

// --- Radio Button Styles (Refined) ---
const radioLabelBaseLayout = "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors duration-200 ease-in-out min-h-[100px]"; // Added min-height for consistency

// Default state - Slightly more opaque, clearer border
const radioLabelDefaultGlassy = "bg-white/25 border-white/30 text-gray-700 hover:bg-white/40 hover:border-white/50";

// Selected state - Solid background using primary color, no blur, distinct text
const radioLabelSelectedGlassy = "peer-data-[state=checked]:border-paradise peer-data-[state=checked]:bg-paradise/80 peer-data-[state=checked]:text-paradise-foreground peer-data-[state=checked]:shadow-md"; // Ensure paradise-foreground is defined in your theme or use text-white
// --- End Style Constants ---


interface FormData {
    name: string;
    species: 'dog' | 'cat' | 'other';
    breed?: string;
    traits: string;
    bio?: string;
    birthDate?: string; // ISO string 'YYYY-MM-DD'
    deathDate?: string; // ISO string 'YYYY-MM-DD'
    featured_media_url?: string;
    gender?: 'male' | 'female' | 'unknown';
    tribute?: string;
}

const CreatePetProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showMemorial, setShowMemorial] = useState(false);
    const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        species: 'dog', // Default species
        traits: '',
        gender: 'unknown', // Default gender
    });

    // State for Date Pickers
    const [birthDateObj, setBirthDateObj] = useState<Date | undefined>(undefined);
    const [deathDateObj, setDeathDateObj] = useState<Date | undefined>(undefined);
    const [showBirthCalendar, setShowBirthCalendar] = useState(false);
    const [showDeathCalendar, setShowDeathCalendar] = useState(false);

    // --- Handlers ---
    const handleInputChange = (field: keyof Omit<FormData, 'birthDate' | 'deathDate' | 'species' | 'gender'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSpeciesChange = (value: FormData['species']) => { // More specific type
        setFormData(prev => ({ ...prev, species: value }));
    };

    const handleGenderChange = (value: NonNullable<FormData['gender']>) => { // More specific type
        setFormData(prev => ({ ...prev, gender: value }));
    };

    const handleDateSelect = (field: 'birthDate' | 'deathDate', date: Date | undefined) => {
        // Don't close if user clicks outside to dismiss? Optional. For now, close on select.
        if (!date) return;

        if (field === 'birthDate') {
            setBirthDateObj(date);
            setShowBirthCalendar(false); // Close calendar on selection
            // Ensure death date is not before new birth date
            if (deathDateObj && date > deathDateObj) {
                setDeathDateObj(undefined);
                setFormData(prev => ({ ...prev, deathDate: undefined }));
            }
        } else {
            setDeathDateObj(date);
            setShowDeathCalendar(false); // Close calendar on selection
        }

        setFormData(prev => ({
            ...prev,
            [field]: format(date, 'yyyy-MM-dd'),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast({
                title: translations.toastMessages.errorTitle,
                description: `${translations.formLabels.name} ${translations.toastMessages.isRequired}`,
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);

        try {
            // Convert form data to the expected API format
            const apiFormData = {
                ...formData,
                // Convert traits string to array if the API still expects an array
                traits: formData.traits.split(',')
                    .map(t => t.trim())
                    .filter(t => t.length > 0),
            };
            
            const result = await createPetProfile(apiFormData, null);

            if (result.success && result.profileId) {
                setCreatedProfileId(result.profileId);
                
                // Show memorial message and hide form
                setShowMemorial(true);
                
                // Don't show the toast since we're showing the memorial message
                // The navigation will happen from the PetMemorialMessage component
            } else {
                toast({
                    title: translations.toastMessages.errorTitle,
                    description: result.error || translations.toastMessages.errorDescription,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error creating pet profile:', error);
            toast({
                title: translations.toastMessages.errorTitle,
                description: translations.toastMessages.unexpectedError,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle completion of memorial message
    const handleMemorialComplete = () => {
        if (createdProfileId) {
            navigate(`/pet/${createdProfileId}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-paradise-light/30 to-serenity-light/40">
            {/* Show memorial message if profile created successfully */}
            {showMemorial && (
                <PetMemorialMessage 
                    petName={formData.name}
                    onComplete={handleMemorialComplete}
                    profileId={createdProfileId}
                    isDeceased={!!formData.deathDate}
                />
            )}
            
            {/* Primary content - this will be hidden when memorial message shows */}
            <motion.div 
                className="flex-1 flex flex-col"
                initial={{ opacity: 1 }}
                animate={{ 
                    opacity: showMemorial ? 0 : 1,
                    scale: showMemorial ? 0.95 : 1,
                    filter: showMemorial ? 'blur(10px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.5 }}
            >
                <SideMenu />
                <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <header className="mb-8 text-center md:text-left">
                            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-paradise to-serenity">
                                {translations.pageTitle}
                            </h1>
                            <p className="mt-2 font-handwritten text-lg text-muted-foreground">
                                {translations.pageDescription}
                            </p>
                        </header>

                        {/* Main Form Card */}
                        <Card className={glassyCardBase}>
                            <CardHeader className="border-b border-white/10 pb-6">
                                <CardTitle className="flex items-center text-2xl font-semibold">
                                    <PawPrint className="h-6 w-6 mr-2 text-paradise" />
                                    <span>{translations.pageTitle}</span>
                                </CardTitle>
                                <CardDescription>
                                    {translations.pageDescription}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="pt-6 space-y-6">
                                    {/* Form Fields */}
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-700 font-medium">{translations.formLabels.name}</Label>
                                        <Input
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder={translations.formPlaceholders.name}
                                            className={cn("text-base", glassyInputBase)}
                                        />
                                    </div>

                                    {/* Species - RadioGroup */}
                                    <div className="space-y-3">
                                        <Label className="text-gray-700 font-medium">{translations.formLabels.species}</Label>
                                        <RadioGroup
                                            required // Make selection required
                                            value={formData.species}
                                            onValueChange={handleSpeciesChange}
                                            className="grid grid-cols-3 gap-4"
                                        >
                                            {/* Dog */}
                                            <div>
                                                <RadioGroupItem value="dog" id="species-dog" className="peer sr-only" />
                                                <Label
                                                    htmlFor="species-dog"
                                                    className={cn(
                                                        radioLabelBaseLayout,
                                                        radioLabelDefaultGlassy,
                                                        radioLabelSelectedGlassy
                                                    )}
                                                >
                                                    <Dog className="mb-2 h-6 w-6" />
                                                    {translations.speciesOptions.dog}
                                                </Label>
                                            </div>
                                             {/* Cat */}
                                            <div>
                                                <RadioGroupItem value="cat" id="species-cat" className="peer sr-only" />
                                                <Label
                                                    htmlFor="species-cat"
                                                    className={cn(
                                                        radioLabelBaseLayout,
                                                        radioLabelDefaultGlassy,
                                                        radioLabelSelectedGlassy
                                                    )}
                                                >
                                                    <Cat className="mb-2 h-6 w-6" />
                                                    {translations.speciesOptions.cat}
                                                </Label>
                                            </div>
                                             {/* Other */}
                                            <div>
                                                <RadioGroupItem value="other" id="species-other" className="peer sr-only" />
                                                <Label
                                                    htmlFor="species-other"
                                                    className={cn(
                                                        radioLabelBaseLayout,
                                                        radioLabelDefaultGlassy,
                                                        radioLabelSelectedGlassy
                                                    )}
                                                >
                                                    <Bird className="mb-2 h-6 w-6" />
                                                    {translations.speciesOptions.other}
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Breed */}
                                    <div className="space-y-2">
                                        <Label htmlFor="breed" className="text-gray-700 font-medium">{translations.formLabels.breed}</Label>
                                        <Input
                                            id="breed"
                                            value={formData.breed || ''}
                                            onChange={(e) => handleInputChange('breed', e.target.value)}
                                            placeholder={translations.formPlaceholders.breed}
                                            className={cn(glassyInputBase)}
                                        />
                                    </div>

                                    {/* Traits - Changed to free text */}
                                    <div className="space-y-2">
                                        <Label htmlFor="traits" className="text-gray-700 font-medium">{translations.formLabels.traits}</Label>
                                        <Textarea
                                            id="traits"
                                            value={formData.traits || ''}
                                            onChange={(e) => handleInputChange('traits', e.target.value)}
                                            placeholder={translations.formPlaceholders.traits}
                                            className={cn("min-h-[100px]", glassyInputBase)}
                                        />
                                    </div>

                                    {/* Gender - RadioGroup */}
                                    <div className="space-y-3">
                                        <Label className="text-gray-700 font-medium">{translations.formLabels.gender}</Label>
                                        <RadioGroup
                                            required // Make selection required
                                            value={formData.gender}
                                            onValueChange={handleGenderChange}
                                            className="grid grid-cols-3 gap-4"
                                        >
                                            {/* Male */}
                                            <div>
                                                <RadioGroupItem value="male" id="gender-male" className="peer sr-only" />

                                            </div>
                                            {/* Unknown */}
                                            <div>
                                                <RadioGroupItem value="unknown" id="gender-unknown" className="peer sr-only" />
                                                <Label
                                                    htmlFor="gender-unknown"
                                                    className={cn(
                                                        radioLabelBaseLayout,
                                                        radioLabelDefaultGlassy,
                                                        radioLabelSelectedGlassy
                                                    )}
                                                >
                                                    <HelpCircle className="mb-2 h-6 w-6" />
                                                    {translations.genderOptions.unknown}
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Bio - Changed to Tribute */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tribute" className="text-gray-700 font-medium">Навици и поведение (Спомен)</Label>
                                        <Textarea
                                            id="tribute"
                                            value={formData.tribute || ''}
                                            onChange={(e) => handleInputChange('tribute', e.target.value)}
                                            placeholder="Разкажете история или спомен с вашия любимец..."
                                            className={cn("min-h-[150px]", glassyInputBase)}
                                        />
                                        <p className="text-xs text-gray-500">Този спомен ще бъде автоматично добавен към профила.</p>
                                    </div>

                                    {/* Dates (Birth & Death) - Inline Calendar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Increased gap */}
                                        {/* Birth Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="birthDate-trigger" className="text-gray-700 font-medium">{translations.formLabels.birthDate}</Label>
                                            <Button
                                                id="birthDate-trigger"
                                                type="button"
                                                variant={"outline"}
                                                onClick={() => {
                                                    setShowBirthCalendar(!showBirthCalendar);
                                                    setShowDeathCalendar(false); // Close other calendar
                                                }}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !birthDateObj && "text-muted-foreground", // Use theme's muted for placeholder state
                                                    glassyInputBase // Apply glassy style
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" /> {/* Icon subtle */}
                                                {birthDateObj ? format(birthDateObj, 'PPP', { locale: bg }) : <span>{translations.formPlaceholders.selectDate}</span>}
                                            </Button>
                                            {showBirthCalendar && (
                                                // Glassy container for calendar - consider bg-white/80 for more opacity if needed
                                                <div className="rounded-md border mt-2 p-0 bg-white/70 backdrop-blur-md border-white/30 shadow-lg">
                                                    <Calendar
                                                        mode="single"
                                                        selected={birthDateObj}
                                                        onSelect={(date) => handleDateSelect('birthDate', date)}
                                                        locale={bg}
                                                        captionLayout="dropdown-buttons"
                                                        fromYear={1980} // Adjust range as needed
                                                        toYear={new Date().getFullYear()}
                                                        initialFocus={!birthDateObj} // Focus only if no date selected yet
                                                        className="bg-transparent p-2" // Add padding inside calendar
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Death Date */}
                                         <div className="space-y-2">
                                            <Label htmlFor="deathDate-trigger" className="text-gray-700 font-medium">{translations.formLabels.deathDate}</Label>
                                            <Button
                                                id="deathDate-trigger"
                                                type="button"
                                                variant={"outline"}
                                                onClick={() => {
                                                    if (birthDateObj) { // Only allow opening if birth date is set
                                                        setShowDeathCalendar(!showDeathCalendar);
                                                        setShowBirthCalendar(false); // Close other calendar
                                                    }
                                                }}
                                                disabled={!birthDateObj} // Disable button if no birth date
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                     !deathDateObj && "text-muted-foreground",
                                                     glassyInputBase,
                                                     !birthDateObj && "opacity-50 cursor-not-allowed bg-white/5" // More distinct disabled style
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                                {deathDateObj ? format(deathDateObj, 'PPP', { locale: bg }) : <span>{translations.formPlaceholders.selectDate}</span>}
                                            </Button>
                                            {/* Conditionally render based on state AND birthDateObj */}
                                            {showDeathCalendar && birthDateObj && (
                                                <div className="rounded-md border mt-2 p-0 bg-white/70 backdrop-blur-md border-white/30 shadow-lg">
                                                    <Calendar
                                                        mode="single"
                                                        selected={deathDateObj}
                                                        onSelect={(date) => handleDateSelect('deathDate', date)}
                                                        locale={bg}
                                                        captionLayout="dropdown-buttons"
                                                        fromDate={birthDateObj} // Prevent selecting before birth date
                                                        toDate={new Date()} // Prevent future dates
                                                        // fromYear={birthDateObj.getFullYear()} // Alternative start year
                                                        toYear={new Date().getFullYear()}
                                                        initialFocus={!deathDateObj}
                                                        className="bg-transparent p-2"
                                                    />
                                                 </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Featured Media URL */}
                                    <div className="space-y-2">
                                        <Label htmlFor="featured_media_url" className="text-gray-700 font-medium">{translations.formLabels.featured_media_url}</Label>
                                        <Input
                                            id="featured_media_url"
                                            type="url"
                                            value={formData.featured_media_url || ''}
                                            onChange={(e) => handleInputChange('featured_media_url', e.target.value)}
                                            placeholder={translations.formPlaceholders.featured_media_url}
                                            className={cn(glassyInputBase)}
                                        />
                                        <p className="text-xs text-gray-500">В бъдеще ще бъде добавена опция за качване на файл.</p>
                                    </div>

                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                                    <p className="text-sm text-muted-foreground">
                                        * {translations.formLabels.name} {translations.toastMessages.isRequired}
                                    </p>
                                    <Button 
                                        type="submit" 
                                        className="w-full sm:w-auto bg-paradise hover:bg-paradise-dark text-white flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {loading ? translations.buttons.creatingProfile : translations.buttons.createProfile}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </main>
            </motion.div>
        </div>
    );
};

export default CreatePetProfile;