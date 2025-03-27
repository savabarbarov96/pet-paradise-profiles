import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumBackgroundProps {
  className?: string;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  className,
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    // Generate random particles for the starry effect
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 5
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden",
      className
    )}>
      {/* Premium dark gradient background - no image */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#090B1A] via-[#171D3B] to-[#0D1230]"
        style={{ opacity }}
      ></motion.div>
      
      {/* Parallax layers */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-[#2A0E61]/30 to-transparent"
        style={{ y: y1 }}
      ></motion.div>
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-bl from-[#4C0070]/20 to-transparent"
        style={{ y: y2 }}
      ></motion.div>
      
      {/* Animated particles (stars) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: 0.1 + Math.random() * 0.5,
          }}
          animate={{
            opacity: [
              0.1 + Math.random() * 0.2,
              0.3 + Math.random() * 0.5,
              0.1 + Math.random() * 0.2
            ],
            scale: [
              1,
              1.2 + Math.random() * 0.3,
              1
            ]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: particle.delay
          }}
        />
      ))}
      
      {/* Cosmic dust effect */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-soft-light"></div>
      
      {/* Ethereal glow spots */}
      <div className="absolute w-[30vw] h-[30vw] rounded-full bg-[#5E17EB]/10 blur-[80px] top-[20%] left-[15%] animate-float-slow"></div>
      <div className="absolute w-[25vw] h-[25vw] rounded-full bg-[#8A2BE2]/10 blur-[60px] bottom-[15%] right-[10%] animate-float-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute w-[15vw] h-[15vw] rounded-full bg-[#C724B1]/10 blur-[40px] top-[10%] right-[25%] animate-float-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50 opacity-60"></div>
    </div>
  );
};

export default PremiumBackground; 