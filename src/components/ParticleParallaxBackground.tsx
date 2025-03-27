import React, { useCallback, useEffect, useState } from 'react';
import { Parallax } from 'react-parallax';
import Particles from 'react-tsparticles';
import type { Container, Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

interface ParticleParallaxBackgroundProps {
  children: React.ReactNode;
}

const ParticleParallaxBackground: React.FC<ParticleParallaxBackgroundProps> = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log(container);
  }, []);

  // Calculate parallax offsets based on scroll with performance optimizations
  const layer1Transform = `translateY(${Math.round(scrollY * 0.1)}px)`;
  const layer2Transform = `translateY(${Math.round(scrollY * -0.05)}px)`;
  const layer3Transform = `translateY(${Math.round(scrollY * 0.08)}px)`;

  return (
    <Parallax
      bgImage=""
      strength={300}
      bgClassName="bg-transparent"
      className="min-h-screen w-full"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Premium dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090B1F] via-[#171D3B] to-[#0D1235]"></div>
        
        {/* Additional gradient layers for depth with parallax effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#2A0E61]/30 to-transparent"
          style={{ transform: layer1Transform, transition: 'transform 0.1s ease-out' }}
        ></div>
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-[#4C0070]/20 to-transparent"
          style={{ transform: layer2Transform, transition: 'transform 0.1s ease-out' }}
        ></div>
        
        {/* Premium ethereal glow spots with parallax effect */}
        <div 
          className="absolute w-[30vw] h-[30vw] rounded-full bg-paradise-dark/15 blur-[100px] top-[20%] left-[15%] animate-float-slow"
          style={{ transform: layer3Transform, transition: 'transform 0.1s ease-out' }}
        ></div>
        <div 
          className="absolute w-[25vw] h-[25vw] rounded-full bg-serenity-dark/15 blur-[80px] bottom-[15%] right-[10%] animate-float-slow"
          style={{ animationDelay: '2s', transform: layer1Transform, transition: 'transform 0.1s ease-out' }}
        ></div>
        <div 
          className="absolute w-[15vw] h-[15vw] rounded-full bg-[#C724B1]/15 blur-[60px] top-[10%] right-[25%] animate-float-slow"
          style={{ animationDelay: '4s', transform: layer2Transform, transition: 'transform 0.1s ease-out' }}
        ></div>
        
        {/* Additional serene elements */}
        <div className="absolute w-full h-[30vh] bottom-0 bg-gradient-to-t from-[#0A0A20]/50 to-transparent"></div>
        
        {/* Subtle starlight effect */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '150px 150px',
            backgroundPosition: '0 0, 75px 75px'
          }}
        ></div>
        
        {/* Enhanced subtle vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 opacity-60"></div>
        
        {/* Premium particles effect */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          className="absolute inset-0"
          options={{
            fullScreen: {
              enable: false
            },
            fpsLimit: 60,
            particles: {
              color: {
                value: ["#ffffff", "#FFD700", "#E6E6FA", "#B1A3FF", "#93B7E8"],
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.03,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "out",
                },
                random: true,
                speed: 0.2,
                straight: false,
                path: {
                  enable: true,
                  delay: {
                    value: 0.1
                  },
                  options: {
                    size: 5,
                    draw: false,
                    increment: 0.001
                  }
                },
              },
              number: {
                density: {
                  enable: true,
                  area: 1200,
                },
                value: 40,
                limit: 60
              },
              opacity: {
                value: 0.12,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.15,
                  opacity_min: 0.03,
                  sync: false
                }
              },
              shape: {
                type: ["circle", "triangle", "star"],
              },
              size: {
                value: { min: 1, max: 3 },
                random: true,
                anim: {
                  enable: true,
                  speed: 0.8,
                  size_min: 0.1,
                  sync: false
                }
              },
              twinkle: {
                lines: {
                  enable: true,
                  frequency: 0.03,
                  opacity: 0.2
                },
                particles: {
                  enable: true,
                  frequency: 0.03,
                  opacity: 0.2
                }
              }
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "bubble"
                }
              },
              modes: {
                bubble: {
                  distance: 150,
                  duration: 2,
                  size: 5,
                  opacity: 0.3
                }
              }
            },
            detectRetina: true,
            smooth: true
          }}
        />
      </div>
      
      {/* Content with optimized parallax effect */}
      <div 
        className="relative z-10 w-full"
        style={{ transform: `translateY(${Math.round(scrollY * 0.015)}px)`, transition: 'transform 0.05s ease-out' }}
      >
        {children}
      </div>
    </Parallax>
  );
};

export default ParticleParallaxBackground; 