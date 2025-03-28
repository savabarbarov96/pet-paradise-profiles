import { SpringConfig } from '@react-spring/web';
import { PetProfile } from '@/services/petProfileService';

// Configuration object for all floating profiles settings
export const CONFIG = {
    PROFILE_BASE_SIZE: 100,
    PROFILE_RENDER_SCALE: 1.4,
    PROFILE_DESKTOP_SCALE: 1.8, // Larger scale for desktop
    MIN_SCALE: 0.8,
    MAX_SCALE: 1.1,
    HOVER_SCALE: 1.3,
    BOUNDS_MARGIN: 50,
    MAX_VELOCITY: 0.25,
    MIN_VELOCITY: 0.05,
    REPULSION_DISTANCE: 160,
    REPULSION_STRENGTH: 0.0006,
    WALL_REPULSION_STRENGTH: 0.015,
    RANDOM_DRIFT_STRENGTH: 0.008,
    PHYSICS_DAMPING: 0.995,
    MIN_INITIAL_SEPARATION_FACTOR: 1.5,
    MAX_INITIAL_PLACEMENT_ATTEMPTS: 50,
    HIGHLIGHT_DURATION: 2500,
    SOUND_DURATION_MS: 1500, // Duration of your sound file
    NAVIGATION_TIMEOUT_BUFFER_MS: 500, // Extra buffer
    SPRING_CONFIG: { tension: 25, friction: 45 } satisfies SpringConfig,
    SPRING_CONFIG_HOVER: { tension: 120, friction: 20 } satisfies SpringConfig,
    PARTICLE_COUNT: 35, // Increased particles
    PARTICLE_LARGE_COUNT: 5, // Additional larger particles
    // Comic box config
    COMIC_BOX_DURATION: 5000, // 5 seconds (longer display)
    CAT_MEOW_INTERVAL: 10000, // Play cat meow sound every 10 seconds
    MAX_SIMULTANEOUS_COMIC_BOXES: 3, // Maximum number of comic boxes to show simultaneously
};

// Wholesome messages in Bulgarian for the comic boxes
export const WHOLESOME_MESSAGES = [
    "Благодаря ти, че беше добър с мен!",
    "Обичам те завинаги!",
    "Липсваш ми много...",
    "Пазя те в сърцето си!",
    "Винаги съм до теб!",
    "Толкова хубави моменти имахме!",
    "Радвам се, че бях част от живота ти!",
    "Пазя те в мислите си!",
    "Щастлив съм в рая на животните!",
    "Благодаря за всичките лакомства!"
];

// Utility functions
export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
export const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

// Types
export interface PhysicsState {
    vx: number;
    vy: number;
    targetScale: number;
    targetRotation: number;
}

export interface InitialPosition {
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

// Simplified profile type used for floating profiles
export interface SimplePetProfile {
    id: string;
    name: string;
    featured_media_url?: string;
}

export interface FloatingPetProfilesProps {
    profiles: SimplePetProfile[];
    highlightProfileId?: string | null;
}

export interface ComicBoxState {
    visible: boolean;
    message: string;
    timerId: NodeJS.Timeout | null;
}

export interface FloatingProfileProps {
    profile: SimplePetProfile;
    style: any;
    index: number;
    isHovered: boolean;
    isPendingNav: boolean;
    isHighlighted: boolean;
    comicBoxState: ComicBoxState;
    responsiveSize: { baseSize: number; renderScale: number };
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onClick: () => void;
}

export interface AudioControllerProps {
    profiles: SimplePetProfile[];
    onMeow: () => void;
}

export interface ComicBoxManagerProps {
    profiles: SimplePetProfile[];
    isNavigationPending: React.MutableRefObject<string | null>;
    triggerNewComicBox: boolean;
}

// CSS keyframes
export const bgPulseKeyframes = `
  @keyframes bgPulse {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

export const comicBoxFadeIn = `
  @keyframes comicBoxFadeIn {
    0% { opacity: 0; transform: translateY(10px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
`; 