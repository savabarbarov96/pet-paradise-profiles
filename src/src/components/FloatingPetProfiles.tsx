import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PetProfile } from '@/services/petProfileService';
import { PawPrint, Star } from 'lucide-react';

interface FloatingPetProfilesProps {
  profiles: PetProfile[];
  highlightProfileId?: string | null;
}

const FloatingPetProfiles: React.FC<FloatingPetProfilesProps> = ({ profiles, highlightProfileId }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [renderKey, setRenderKey] = useState(0);
  
  // Use only the provided profiles
  const displayProfiles = profiles;

  // Force re-render when profiles change
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [profiles.length]);

  // Highlight newly created profile
  useEffect(() => {
    if (highlightProfileId) {
      // Find the profile and briefly highlight it
      const index = displayProfiles.findIndex(p => p.id === highlightProfileId);
      if (index >= 0) {
        // Briefly flash the profile
        setHoveredProfile(highlightProfileId);
        
        // Clear the highlight after 2 seconds
        const timer = setTimeout(() => {
          setHoveredProfile(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightProfileId, displayProfiles]);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const dimensions = {
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        };
        setContainerDimensions(dimensions);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Generate random positions for each profile - with wider distribution
  const getRandomPosition = (index: number) => {
    const baseDelay = index * 0.2;
    const xRandom = Math.random() * 0.9 - 0.45; // -45% to +45%
    const yRandom = Math.random() * 0.9 - 0.45; // -45% to +45%
    
    const position = {
      x: `${50 + xRandom * 100}%`,
      y: `${50 + yRandom * 100}%`,
      scale: 0.7 + Math.random() * 0.4, // 0.7 to 1.1
      rotate: -5 + Math.random() * 10, // -5 to +5 degrees
      delay: baseDelay,
    };

    return position;
  };

  const handleProfileClick = (id?: string, e?: React.MouseEvent) => {
    if (!id) return;
    
    // Store the click position for better animation
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setClickPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    setSelectedProfile(id);
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate(`/pet/${id}`);
    }, 700);
  };

  const handleProfileHover = (id?: string) => {
    if (!id) return;
    setHoveredProfile(id);
  };

  const handleProfileLeave = () => {
    setHoveredProfile(null);
  };

  // Calculate slight position shift based on mouse movement
  const getMouseInteraction = (x: string, y: string, id?: string) => {
    if (!containerRef.current || !id) return { x, y };
    
    // Only apply mouse interaction to hovered profile
    if (hoveredProfile !== id) return { x, y };
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // Calculate normalized mouse position (-1 to 1)
    const normalizedX = (mousePosition.x / containerWidth) * 2 - 1;
    const normalizedY = (mousePosition.y / containerHeight) * 2 - 1;
    
    // Apply subtle movement (max 20px)
    const moveX = normalizedX * 20;
    const moveY = normalizedY * 20;
    
    // Convert percentage positions to pixels
    const baseX = parseFloat(x) / 100 * containerWidth;
    const baseY = parseFloat(y) / 100 * containerHeight;
    
    // Add mouse-based movement
    return {
      x: `${((baseX + moveX) / containerWidth) * 100}%`,
      y: `${((baseY + moveY) / containerHeight) * 100}%`,
    };
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden border-2 border-dashed border-white/20 bg-white/5"
    >
      {/* Lighter, more cheerful background with atmospheric particles */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FFCACA]/40 via-[#D1F4FF]/30 to-[#FFFFD1]/40">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`pixel-${i}-${renderKey}`}
            className="absolute rounded-full bg-white/40"
            initial={{ 
              opacity: 0.3 + Math.random() * 0.4,
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 6,
              height: 2 + Math.random() * 6
            }}
            animate={{
              opacity: [
                0.3 + Math.random() * 0.4,
                0.4 + Math.random() * 0.5,
                0.3 + Math.random() * 0.4
              ],
              x: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`
              ],
              y: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`
              ]
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Add a flash effect when profile is clicked */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8, scale: 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute bg-white rounded-full w-10 h-10"
            style={{ 
              top: clickPosition.y, 
              left: clickPosition.x,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayProfiles.map((profile, index) => {
          const position = getRandomPosition(index);
          const isSelected = selectedProfile === profile.id;
          const isHovered = hoveredProfile === profile.id;
          const isNewlyCreated = profile.id === highlightProfileId;
          const mousePosition = getMouseInteraction(position.x, position.y, profile.id);
          
          return (
            <motion.div
              key={`${profile.id}-${renderKey}`}
              className={`absolute cursor-pointer z-20`}
              initial={{ 
                opacity: 0,
                x: isNewlyCreated ? "50%" : position.x,
                y: isNewlyCreated ? "50%" : position.y,
                scale: isNewlyCreated ? 2 : position.scale,
                rotate: position.rotate
              }}
              animate={{ 
                opacity: isSelected ? 0 : 1,
                x: isSelected ? "50%" : isHovered ? mousePosition.x : [
                  position.x,
                  `calc(${position.x} + ${20 + Math.random() * 15}px)`,
                  `calc(${position.x} - ${10 + Math.random() * 15}px)`,
                  position.x
                ],
                y: isSelected ? "40%" : isHovered ? mousePosition.y : [
                  position.y,
                  `calc(${position.y} - ${15 + Math.random() * 10}px)`,
                  `calc(${position.y} + ${20 + Math.random() * 15}px)`,
                  position.y
                ],
                scale: isSelected ? 2.5 : isHovered ? position.scale * 1.2 : [
                  position.scale, 
                  position.scale * (1 + Math.random() * 0.08), 
                  position.scale * (1 - Math.random() * 0.05), 
                  position.scale
                ],
                rotate: isSelected ? 0 : isHovered ? position.rotate : [
                  position.rotate, 
                  position.rotate + (1 + Math.random() * 2), 
                  position.rotate - (1 + Math.random() * 1), 
                  position.rotate
                ]
              }}
              transition={{
                delay: isSelected ? 0 : isNewlyCreated ? 0 : position.delay,
                duration: isSelected ? 0.7 : isHovered ? 0.2 : 15 + Math.random() * 10,
                repeat: isSelected || isHovered ? 0 : Infinity,
                repeatType: "reverse",
                ease: isHovered ? "easeOut" : "easeInOut"
              }}
              whileHover={{ 
                zIndex: 50,
                transition: { duration: 0.3 }
              }}
              onClick={(e) => handleProfileClick(profile.id, e as React.MouseEvent)}
              onMouseEnter={() => handleProfileHover(profile.id)}
              onMouseLeave={handleProfileLeave}
              style={{ 
                transformOrigin: 'center',
                filter: `brightness(${isHovered || isNewlyCreated ? 1.4 : 1 + Math.random() * 0.2})`,
                zIndex: isNewlyCreated ? 30 : 20
              }}
            >
              {/* Enhanced wisp-like glow effect - with special effects for new profiles */}
              <motion.div 
                className={`absolute inset-0 rounded-full blur-xl ${isHovered || isNewlyCreated ? 'bg-white/60' : 'bg-white/20'}`}
                initial={false}
                animate={{
                  scale: isHovered || isNewlyCreated ? [1.1, 1.3, 1.2] : [1, 1.1, 1.05, 1],
                  opacity: isHovered || isNewlyCreated ? [0.6, 0.8, 0.7] : [0.4, 0.6, 0.5, 0.4],
                  boxShadow: isHovered || isNewlyCreated
                    ? [
                        '0 0 15px 8px rgba(255, 255, 255, 0.5)', 
                        '0 0 25px 15px rgba(255, 255, 255, 0.6)', 
                        '0 0 20px 12px rgba(255, 255, 255, 0.55)'
                      ]
                    : [
                        '0 0 10px 5px rgba(255, 255, 255, 0.3)',
                        '0 0 15px 8px rgba(255, 255, 255, 0.4)',
                        '0 0 12px 6px rgba(255, 255, 255, 0.35)',
                        '0 0 10px 5px rgba(255, 255, 255, 0.3)'
                      ]
                }}
                transition={{
                  duration: isHovered ? 1.5 : isNewlyCreated ? 1 : 3 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              {/* Additional sparkle effect for new profiles */}
              {isNewlyCreated && (
                <motion.div 
                  className="absolute -top-4 -right-4 text-yellow-300"
                  initial={{ opacity: 0, rotate: -45, scale: 0 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1.2 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "backOut",
                    repeat: 5,
                    repeatType: "reverse"
                  }}
                >
                  <Star className="w-6 h-6 fill-yellow-300 filter drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]" />
                </motion.div>
              )}
              
              <div className="relative flex flex-col items-center">
                {/* Premium halo/vortex effect around the profile */}
                {isHovered && (
                  <motion.div 
                    className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: `conic-gradient(from ${Date.now() % 360}deg at 50% 50%, 
                                  rgba(255, 202, 202, 0.4), 
                                  rgba(209, 244, 255, 0.4), 
                                  rgba(255, 255, 209, 0.4), 
                                  rgba(255, 202, 202, 0.4))`,
                      filter: 'blur(12px)',
                      animationName: 'spin',
                      animationDuration: '8s',
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'linear'
                    }}
                  />
                )}
                
                {/* Profile image in circle with enhanced glow effect */}
                <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 ${isHovered ? 'border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>
                  {profile.featured_media_url ? (
                    <img 
                      src={profile.featured_media_url}
                      alt={profile.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFD1DC]/90 to-[#D1F4FF]/90 rounded-full">
                      <PawPrint size={40} className="text-white/90" />
                    </div>
                  )}
                  
                  {/* Animated radial glow */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  ></motion.div>
                </div>
                
                {/* Name with backdrop blur - always visible */}
                <motion.div 
                  className={`mt-3 px-4 py-1 rounded-full backdrop-blur-md ${isHovered ? 'bg-white/40' : 'bg-white/20'}`}
                  animate={{
                    y: isHovered ? 0 : [0, -5, 0],
                    scale: isHovered ? 1.1 : 1
                  }}
                  transition={{
                    duration: isHovered ? 0.2 : 2,
                    repeat: isHovered ? 0 : Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <p className={`text-center font-medium ${isHovered ? 'text-white' : 'text-white/90'}`}>
                    {profile.name}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FloatingPetProfiles; 