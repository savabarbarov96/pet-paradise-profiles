import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprings, animated } from '@react-spring/web';
import { PetProfile } from '@/services/petProfileService';
import { PawPrint, Star } from 'lucide-react';

interface FloatingPetProfilesProps {
  profiles: PetProfile[];
  highlightProfileId?: string | null;
}

// Configuration for animation behavior
const ANIMATION_CONFIG = {
  PROFILE_SIZE: 140,       // Base size in pixels for profile elements
  MIN_SCALE: 0.8,          // Minimum scale factor for profiles
  MAX_SCALE: 1.1,          // Maximum scale factor for profiles
  HOVER_SCALE: 1.4,        // Scale factor when hovered
  BOUNDS_MARGIN: 50,       // Margin from edges of container
  MAX_VELOCITY: 0.2,       // Maximum floating velocity
  MIN_VELOCITY: 0.05,      // Minimum floating velocity
  INTERACTION_DISTANCE: 100, // Distance where profiles start to repel each other
  SPRING_CONFIG: {          // Spring physics configuration
    tension: 50,
    friction: 30
  }
};

const FloatingPetProfiles: React.FC<FloatingPetProfilesProps> = ({ profiles, highlightProfileId }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Generate random initial positions and velocities for each profile
  const generatePositions = (count: number, containerWidth: number, containerHeight: number) => {
    return Array.from({ length: count }, () => ({
      x: ANIMATION_CONFIG.BOUNDS_MARGIN + Math.random() * (containerWidth - 2 * ANIMATION_CONFIG.BOUNDS_MARGIN),
      y: ANIMATION_CONFIG.BOUNDS_MARGIN + Math.random() * (containerHeight - 2 * ANIMATION_CONFIG.BOUNDS_MARGIN),
      scale: ANIMATION_CONFIG.MIN_SCALE + Math.random() * (ANIMATION_CONFIG.MAX_SCALE - ANIMATION_CONFIG.MIN_SCALE),
      rotation: -5 + Math.random() * 10,
      vx: (Math.random() - 0.5) * ANIMATION_CONFIG.MAX_VELOCITY,
      vy: (Math.random() - 0.5) * ANIMATION_CONFIG.MAX_VELOCITY
    }));
  };

  // Update container size on resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  // Init audio
  useEffect(() => {
    const audio = new Audio('/sounds/select-floating-element.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Highlight newly created profile
  useEffect(() => {
    if (highlightProfileId) {
      const index = profiles.findIndex(profile => profile.id === highlightProfileId);
      if (index >= 0) {
        setHoverIndex(index);
        
        const timer = setTimeout(() => {
          setHoverIndex(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightProfileId, profiles]);
  
  // Setup spring animations for each profile
  const [springs, api] = useSprings(
    profiles.length || 1, // Ensure at least 1 to avoid rendering issues
    (index) => {
      // Use safe index for position generation
      const safeIndex = profiles.length ? index : 0;
      const initialPositions = generatePositions(
        Math.max(1, profiles.length),
        containerSize.width || window.innerWidth,
        containerSize.height || window.innerHeight
      );
      
      return {
        to: {
          x: initialPositions[safeIndex].x,
          y: initialPositions[safeIndex].y,
          scale: initialPositions[safeIndex].scale,
          rotation: initialPositions[safeIndex].rotation,
          zIndex: 10,
          opacity: 1,
          immediate: true
        }
      };
    }
  );
  
  // Animation loop for floating effect
  useEffect(() => {
    if (!containerSize.width || !containerSize.height || !profiles.length) return;
    
    let positions = generatePositions(profiles.length, containerSize.width, containerSize.height);
    let frameId: number;
    
    const animate = () => {
      // Don't animate if the page isn't visible
      if (document.hidden) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      
      // Update positions for each profile
      const newPositions = positions.map((pos, i) => {
        if (i === hoverIndex || i === selectedIndex) {
          return pos; // Don't move hovered or selected profiles
        }
        
        // Update position based on velocity
        let x = pos.x + pos.vx;
        let y = pos.y + pos.vy;
        let vx = pos.vx;
        let vy = pos.vy;
        
        // Bounce off walls
        if (x < ANIMATION_CONFIG.BOUNDS_MARGIN || x > containerSize.width - ANIMATION_CONFIG.BOUNDS_MARGIN) {
          vx = -vx;
          // Ensure we're not stuck at the edge
          x = x < ANIMATION_CONFIG.BOUNDS_MARGIN 
            ? ANIMATION_CONFIG.BOUNDS_MARGIN 
            : containerSize.width - ANIMATION_CONFIG.BOUNDS_MARGIN;
        }
        
        if (y < ANIMATION_CONFIG.BOUNDS_MARGIN || y > containerSize.height - ANIMATION_CONFIG.BOUNDS_MARGIN) {
          vy = -vy;
          // Ensure we're not stuck at the edge
          y = y < ANIMATION_CONFIG.BOUNDS_MARGIN 
            ? ANIMATION_CONFIG.BOUNDS_MARGIN 
            : containerSize.height - ANIMATION_CONFIG.BOUNDS_MARGIN;
        }
        
        // Apply repulsion between profiles to avoid overlapping
        positions.forEach((otherPos, j) => {
          if (i !== j) {
            const dx = x - otherPos.x;
            const dy = y - otherPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ANIMATION_CONFIG.PROFILE_SIZE;
            
            if (distance < minDistance) {
              const angle = Math.atan2(dy, dx);
              const force = (minDistance - distance) / minDistance * 0.05;
              
              vx += Math.cos(angle) * force;
              vy += Math.sin(angle) * force;
              
              // Clamp velocity
              const speed = Math.sqrt(vx * vx + vy * vy);
              if (speed > ANIMATION_CONFIG.MAX_VELOCITY) {
                vx = (vx / speed) * ANIMATION_CONFIG.MAX_VELOCITY;
                vy = (vy / speed) * ANIMATION_CONFIG.MAX_VELOCITY;
              } else if (speed < ANIMATION_CONFIG.MIN_VELOCITY) {
                // Ensure minimum movement
                if (speed !== 0) {
                  vx = (vx / speed) * ANIMATION_CONFIG.MIN_VELOCITY;
                  vy = (vy / speed) * ANIMATION_CONFIG.MIN_VELOCITY;
                } else {
                  const randomAngle = Math.random() * Math.PI * 2;
                  vx = Math.cos(randomAngle) * ANIMATION_CONFIG.MIN_VELOCITY;
                  vy = Math.sin(randomAngle) * ANIMATION_CONFIG.MIN_VELOCITY;
                }
              }
            }
          }
        });
        
        // Slightly randomize movement for more natural effect
        if (Math.random() < 0.01) {
          vx += (Math.random() - 0.5) * 0.01;
          vy += (Math.random() - 0.5) * 0.01;
        }
        
        return { x, y, vx, vy, scale: pos.scale, rotation: pos.rotation };
      });
      
      // Update spring animations with new positions
      api.start((index) => ({
        x: newPositions[index].x,
        y: newPositions[index].y,
        scale: index === hoverIndex 
          ? ANIMATION_CONFIG.HOVER_SCALE 
          : newPositions[index].scale,
        rotation: index === hoverIndex 
          ? 0 
          : newPositions[index].rotation,
        zIndex: index === hoverIndex ? 20 : 10,
        config: ANIMATION_CONFIG.SPRING_CONFIG
      }));
      
      positions = newPositions;
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [api, hoverIndex, selectedIndex, containerSize, profiles.length]);
  
  const handleProfileHover = (index: number) => {
    setHoverIndex(index);
  };
  
  const handleProfileLeave = () => {
    setHoverIndex(null);
  };
  
  const handleProfileClick = (id: string, index: number) => {
    // Play click sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    }
    
    setSelectedIndex(index);
    
    // Navigate after a longer delay to allow sound to finish
    setTimeout(() => {
      navigate(`/pet/${id}`);
    }, 1200); // Increased from 500ms to 1200ms to let the sound finish
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[70vh] overflow-hidden bg-gradient-to-tr from-[#FFCACA]/20 via-[#D1F4FF]/10 to-[#FFFFD1]/20"
    >
      {/* Ambient background particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`pixel-${i}`}
          className="absolute rounded-full bg-white/20"
          style={{
            width: 2 + Math.random() * 6,
            height: 2 + Math.random() * 6,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
          }}
        />
      ))}
      
      {/* Pet profiles */}
      {profiles.length > 0 && springs.map((style, i) => {
        // Skip rendering if index is out of bounds
        if (i >= profiles.length) return null;
        
        const profile = profiles[i];
        const isNewlyCreated = profile.id === highlightProfileId;
        
        return (
          <animated.div
            key={profile.id || `profile-${i}`}
            className="absolute cursor-pointer"
            style={{
              ...style,
              touchAction: 'none',
              filter: `brightness(${isNewlyCreated || i === hoverIndex ? 1.4 : 1 + Math.random() * 0.2})`,
              padding: '15px', // Increase the interactive area around the profile
            }}
            onMouseEnter={() => handleProfileHover(i)}
            onMouseLeave={handleProfileLeave}
            onClick={() => handleProfileClick(profile.id || '', i)}
          >
            {/* Glow effect */}
            <div 
              className={`absolute inset-0 rounded-full blur-xl ${
                i === hoverIndex || isNewlyCreated ? 'bg-white/40' : 'bg-white/10'
              }`}
              style={{
                transform: 'scale(1.2)', // Increase the glow effect size to help with targeting
              }}
            />
            
            {/* New profile indicator */}
            {isNewlyCreated && (
              <div 
                className="absolute -top-4 -right-4 text-yellow-300"
                style={{
                  transform: "scale(1.2)"
                }}
              >
                <Star className="w-6 h-6 fill-yellow-300 filter drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]" />
              </div>
            )}
            
            <div className="relative flex flex-col items-center">
              {/* Profile image */}
              <div 
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 ${
                  i === hoverIndex
                    ? 'border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                    : 'border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                }`}
              >
                {profile.featured_media_url ? (
                  <img 
                    src={profile.featured_media_url}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-paradise-light/80 to-serenity-light/80 rounded-full">
                    <PawPrint size={32} className="text-white/90" />
                  </div>
                )}
              </div>
              
              {/* Profile name */}
              <div
                className={`mt-2 px-3 py-1 rounded-full backdrop-blur-md ${
                  i === hoverIndex 
                    ? 'bg-white/40 shadow-lg' 
                    : 'bg-white/20'
                }`}
              >
                <p className={`text-center text-sm font-medium ${
                  i === hoverIndex ? 'text-white' : 'text-white/90'
                } font-handwritten`}>
                  {profile.name}
                </p>
              </div>
            </div>
          </animated.div>
        );
      })}
    </div>
  );
};

export default FloatingPetProfiles; 