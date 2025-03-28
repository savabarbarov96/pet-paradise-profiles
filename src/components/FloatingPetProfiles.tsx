import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprings, animated, SpringConfig, SpringValue } from '@react-spring/web';
// Assuming PetProfile, PawPrint, Star, useMeasure are correctly imported
import { PetProfile } from '@/services/petProfileService'; import { PawPrint, Star } from 'lucide-react'; import useMeasure from 'react-use-measure';

// --- (Keep existing CONFIG, Helpers, Types) ---
const CONFIG = {
    PROFILE_BASE_SIZE: 100,
    PROFILE_RENDER_SCALE: 1.4,
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
    PARTICLE_COUNT: 25,
};
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);
interface PhysicsState { vx: number; vy: number; targetScale: number; targetRotation: number; }
interface InitialPosition { x: number; y: number; scale: number; rotation: number; }
// --- Dummy Types for Props ---
interface FloatingPetProfilesProps {
    profiles: Array<{ id: string; name: string; featured_media_url?: string }>;
    highlightProfileId?: string | null;
}
// ---

const FloatingPetProfiles: React.FC<FloatingPetProfilesProps> = ({ profiles, highlightProfileId }) => {
    const navigate = useNavigate();
    const [containerRef, bounds] = useMeasure();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const physicsStateRef = useRef<PhysicsState[]>([]);
    const isNavigationPending = useRef<string | null>(null);
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Store listeners refs to remove them correctly
    const audioListenersRef = useRef<{ ended: (() => void) | null; error: ((e: Event) => void) | null }>({ ended: null, error: null });


    // --- (Keep initializePhysicsState, useEffect for physics init) ---
    const initializePhysicsState = useCallback((count: number) => {
        physicsStateRef.current = Array.from({ length: count }, () => ({
            vx: randomInRange(-CONFIG.MIN_VELOCITY, CONFIG.MIN_VELOCITY) * 2,
            vy: randomInRange(-CONFIG.MIN_VELOCITY, CONFIG.MIN_VELOCITY) * 2,
            targetScale: randomInRange(CONFIG.MIN_SCALE, CONFIG.MAX_SCALE),
            targetRotation: randomInRange(-5, 5),
        }));
    }, []); // Added missing dependencies - though logic is simple here
    useEffect(() => { initializePhysicsState(profiles.length); }, [profiles.length, initializePhysicsState]);

    // --- (Keep useSprings) ---
    const [springs, api] = useSprings(
        profiles.length,
        (index) => {
            const profileRenderSize = CONFIG.PROFILE_BASE_SIZE * CONFIG.PROFILE_RENDER_SCALE;
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
        [profiles.length, bounds.width, bounds.height]
    );


    // --- (Keep Audio Initialization, Highlight Effect) ---
    useEffect(() => { /* Audio Init */
         try { const audio = new Audio('/sounds/select-floating-element.mp3'); audio.preload = 'auto'; audioRef.current = audio; } catch (error) { console.error("Failed to create Audio object:", error); }
         return () => { // Cleanup on unmount
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
    useEffect(() => { /* Highlight Effect */
         if (highlightProfileId) { const index = profiles.findIndex(p => p.id === highlightProfileId); if (index !== -1) { setHoverIndex(index); const timer = setTimeout(() => setHoverIndex(currentHover => (currentHover === index ? null : currentHover)), CONFIG.HIGHLIGHT_DURATION); return () => clearTimeout(timer); } } else { setHoverIndex(null); /* Clear hover if highlightProfileId becomes null */ }
    }, [highlightProfileId, profiles]);


    // --- (Keep Animation Loop - useEffect - No changes needed here) ---
    useEffect(() => { /* Animation loop */
       if (!bounds.width || !bounds.height || profiles.length === 0) return;
       let frameId: number;
       const effectiveProfileSize = CONFIG.PROFILE_BASE_SIZE * CONFIG.PROFILE_RENDER_SCALE;
       const animate = (timestamp: number) => {
            const currentNavPendingId = isNavigationPending.current; const currentPhysicsState = physicsStateRef.current;
            if (document.hidden) { frameId = requestAnimationFrame(animate); return; }
            const currentSpringValues = api.current.map(spring => spring.get());

            api.start((index, spring) => {
                if (index >= profiles.length || index >= currentPhysicsState.length || index >= currentSpringValues.length) { spring.stop(); return { immediate: true, opacity: 0 }; }
                const profileId = profiles[index]?.id;
                // Check if this specific profile is pending navigation
                if (currentNavPendingId === profileId) {
                    // Keep it static if it's the one being clicked/navigated
                    return { immediate: true };
                }
                if (index === hoverIndex && currentNavPendingId === null) { // Only apply hover if nothing is pending navigation
                    return { scale: CONFIG.HOVER_SCALE, rotation: 0, zIndex: 20, config: CONFIG.SPRING_CONFIG_HOVER };
                }
                const physics = currentPhysicsState[index]; const current = currentSpringValues[index]; let { vx, vy } = physics;
                // --- Forces (Repulsion, Wall, Drift) --- //
                for (let j = 0; j < profiles.length; j++) { if (index === j || index >= currentSpringValues.length || j >= currentSpringValues.length) continue; const otherProfileId = profiles[j]?.id; if (currentNavPendingId === otherProfileId) continue; /* Skip repulsion from pending item */ const otherCurrent = currentSpringValues[j]; if (!otherCurrent) continue; const dx = current.x - otherCurrent.x; const dy = current.y - otherCurrent.y; const distanceSq = dx * dx + dy * dy; const minDistance = CONFIG.REPULSION_DISTANCE; if (distanceSq < minDistance * minDistance && distanceSq > 1) { const distance = Math.sqrt(distanceSq); const force = (minDistance - distance) / distance * CONFIG.REPULSION_STRENGTH; vx += dx * force; vy += dy * force; } }
                const wallThreshold = CONFIG.BOUNDS_MARGIN * 1.5; const wallExpFactor = 0.03; const wallForceX = Math.exp(-(current.x - wallThreshold) * wallExpFactor) - Math.exp((current.x - (bounds.width - wallThreshold)) * wallExpFactor); const wallForceY = Math.exp(-(current.y - wallThreshold) * wallExpFactor) - Math.exp((current.y - (bounds.height - wallThreshold)) * wallExpFactor); vx += wallForceX * CONFIG.WALL_REPULSION_STRENGTH; vy += wallForceY * CONFIG.WALL_REPULSION_STRENGTH;
                vx += (Math.random() - 0.5) * CONFIG.RANDOM_DRIFT_STRENGTH; vy += (Math.random() - 0.5) * CONFIG.RANDOM_DRIFT_STRENGTH;
                // --- Velocity Clamping & Damping --- //
                const speed = Math.sqrt(vx * vx + vy * vy); const maxV = CONFIG.MAX_VELOCITY; const minV = CONFIG.MIN_VELOCITY; if (speed > maxV) { vx = (vx / speed) * maxV; vy = (vy / speed) * maxV; } else if (speed > 0 && speed < minV && !isInteracting) { vx = (vx / speed) * minV; vy = (vy / speed) * minV; } else if (speed < 0.01 && !isInteracting) { vx = (Math.random() - 0.5) * minV * 2; vy = (Math.random() - 0.5) * minV * 2; } vx *= CONFIG.PHYSICS_DAMPING; vy *= CONFIG.PHYSICS_DAMPING;
                physics.vx = vx; physics.vy = vy;
                // --- Target Position & Boundary Check --- //
                let targetX = current.x + vx; let targetY = current.y + vy; const boundaryRight = bounds.width - CONFIG.BOUNDS_MARGIN - effectiveProfileSize / 2; const boundaryBottom = bounds.height - CONFIG.BOUNDS_MARGIN - effectiveProfileSize / 2; const boundaryLeft = CONFIG.BOUNDS_MARGIN + effectiveProfileSize / 2; const boundaryTop = CONFIG.BOUNDS_MARGIN + effectiveProfileSize / 2; targetX = clamp(targetX, boundaryLeft, boundaryRight); targetY = clamp(targetY, boundaryTop, boundaryBottom); if (targetX <= boundaryLeft || targetX >= boundaryRight) physics.vx *= -0.5; if (targetY <= boundaryTop || targetY >= boundaryBottom) physics.vy *= -0.5;

                // Only animate non-pending, non-hovered items
                return { to: { x: targetX, y: targetY, scale: physics.targetScale, rotation: physics.targetRotation }, zIndex: 10, config: CONFIG.SPRING_CONFIG, immediate: key => !isInteracting && (key === 'x' || key === 'y') };
           });
           frameId = requestAnimationFrame(animate);
       };
       frameId = requestAnimationFrame(animate);
       return () => { cancelAnimationFrame(frameId); /* No need to clear pending state here, handled by unmount/navigation */ };
    }, [api, bounds.width, bounds.height, profiles, hoverIndex, isInteracting /* profiles.length removed, covered by profiles */]);


    // --- (Keep Pointer Enter/Leave Handlers) ---
    const handlePointerEnter = useCallback((index: number) => {
        // Only allow hover if no navigation is currently pending
        if (isNavigationPending.current === null) {
            setHoverIndex(index);
            setIsInteracting(true);
        }
    }, []); // No dependencies needed if it only uses refs and setters
    const handlePointerLeave = useCallback(() => {
        setHoverIndex(null);
        setIsInteracting(false);
    }, []);

    // --- Navigation Logic --- (REVISED)
    const performNavigation = useCallback((id: string) => {
        console.log(`[performNavigation] Triggered for ID: ${id}. Current pending: ${isNavigationPending.current}`);

        // --- Core Check: Is navigation STILL pending for THIS id? ---
        if (isNavigationPending.current !== id) {
            console.log(`[performNavigation] Skipped. Navigation no longer pending for ${id} or pending for another.`);
            // We don't cleanup here necessarily, as the *correct* trigger should do it.
            return;
        }

        // --- Navigation is confirmed for this ID ---
        console.log(`[performNavigation] Condition met for ${id}. Proceeding with navigation and cleanup.`);

        // 1. Reset Pending State IMMEDIATELY
        isNavigationPending.current = null;

        // 2. Clear Fallback Timeout
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
            console.log(`[performNavigation] Cleared timeout ref for ${id}.`);
        }

        // 3. Remove Audio Listeners
        const currentAudio = audioRef.current;
        const listeners = audioListenersRef.current;
        if (currentAudio) {
             // Check if listener refs exist before trying to remove
            if (listeners.ended) {
                currentAudio.removeEventListener('ended', listeners.ended);
                console.log(`[performNavigation] Removed 'ended' listener for ${id}.`);
            }
            if (listeners.error) {
                currentAudio.removeEventListener('error', listeners.error);
                console.log(`[performNavigation] Removed 'error' listener for ${id}.`);
            }
        }
        // Clear the refs holding the listeners
        audioListenersRef.current = { ended: null, error: null };


        // 4. Perform Navigation
        console.log(`[performNavigation] Calling navigate('/pet/${id}')`);
        try {
            navigate(`/pet/${id}`);
            // Note: Code here might not execute if navigate causes immediate unmount
            console.log(`[performNavigation] navigate() called successfully for ${id}.`);
        } catch (navError) {
            console.error(`[performNavigation] Error during navigate() call for ${id}:`, navError);
            // Pending state is already null, so no need to reset again here.
        }

    }, [navigate]); // Dependency: navigate

    // --- Click Handler --- (REVISED)
    const handleClick = useCallback((id: string | undefined, index: number) => {
        if (!id || isNavigationPending.current) {
            console.log(`[handleClick] Aborted. ID: ${id}, Pending: ${isNavigationPending.current}`);
            return;
        }

        const audio = audioRef.current;

        // --- Immediate Navigation if Audio Fails ---
        if (!audio) {
            console.warn("[handleClick] Audio not ready, navigating immediately.");
            isNavigationPending.current = id; // Set pending
            performNavigation(id); // Navigate (will also clean up potential stray timeout/listeners)
            return;
        }

        console.log(`[handleClick] Click detected for ID: ${id}, Index: ${index}. Setting pending state.`);
        setIsInteracting(true); // Keep interacting state
        setHoverIndex(null);    // Remove hover visual
        isNavigationPending.current = id; // Mark this profile as pending

        // Stop physics updates for the clicked item visually (optional but nice)
        // You might want a different visual effect like slight shrink/fade later
        api.start(i => (i === index ? {
            to: { opacity: 0.8, scale: CONFIG.HOVER_SCALE * 0.95 }, // Example: slight fade/shrink
            config: { tension: 300, friction: 20 }
         } : {}));


        // --- Clear any PREVIOUS listeners/timeout from a prior aborted click ---
        // (This is defensive programming for rapid clicks, though the initial check should prevent most)
        if (navigationTimeoutRef.current) {
             clearTimeout(navigationTimeoutRef.current);
             navigationTimeoutRef.current = null;
        }
        const previousListeners = audioListenersRef.current;
        if (audio) {
             if (previousListeners.ended) audio.removeEventListener('ended', previousListeners.ended);
             if (previousListeners.error) audio.removeEventListener('error', previousListeners.error);
        }
        // ---

        // Define listeners for THIS click
        const endedListener = () => {
            console.log(`[Audio Ended] Event fired for ID: ${id}. Triggering performNavigation.`);
            // DO NOT cleanup here. performNavigation handles it.
            performNavigation(id);
        };

        const errorListener = (e: Event) => {
            console.error(`[Audio Error] Event fired for ID: ${id}. Triggering performNavigation.`, e);
            // DO NOT cleanup here. performNavigation handles it.
            performNavigation(id); // Navigate even if sound fails
        };

        // Store references to the listeners for potential cleanup by performNavigation or unmount
        audioListenersRef.current = { ended: endedListener, error: errorListener };

        // Add listeners
        try {
             audio.addEventListener('ended', endedListener, { once: true });
             audio.addEventListener('error', errorListener, { once: true });
             console.log(`[handleClick] Added 'ended' and 'error' listeners for ${id}`);
        } catch (listenerError) {
              console.error(`[handleClick] Error adding listeners for ${id}:`, listenerError);
              // If listeners fail, navigate immediately
              performNavigation(id);
              return; // Don't proceed to play audio or set timeout
        }

        // Set fallback timeout
        navigationTimeoutRef.current = setTimeout(() => {
            console.warn(`[Timeout Fallback] Reached for ID: ${id}. Triggering performNavigation.`);
            // DO NOT cleanup here. performNavigation handles it.
            performNavigation(id);
        }, CONFIG.SOUND_DURATION_MS + CONFIG.NAVIGATION_TIMEOUT_BUFFER_MS);
        console.log(`[handleClick] Set fallback timeout for ${id} (${CONFIG.SOUND_DURATION_MS + CONFIG.NAVIGATION_TIMEOUT_BUFFER_MS}ms)`);

        // Play the sound
        console.log(`[handleClick] Attempting to play audio for ${id}`);
        audio.currentTime = 0; // Rewind first
        audio.play()
            .then(() => {
                console.log(`[handleClick] Audio playback started successfully for ${id}.`);
            })
            .catch(playError => {
                console.error(`[handleClick] Initial audio play() failed for ${id}:`, playError);
                // Manually trigger the error listener path if play fails immediately
                errorListener(playError);
            });

    }, [api, profiles, performNavigation]); // Use performNavigation in dependency array


    // --- Rendering --- (No changes needed in JSX structure)
    return (
        <div ref={containerRef} className="relative w-full min-h-[70vh] overflow-hidden bg-gradient-to-tr from-[#FFCACA]/20 via-[#D1F4FF]/10 to-[#FFFFD1]/20 touch-none select-none" style={{ cursor: 'default' }}>
            {/* Particles */}
            {useMemo(() => Array.from({ length: CONFIG.PARTICLE_COUNT }).map((_, i) => ( <div key={`particle-${i}`} className="absolute rounded-full bg-white/20 animate-pulse" style={{ width: `${randomInRange(2, 7)}px`, height: `${randomInRange(2, 7)}px`, left: `${randomInRange(0, 100)}%`, top: `${randomInRange(0, 100)}%`, opacity: randomInRange(0.1, 0.4), animationDelay: `${randomInRange(0, 5)}s`, animationDuration: `${randomInRange(3, 8)}s`, }} /> )), [])}
            {/* Profiles */}
            {springs.map((style, i) => {
                if (i >= profiles.length) return null;
                const profile = profiles[i];
                if (!profile) return null; // Add safety check
                const isHighlighted = profile.id === highlightProfileId;
                const isHovered = i === hoverIndex;
                // Check ref directly for pending status for rendering class
                const isPendingNav = isNavigationPending.current === profile.id;

                return (
                    <animated.div
                        key={profile.id || `profile-${i}`} // Ensure key is stable
                        className={`absolute cursor-pointer rounded-full ${isPendingNav ? 'opacity-70' : ''}`} // Apply opacity if pending
                        style={{
                            ...style,
                            width: CONFIG.PROFILE_BASE_SIZE * CONFIG.PROFILE_RENDER_SCALE,
                            height: CONFIG.PROFILE_BASE_SIZE * CONFIG.PROFILE_RENDER_SCALE,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            filter: `brightness(${isHovered && !isPendingNav ? 1.3 : 1.0}) drop-shadow(0 4px 15px rgba(0,0,0,0.1))`, // Don't brighten if pending
                            WebkitTapHighlightColor: 'transparent',
                            pointerEvents: isPendingNav ? 'none' : 'auto', // Disable clicks if pending
                        }}
                        onPointerEnter={() => handlePointerEnter(i)}
                        onPointerLeave={handlePointerLeave}
                        onClick={() => handleClick(profile.id, i)} // Pass ID and index
                        aria-label={`View profile for ${profile.name}`}
                    >
                        {/* Inner content */}
                        <div className="relative flex flex-col items-center transition-transform duration-200 ease-out">
                            <div className={`absolute inset-[-10px] rounded-full blur-lg transition-opacity duration-300 ${ isHovered && !isPendingNav ? 'bg-white/30 opacity-100' : 'bg-white/10 opacity-70' }`} />
                            {isHighlighted && !isHovered && !isPendingNav && ( <div className="absolute -top-3 -right-3 z-10 text-yellow-300 animate-pulse"> <Star className="w-5 h-5 fill-current filter drop-shadow-[0_0_5px_rgba(255,255,0,0.7)]" /> </div> )}
                            <div className={`relative rounded-full overflow-hidden border-2 transition-all duration-300 ease-out ${ isHovered && !isPendingNav ? 'border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/30 shadow-md' }`} style={{ width: CONFIG.PROFILE_BASE_SIZE, height: CONFIG.PROFILE_BASE_SIZE }}>
                                {profile.featured_media_url ? ( <img src={profile.featured_media_url} alt="" className="w-full h-full object-cover" draggable="false" /> ) : ( <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-300/70 to-blue-300/70"> {/* Example fallback colors */} <PawPrint size={CONFIG.PROFILE_BASE_SIZE * 0.4} className="text-white/80" /> </div> )}
                            </div>
                            <div className={`mt-2 px-3 py-0.5 rounded-full backdrop-blur-sm transition-colors duration-300 ${ isHovered && !isPendingNav ? 'bg-white/30 shadow-md' : 'bg-white/15' }`} > <p className={`text-center text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${ isHovered && !isPendingNav ? 'text-white' : 'text-white/85' } font-handwritten`} > {profile.name} </p> </div>
                        </div>
                    </animated.div>
                );
            })}
        </div>
    );
};

export default FloatingPetProfiles; // Ensure export is correct