import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ComicBoxManagerProps, ComicBoxState, WHOLESOME_MESSAGES, CONFIG } from './types';

/**
 * ComicBoxManager component manages the state and display of comic boxes
 * that appear above pet profiles when triggered
 */
const ComicBoxManager: React.FC<ComicBoxManagerProps> = ({ 
    profiles, 
    isNavigationPending,
    triggerNewComicBox 
}) => {
    // Comic box state
    const [comicBoxStates, setComicBoxStates] = useState<ComicBoxState[]>([]);
    
    // Track used messages to avoid duplicates
    const usedMessagesRef = useRef<Set<string>>(new Set());
    
    // Counter for trigger changes
    const triggerCountRef = useRef<number>(0);
    const prevTriggerRef = useRef<boolean>(false);
    
    // Function to get a random message not currently displayed
    const getRandomMessage = useCallback(() => {
        const availableMessages = WHOLESOME_MESSAGES.filter(msg => !usedMessagesRef.current.has(msg));
        
        // If all messages have been used, reset the used set
        if (availableMessages.length === 0) {
            usedMessagesRef.current.clear();
            return WHOLESOME_MESSAGES[Math.floor(Math.random() * WHOLESOME_MESSAGES.length)];
        }
        
        return availableMessages[Math.floor(Math.random() * availableMessages.length)];
    }, []);

    // Show a comic box for a random profile
    const showRandomComicBox = useCallback(() => {
        if (!profiles.length) return;
        
        console.log("[ComicBoxManager] Showing random comic box");
        
        // Check how many comic boxes are currently visible
        const visibleCount = comicBoxStates.filter(state => state.visible).length;
        const maxSimultaneousBoxes = Math.min(CONFIG.MAX_SIMULTANEOUS_COMIC_BOXES, Math.ceil(profiles.length / 2));
        
        // Don't add more if we've reached the max
        if (visibleCount >= maxSimultaneousBoxes) {
            console.log("[ComicBoxManager] Maximum number of comic boxes reached");
            return;
        }
        
        // Find profiles that don't currently have a visible comic box
        const availableProfiles = profiles.map((profile, index) => ({ profile, index }))
            .filter((item) => {
                // Skip if navigation is pending for this profile
                if (isNavigationPending.current === item.profile.id) return false;
                // Skip if already has a visible comic box
                return !(comicBoxStates[item.index]?.visible);
            });
        
        // If no profiles are available, do nothing
        if (!availableProfiles.length) {
            console.log("[ComicBoxManager] No available profiles for comic boxes");
            return;
        }
        
        // Select a random profile
        const randomProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
        const randomIndex = randomProfile.index;
        
        // Get a random message
        const message = getRandomMessage();
        
        // Mark this message as used
        usedMessagesRef.current.add(message);
        
        console.log(`[ComicBoxManager] Adding comic box to profile ${randomIndex} with message: ${message}`);
        
        // Show comic box for the selected profile
        setComicBoxStates(prevStates => {
            const newStates = [...prevStates];
            
            // Ensure there's an entry for this index
            while (newStates.length <= randomIndex) {
                newStates.push({ visible: false, message: '', timerId: null });
            }
            
            // Clear any existing timer
            if (newStates[randomIndex]?.timerId) {
                clearTimeout(newStates[randomIndex].timerId as NodeJS.Timeout);
            }
            
            // Show the message
            newStates[randomIndex] = {
                visible: true,
                message,
                timerId: null
            };
            
            // Set a timer to hide the message
            const hideTimerId = setTimeout(() => {
                setComicBoxStates(prevStates => {
                    const newStates = [...prevStates];
                    
                    // Hide the message
                    if (randomIndex < newStates.length) {
                        newStates[randomIndex] = {
                            visible: false,
                            message: '',
                            timerId: null
                        };
                    }
                    
                    return newStates;
                });
                
                // After hiding, remove from used messages
                usedMessagesRef.current.delete(message);
                
            }, CONFIG.COMIC_BOX_DURATION);
            
            // Save the timer ID
            newStates[randomIndex].timerId = hideTimerId;
            
            return newStates;
        });
        
    }, [profiles, comicBoxStates, getRandomMessage, isNavigationPending]);

    // Initialize comic box states when profiles change
    useEffect(() => {
        console.log("[ComicBoxManager] Profiles changed, initializing comic box states");
        // Reset comic box states when profiles change
        setComicBoxStates(profiles.map(() => ({
            visible: false,
            message: '',
            timerId: null
        })));
        
        // Clear used messages
        usedMessagesRef.current.clear();
        
        // Clean up any existing timers
        return () => {
            comicBoxStates.forEach(state => {
                if (state.timerId) {
                    clearTimeout(state.timerId);
                }
            });
        };
    }, [profiles]);

    // Effect to show a new comic box when triggered externally
    useEffect(() => {
        console.log("[ComicBoxManager] Trigger state changed:", triggerNewComicBox);
        
        // Only trigger a new comic box when the trigger state actually changes
        if (triggerNewComicBox !== prevTriggerRef.current) {
            prevTriggerRef.current = triggerNewComicBox;
            triggerCountRef.current += 1;
            showRandomComicBox();
        }
    }, [triggerNewComicBox, showRandomComicBox]);

    return (
        <>
            {/* This component doesn't render directly, but we pass the state via a hidden data attribute */}
            <input 
                type="hidden" 
                id="comic-box-states"
                data-comic-box-states={JSON.stringify(comicBoxStates)} 
                data-profiles-count={profiles.length}
            />
        </>
    );
};

export default ComicBoxManager; 