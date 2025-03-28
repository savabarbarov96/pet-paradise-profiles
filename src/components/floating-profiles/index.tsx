import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprings } from '@react-spring/web';
import useMeasure from 'react-use-measure';

// Import subcomponents
import FloatingProfile from './FloatingProfile';
import AudioController from './AudioController';
import ComicBoxManager from './ComicBoxManager';

// Import types and constants
import {
    CONFIG,
    clamp,
    randomInRange,
    PhysicsState,
    InitialPosition,
    FloatingPetProfilesProps,
    ComicBoxState,
    bgPulseKeyframes,
    floatAnimation,
    comicBoxFadeIn
} from './types';

/**
 * FloatingPetProfiles is the main component that renders animated floating 
 * pet profiles with comic boxes and audio effects
 */
const FloatingPetProfiles: React.FC<FloatingPetProfilesProps> = ({ 
    profiles, 
    highlightProfileId 
}) => {
    const navigate = useNavigate();
    const [containerRef, bounds] = useMeasure();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const physicsStateRef = useRef<PhysicsState[]>([]);
    const isNavigationPending = useRef<string | null>(null);
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioListenersRef = useRef<{ ended: (() => void) | null; error: ((e: Event) => void) | null }>({ ended: null, error: null });
    
    // State for comic box management and meow trigger
    const [comicBoxStates, setComicBoxStates] = useState<ComicBoxState[]>([]);
    const [triggerNewComicBox, setTriggerNewComicBox] = useState<boolean>(false);
    
    // Determine if we're on desktop based on bounds width
    const isDesktop = bounds.width > 768;
    
    // Calculate responsive sizing
    const responsiveSize = useMemo(() => {
        return {
            baseSize: isDesktop 
                ? CONFIG.PROFILE_BASE_SIZE * CONFIG.PROFILE_DESKTOP_SCALE 
                : CONFIG.PROFILE_BASE_SIZE,
            renderScale: CONFIG.PROFILE_RENDER_SCALE,
        };
    }, [bounds.width, isDesktop]);

    // Initialize physics state
    const initializePhysicsState = useCallback((count: number) => {
        physicsStateRef.current = Array.from({ length: count }, () => ({
            vx: randomInRange(-CONFIG.MIN_VELOCITY, CONFIG.MIN_VELOCITY) * 2,
            vy: randomInRange(-CONFIG.MIN_VELOCITY, CONFIG.MIN_VELOCITY) * 2,
            targetScale: randomInRange(CONFIG.MIN_SCALE, CONFIG.MAX_SCALE),
            targetRotation: randomInRange(-5, 5),
        }));
    }, []);
    
    useEffect(() => { 
        initializePhysicsState(profiles.length); 
    }, [profiles.length, initializePhysicsState]);

    // Handler for when cat meows
    const handleMeow = useCallback(() => {
        console.log("[FloatingPetProfiles] Cat meow triggered");
        // Toggle trigger to force the ComicBoxManager to show a new comic box
        setTriggerNewComicBox(prev => !prev);
    }, []);

    // Update comic box states when received from ComicBoxManager 
    // (This bridges the two components)
    const updateComicBoxStates = useCallback((states: ComicBoxState[]) => {
        setComicBoxStates(states);
    }, []);

    // Observe the comic box states from the ComicBoxManager
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'data-comic-box-states') {
                    const target = mutation.target as HTMLElement;
                    const statesData = target.getAttribute('data-comic-box-states');
                    if (statesData) {
                        try {
                            const states = JSON.parse(statesData);
                            updateComicBoxStates(states);
                        } catch (e) {
                            console.error("[FloatingPetProfiles] Failed to parse comic box states", e);
                        }
                    }
                }
            }
        });

        const comicBoxStatesElement = document.getElementById('comic-box-states');
        if (comicBoxStatesElement) {
            observer.observe(comicBoxStatesElement, { attributes: true });
        }

        return () => {
            observer.disconnect();
        };
    }, [updateComicBoxStates]);

    // Initialize springs for profile animations
    const [springs, api] = useSprings(
        profiles.length,
        (index) => {
            const profileRenderSize = responsiveSize.baseSize * responsiveSize.renderScale;
            const containerWidth = bounds.width || window.innerWidth;
            const containerHeight = bounds.height || window.innerHeight;
            const maxX = containerWidth - CONFIG.BOUNDS_MARGIN - profileRenderSize / 2;
            const maxY = containerHeight - CONFIG.BOUNDS_MARGIN - profileRenderSize / 2;
            const minX = CONFIG.BOUNDS_MARGIN + profileRenderSize / 2;
            const minY = CONFIG.BOUNDS_MARGIN + profileRenderSize / 2;

            let pos: InitialPosition = {
                 x: randomInRange(minX, maxX),
                 y: randomInRange(minY, maxY),
                 scale: physicsStateRef.current[index]?.targetScale ?? CONFIG.MIN_SCALE,
                 rotation: physicsStateRef.current[index]?.targetRotation ?? 0,
             };

            if (containerWidth <= minX || containerHeight <= minY) {
                pos = { x: minX, y: minY, scale: pos.scale, rotation: pos.rotation };
            }

            return {
                x: pos.x, y: pos.y, scale: pos.scale, rotation: pos.rotation,
                opacity: 1, zIndex: 10, config: CONFIG.SPRING_CONFIG,
                immediate: !bounds.width,
            };
        },
        [profiles.length, bounds.width, bounds.height, responsiveSize]
    );

    // Initialize click sound effect
    useEffect(() => {
        try { 
            // Only initialize the click sound element, not the background music
            const audio = new Audio('/sounds/select-floating-element.mp3'); 
            audio.preload = 'auto'; 
            audioRef.current = audio; 
        } catch (error) { 
            console.error("Failed to create Audio object:", error); 
        }
        
        return () => {
            audioRef.current?.pause();
            if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
            // Remove any lingering listeners if component unmounts mid-navigation attempt
            const currentAudio = audioRef.current;
            const listeners = audioListenersRef.current;
            if (currentAudio) {
                if (listeners.ended) currentAudio.removeEventListener('ended', listeners.ended);
                if (listeners.error) currentAudio.removeEventListener('error', listeners.error);
            }
            audioRef.current = null;
            isNavigationPending.current = null;
            audioListenersRef.current = { ended: null, error: null };
        };
    }, []);

    // Handle highlight effect
    useEffect(() => {
        if (highlightProfileId) { 
            const index = profiles.findIndex(p => p.id === highlightProfileId); 
            if (index !== -1) { 
                setHoverIndex(index); 
                const timer = setTimeout(() => setHoverIndex(currentHover => (currentHover === index ? null : currentHover)), CONFIG.HIGHLIGHT_DURATION); 
                return () => clearTimeout(timer); 
            } 
        } else { 
            setHoverIndex(null);
        }
    }, [highlightProfileId, profiles]);

    // Animation loop
    useEffect(() => {
        if (!bounds.width || !bounds.height || profiles.length === 0) return;

        let frameId: number;
        const effectiveProfileSize = responsiveSize.baseSize * responsiveSize.renderScale;

        const animate = (timestamp: number) => {
            const currentNavPendingId = isNavigationPending.current; 
            const currentPhysicsState = physicsStateRef.current;
            
            if (document.hidden) { 
                frameId = requestAnimationFrame(animate); 
                return; 
            }
            
            const currentSpringValues = api.current.map(spring => spring.get());

            api.start((index, spring) => {
                if (index >= profiles.length || index >= currentPhysicsState.length || index >= currentSpringValues.length) { 
                    spring.stop(); 
                    return { immediate: true, opacity: 0 }; 
                }
                
                const profileId = profiles[index]?.id;
                // Check if this specific profile is pending navigation
                if (currentNavPendingId === profileId) {
                    // Keep it static if it's the one being clicked/navigated
                    return { immediate: true };
                }
                
                if (index === hoverIndex && currentNavPendingId === null) { 
                    // Only apply hover if nothing is pending navigation
                    return { scale: CONFIG.HOVER_SCALE, rotation: 0, zIndex: 20, config: CONFIG.SPRING_CONFIG_HOVER };
                }
                
                const physics = currentPhysicsState[index]; 
                const current = currentSpringValues[index]; 
                let { vx, vy } = physics;
                
                // Apply repulsion forces between profiles
                for (let j = 0; j < profiles.length; j++) { 
                    if (index === j || index >= currentSpringValues.length || j >= currentSpringValues.length) continue; 
                    const otherProfileId = profiles[j]?.id; 
                    if (currentNavPendingId === otherProfileId) continue; 
                    
                    const otherCurrent = currentSpringValues[j]; 
                    if (!otherCurrent) continue; 
                    
                    const dx = current.x - otherCurrent.x; 
                    const dy = current.y - otherCurrent.y; 
                    const distanceSq = dx * dx + dy * dy; 
                    const minDistance = CONFIG.REPULSION_DISTANCE; 
                    
                    if (distanceSq < minDistance * minDistance && distanceSq > 1) { 
                        const distance = Math.sqrt(distanceSq); 
                        const force = (minDistance - distance) / distance * CONFIG.REPULSION_STRENGTH; 
                        vx += dx * force; 
                        vy += dy * force; 
                    } 
                }
                
                // Apply wall repulsion
                const wallThreshold = CONFIG.BOUNDS_MARGIN * 1.5; 
                const wallExpFactor = 0.03; 
                const wallForceX = Math.exp(-(current.x - wallThreshold) * wallExpFactor) - Math.exp((current.x - (bounds.width - wallThreshold)) * wallExpFactor); 
                const wallForceY = Math.exp(-(current.y - wallThreshold) * wallExpFactor) - Math.exp((current.y - (bounds.height - wallThreshold)) * wallExpFactor); 
                vx += wallForceX * CONFIG.WALL_REPULSION_STRENGTH; 
                vy += wallForceY * CONFIG.WALL_REPULSION_STRENGTH;
                
                // Apply random drift
                vx += (Math.random() - 0.5) * CONFIG.RANDOM_DRIFT_STRENGTH; 
                vy += (Math.random() - 0.5) * CONFIG.RANDOM_DRIFT_STRENGTH;
                
                // Apply velocity clamping and damping
                const speed = Math.sqrt(vx * vx + vy * vy); 
                const maxV = CONFIG.MAX_VELOCITY; 
                const minV = CONFIG.MIN_VELOCITY; 
                
                if (speed > maxV) { 
                    vx = (vx / speed) * maxV; 
                    vy = (vy / speed) * maxV; 
                } else if (speed > 0 && speed < minV && !isInteracting) { 
                    vx = (vx / speed) * minV; 
                    vy = (vy / speed) * minV; 
                } else if (speed < 0.01 && !isInteracting) { 
                    vx = (Math.random() - 0.5) * minV * 2; 
                    vy = (Math.random() - 0.5) * minV * 2; 
                } 
                
                vx *= CONFIG.PHYSICS_DAMPING; 
                vy *= CONFIG.PHYSICS_DAMPING;
                
                physics.vx = vx; 
                physics.vy = vy;
                
                // Calculate target position with boundary checks
                let targetX = current.x + vx; 
                let targetY = current.y + vy; 
                const boundaryRight = bounds.width - CONFIG.BOUNDS_MARGIN - effectiveProfileSize / 2; 
                const boundaryBottom = bounds.height - CONFIG.BOUNDS_MARGIN - effectiveProfileSize / 2; 
                const boundaryLeft = CONFIG.BOUNDS_MARGIN + effectiveProfileSize / 2; 
                const boundaryTop = CONFIG.BOUNDS_MARGIN + effectiveProfileSize / 2; 
                
                targetX = clamp(targetX, boundaryLeft, boundaryRight); 
                targetY = clamp(targetY, boundaryTop, boundaryBottom); 
                
                if (targetX <= boundaryLeft || targetX >= boundaryRight) physics.vx *= -0.5; 
                if (targetY <= boundaryTop || targetY >= boundaryBottom) physics.vy *= -0.5;

                // Only animate non-pending, non-hovered items
                return { 
                    to: { x: targetX, y: targetY, scale: physics.targetScale, rotation: physics.targetRotation }, 
                    zIndex: 10, 
                    config: CONFIG.SPRING_CONFIG, 
                    immediate: key => !isInteracting && (key === 'x' || key === 'y') 
                };
            });
            
            frameId = requestAnimationFrame(animate);
        };
        
        frameId = requestAnimationFrame(animate);
        
        return () => { 
            cancelAnimationFrame(frameId); 
        };
    }, [api, bounds.width, bounds.height, profiles, hoverIndex, isInteracting, responsiveSize.baseSize, responsiveSize.renderScale]);

    // Pointer event handlers
    const handlePointerEnter = useCallback((index: number) => {
        // Only allow hover if no navigation is currently pending
        if (isNavigationPending.current === null) {
            setHoverIndex(index);
            setIsInteracting(true);
        }
    }, []);
    
    const handlePointerLeave = useCallback(() => {
        setHoverIndex(null);
        setIsInteracting(false);
    }, []);

    // Navigation functionality
    const performNavigation = useCallback((id: string) => {
        console.log(`[FloatingPetProfiles] Triggered navigation for ID: ${id}`);

        // Core Check: Is navigation STILL pending for THIS id?
        if (isNavigationPending.current !== id) {
            console.log(`[FloatingPetProfiles] Navigation no longer pending for ${id}`);
            return;
        }

        // Reset Pending State IMMEDIATELY
        isNavigationPending.current = null;

        // Clear Fallback Timeout
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }

        // Remove Audio Listeners
        const currentAudio = audioRef.current;
        const listeners = audioListenersRef.current;
        if (currentAudio) {
            if (listeners.ended) currentAudio.removeEventListener('ended', listeners.ended);
            if (listeners.error) currentAudio.removeEventListener('error', listeners.error);
        }
        
        // Clear the refs holding the listeners
        audioListenersRef.current = { ended: null, error: null };

        // Perform Navigation
        try {
            navigate(`/pet/${id}`);
        } catch (navError) {
            console.error(`[FloatingPetProfiles] Error during navigation for ${id}:`, navError);
        }
    }, [navigate]);

    // Click handler for profile navigation
    const handleClick = useCallback((id: string | undefined, index: number) => {
        if (!id || isNavigationPending.current) {
            return;
        }

        const audio = audioRef.current;

        // Immediate Navigation if Audio Fails
        if (!audio) {
            console.warn("[FloatingPetProfiles] Audio not ready, navigating immediately");
            isNavigationPending.current = id;
            performNavigation(id);
            return;
        }

        setIsInteracting(true);
        setHoverIndex(null);
        isNavigationPending.current = id;

        // Visual effect for clicked item
        api.start(i => (i === index ? {
            to: { opacity: 0.8, scale: CONFIG.HOVER_SCALE * 0.95 },
            config: { tension: 300, friction: 20 }
        } : {}));

        // Clear any previous listeners/timeouts
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }
        const previousListeners = audioListenersRef.current;
        if (audio) {
            if (previousListeners.ended) audio.removeEventListener('ended', previousListeners.ended);
            if (previousListeners.error) audio.removeEventListener('error', previousListeners.error);
        }

        // Setup new listeners
        const endedListener = () => {
            performNavigation(id);
        };

        const errorListener = (e: Event) => {
            console.error(`[FloatingPetProfiles] Audio error:`, e);
            performNavigation(id);
        };

        audioListenersRef.current = { ended: endedListener, error: errorListener };

        // Add listeners
        try {
            audio.addEventListener('ended', endedListener, { once: true });
            audio.addEventListener('error', errorListener, { once: true });
        } catch (listenerError) {
            console.error(`[FloatingPetProfiles] Error adding listeners:`, listenerError);
            performNavigation(id);
            return;
        }

        // Set fallback timeout
        navigationTimeoutRef.current = setTimeout(() => {
            performNavigation(id);
        }, CONFIG.SOUND_DURATION_MS + CONFIG.NAVIGATION_TIMEOUT_BUFFER_MS);

        // Play the sound
        audio.currentTime = 0;
        audio.play()
            .then(() => {
                console.log(`[FloatingPetProfiles] Audio playback started`);
            })
            .catch(playError => {
                console.error(`[FloatingPetProfiles] Audio play failed:`, playError);
                errorListener(playError);
            });
    }, [api, performNavigation]);

    return (
        <>
            {/* CSS Keyframes */}
            <style>
                {bgPulseKeyframes}
                {floatAnimation}
                {comicBoxFadeIn}
            </style>
            
            {/* Title */}
            <div className="relative w-full text-center my-4">
                <h2 
                    className="text-2xl md:text-4xl lg:text-5xl font-handwritten text-white drop-shadow-glow font-bold"
                    style={{ 
                        animation: 'float 6s ease-in-out infinite',
                        textShadow: '0 0 15px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 192, 203, 0.4)'
                    }}
                >
                    Рай за Домашни Любимци
                </h2>
            </div>
            
            <div 
                ref={containerRef} 
                className="relative w-full min-h-[70vh] overflow-hidden rounded-lg shadow-2xl my-4"
                style={{
                    background: 'linear-gradient(-45deg, rgba(255,202,202,0.3), rgba(209,244,255,0.2), rgba(255,255,209,0.3), rgba(255,220,255,0.2))',
                    backgroundSize: '400% 400%',
                    animation: 'bgPulse 15s ease infinite',
                    cursor: 'default',
                    boxShadow: 'inset 0 0 100px rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.1)'
                }}
            >
                {/* Background Particles - Large */}
                {useMemo(() => Array.from({ length: CONFIG.PARTICLE_LARGE_COUNT }).map((_, i) => (
                    <div 
                        key={`large-particle-${i}`} 
                        className="absolute rounded-full bg-white/30" 
                        style={{ 
                            width: `${randomInRange(20, 40)}px`, 
                            height: `${randomInRange(20, 40)}px`, 
                            left: `${randomInRange(0, 100)}%`, 
                            top: `${randomInRange(0, 100)}%`, 
                            opacity: randomInRange(0.05, 0.15), 
                            filter: 'blur(8px)',
                            animation: `float ${randomInRange(10, 15)}s ease-in-out infinite`,
                            animationDelay: `${randomInRange(0, 5)}s`,
                        }} 
                    />
                )), [])}
            
                {/* Background Particles - Regular */}
                {useMemo(() => Array.from({ length: CONFIG.PARTICLE_COUNT }).map((_, i) => (
                    <div 
                        key={`particle-${i}`} 
                        className="absolute rounded-full bg-white/20" 
                        style={{ 
                            width: `${randomInRange(2, 7)}px`, 
                            height: `${randomInRange(2, 7)}px`, 
                            left: `${randomInRange(0, 100)}%`, 
                            top: `${randomInRange(0, 100)}%`, 
                            opacity: randomInRange(0.1, 0.4), 
                            filter: 'blur(1px)',
                            animation: `pulse ${randomInRange(3, 8)}s ease-in-out infinite, float ${randomInRange(5, 10)}s ease-in-out infinite`,
                            animationDelay: `${randomInRange(0, 5)}s`, 
                        }} 
                    />
                )), [])}
                
                {/* Pet Profiles */}
                {springs.map((style, i) => {
                    if (i >= profiles.length) return null;
                    const profile = profiles[i];
                    if (!profile) return null;
                    
                    const isHighlighted = profile.id === highlightProfileId;
                    const isHovered = i === hoverIndex;
                    const isPendingNav = isNavigationPending.current === profile.id;
                    
                    return (
                        <FloatingProfile
                            key={profile.id || `floating-profile-${i}`}
                            profile={profile}
                            style={style}
                            index={i}
                            isHovered={isHovered}
                            isPendingNav={isPendingNav}
                            isHighlighted={isHighlighted}
                            comicBoxState={comicBoxStates[i] || { visible: false, message: '', timerId: null }}
                            responsiveSize={responsiveSize}
                            onPointerEnter={() => handlePointerEnter(i)}
                            onPointerLeave={handlePointerLeave}
                            onClick={() => handleClick(profile.id, i)}
                        />
                    );
                })}
                
                {/* Hidden Components */}
                {/* Audio controller for background music and cat meow sounds */}
                <AudioController
                    profiles={profiles}
                    onMeow={handleMeow}
                />
                
                {/* Comic box manager for showing comic boxes synchronized with cat meow */}
                <ComicBoxManager
                    profiles={profiles}
                    isNavigationPending={isNavigationPending}
                    triggerNewComicBox={triggerNewComicBox}
                />
            </div>
        </>
    );
};

export default FloatingPetProfiles; 