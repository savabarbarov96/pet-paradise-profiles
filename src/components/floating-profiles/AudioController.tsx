import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AudioControllerProps, CONFIG } from './types';

/**
 * AudioController component handles all audio-related functionality
 * including background music and cat meow sound
 */
const AudioController: React.FC<AudioControllerProps> = ({ profiles, onMeow }) => {
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
    const catMeowRef = useRef<HTMLAudioElement | null>(null);
    const catMeowIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioInitializedRef = useRef<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const autoPlayAttemptedRef = useRef<boolean>(false);

    // Function to initialize and play audio
    const initializeAudio = useCallback(() => {
        // Only initialize once
        if (audioInitializedRef.current) return;

        console.log("[AudioController] Initializing audio elements...");
        try {
            // Initialize background music if not already initialized
            if (!backgroundMusicRef.current) {
                // Check if an existing audio element is already playing to prevent duplicates
                const existingBgMusic = document.getElementById('bg-music-element') as HTMLAudioElement;
                if (existingBgMusic) {
                    console.log("[AudioController] Found existing background music element");
                    backgroundMusicRef.current = existingBgMusic;
                    
                    // If the existing music element is paused, try to play it
                    if (existingBgMusic.paused && !autoPlayAttemptedRef.current) {
                        console.log("[AudioController] Attempting to play existing background music...");
                        existingBgMusic.play()
                            .then(() => {
                                console.log("[AudioController] Existing background music playing successfully");
                                autoPlayAttemptedRef.current = true;
                            })
                            .catch(error => {
                                console.error("[AudioController] Failed to play existing background music:", error);
                                setupUserInteractionHandlers();
                            });
                    }
                } else {
                    // Create new audio element
                    const bgMusic = new Audio('/sounds/pet-paradise-background-music.mp3');
                    bgMusic.id = 'bg-music-element';
                    bgMusic.loop = true;
                    bgMusic.volume = 0.15; // Reduced volume to 15%
                    bgMusic.preload = 'auto';
                    bgMusic.muted = false; // Ensure it's not muted by default
                    
                    // Add to DOM so we can find it later
                    document.body.appendChild(bgMusic);
                    backgroundMusicRef.current = bgMusic;
                    
                    // Start playing background music immediately
                    console.log("[AudioController] Attempting to play background music immediately...");
                    if (!autoPlayAttemptedRef.current) {
                        bgMusic.play()
                            .then(() => {
                                console.log("[AudioController] Background music playing successfully");
                                autoPlayAttemptedRef.current = true;
                            })
                            .catch(error => {
                                console.error("[AudioController] Failed to play background music:", error);
                                setupUserInteractionHandlers();
                            });
                    }
                }
            }
            
            // Initialize cat meow sound if not already initialized
            if (!catMeowRef.current) {
                const meowSound = new Audio('/sounds/cat-meow-7-fx-306186.mp3');
                meowSound.volume = 0.5; // Set meow volume to 50%
                meowSound.preload = 'auto';
                catMeowRef.current = meowSound;
                
                // Set up interval to play cat meow sound every 10 seconds
                if (!catMeowIntervalRef.current) {
                    console.log("[AudioController] Setting up cat meow interval...");
                    catMeowIntervalRef.current = setInterval(() => {
                        if (catMeowRef.current && !document.hidden && profiles.length > 0 && !isMuted) {
                            console.log("[AudioController] Playing cat meow sound...");
                            // Play cat meow sound
                            catMeowRef.current.currentTime = 0;
                            catMeowRef.current.play()
                                .then(() => {
                                    console.log("[AudioController] Cat meow played successfully");
                                    // Call the onMeow callback to trigger a comic box
                                    onMeow();
                                })
                                .catch(error => {
                                    console.error("[AudioController] Failed to play cat meow sound:", error);
                                });
                        }
                    }, CONFIG.CAT_MEOW_INTERVAL);

                    // Trigger first meow after a short delay
                    setTimeout(() => {
                        if (catMeowRef.current && profiles.length > 0 && !isMuted) {
                            catMeowRef.current.play()
                                .then(() => {
                                    console.log("[AudioController] Initial cat meow played successfully");
                                    onMeow();
                                })
                                .catch(error => {
                                    console.error("[AudioController] Failed to play initial cat meow:", error);
                                });
                        }
                    }, 2000);
                }
            }
            
            // Mark as initialized
            audioInitializedRef.current = true;
        } catch (error) {
            console.error("[AudioController] Failed to initialize audio objects:", error);
        }
    }, [profiles.length, onMeow, isMuted]);

    // Setup handlers for user interaction that will trigger sound to play
    const setupUserInteractionHandlers = useCallback(() => {
        const playAllAudio = () => {
            console.log("[AudioController] User interaction detected, playing all audio");
            if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
                backgroundMusicRef.current.play()
                    .then(() => {
                        console.log("[AudioController] Background music playing after user interaction");
                        // Remove event listeners after successful playback
                        document.removeEventListener('click', playAllAudio);
                        document.removeEventListener('touchstart', playAllAudio);
                        document.removeEventListener('keydown', playAllAudio);
                        document.removeEventListener('scroll', playAllAudio);
                        document.removeEventListener('mousemove', playAllAudio);
                    })
                    .catch(error => {
                        console.error("[AudioController] Still failed to play background music:", error);
                    });
            }
        };

        // Add various event listeners to catch any user interaction
        document.addEventListener('click', playAllAudio, { once: true });
        document.addEventListener('touchstart', playAllAudio, { once: true });
        document.addEventListener('keydown', playAllAudio, { once: true });
        document.addEventListener('scroll', playAllAudio, { once: true });
        document.addEventListener('mousemove', playAllAudio, { once: true });

        // Auto-attempt to play after a small delay (some browsers allow this)
        setTimeout(() => {
            if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
                backgroundMusicRef.current.play().catch(() => {
                    console.log("[AudioController] Auto-play retry failed, waiting for user interaction");
                });
            }
        }, 1000);
    }, []);

    // Toggle mute function for all audio
    const toggleMute = useCallback(() => {
        // Create a single global mute event
        if (!window.hasOwnProperty('petParadiseMuteState')) {
            Object.defineProperty(window, 'petParadiseMuteState', {
                value: { isMuted: false },
                writable: true
            });
        }
        
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        (window as any).petParadiseMuteState.isMuted = newMutedState;
        
        // Mute background music
        if (backgroundMusicRef.current) {
            backgroundMusicRef.current.muted = newMutedState;
            
            // If unmuting, try to play if it was paused
            if (!newMutedState && backgroundMusicRef.current.paused) {
                backgroundMusicRef.current.play().catch(e => 
                    console.error("[AudioController] Failed to play after unmute:", e)
                );
            }
        }
        
        // Dispatch event for other components to sync their mute state
        window.dispatchEvent(new CustomEvent('pet-paradise-mute-change', { 
            detail: { isMuted: newMutedState }
        }));
        
        console.log(`[AudioController] Audio ${newMutedState ? 'muted' : 'unmuted'}`);
    }, [isMuted]);

    // Add a global event listener for the mute change event
    useEffect(() => {
        // Listen for mute changes from other instances
        const handleMuteChange = (event: any) => {
            const mutedState = event.detail?.isMuted;
            if (typeof mutedState === 'boolean' && mutedState !== isMuted) {
                setIsMuted(mutedState);
                if (backgroundMusicRef.current) {
                    backgroundMusicRef.current.muted = mutedState;
                    
                    // If unmuting, try to play if it was paused
                    if (!mutedState && backgroundMusicRef.current.paused) {
                        backgroundMusicRef.current.play().catch(e => 
                            console.error("[AudioController] Failed to play after global unmute:", e)
                        );
                    }
                }
            }
        };
        
        window.addEventListener('pet-paradise-mute-change', handleMuteChange);
        
        // Check global state on mount
        if (window.hasOwnProperty('petParadiseMuteState') && (window as any).petParadiseMuteState?.isMuted !== isMuted) {
            setIsMuted((window as any).petParadiseMuteState.isMuted);
        }
        
        return () => {
            window.removeEventListener('pet-paradise-mute-change', handleMuteChange);
        };
    }, [isMuted]);

    // Initialize audio on mount and ensure it's only initialized once
    useEffect(() => {
        console.log("[AudioController] Audio initialization effect running");
        initializeAudio();
        
        // Add a listener for visibility change to handle tab focus/unfocus
        const handleVisibilityChange = () => {
            if (!document.hidden && backgroundMusicRef.current) {
                // Resume music when tab becomes visible again
                if (backgroundMusicRef.current.paused && !isMuted) {
                    console.log("[AudioController] Tab visible again, resuming background music");
                    backgroundMusicRef.current.play().catch(e => 
                        console.error("[AudioController] Failed to resume background music:", e)
                    );
                }
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup on unmount
        return () => {
            console.log("[AudioController] Cleaning up audio resources");
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            
            // Don't pause the background music on unmount, let it continue 
            // since there may be other instances of the component
            
            // Stop cat meow interval
            if (catMeowIntervalRef.current) {
                clearInterval(catMeowIntervalRef.current);
                catMeowIntervalRef.current = null;
            }
            
            // Stop cat meow sound
            if (catMeowRef.current) {
                catMeowRef.current.pause();
                catMeowRef.current = null;
            }
            
            // Reset initialized flag
            audioInitializedRef.current = false;
        };
    }, [initializeAudio, isMuted]); 

    // Check if another mute button already exists
    const [showMuteButton, setShowMuteButton] = useState<boolean>(true);
    
    useEffect(() => {
        // Check if another mute button already exists
        const existingMuteButton = document.getElementById('pet-paradise-mute-button');
        if (existingMuteButton) {
            setShowMuteButton(false);
        } else {
            setShowMuteButton(true);
        }
    }, []);

    // Export a mute toggle button
    return showMuteButton ? (
        <button 
            id="pet-paradise-mute-button"
            className="fixed bottom-4 right-4 z-50 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            title={isMuted ? "Unmute sound" : "Mute sound"}
        >
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    ) : null;
};

export default AudioController; 