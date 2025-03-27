import React from 'react';
import { cn } from '@/lib/utils';

interface BackgroundProps {
  className?: string;
}

export const BackgroundSlideshow: React.FC<BackgroundProps> = ({
  className,
}) => {
  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden",
      className
    )}>
      {/* Bright gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-paradise-light/80 to-serenity-light/70 z-0"></div>
      
      {/* Subtle radial overlay for depth */}
      <div className="absolute inset-0 bg-radial-overlay z-10 opacity-20"></div>
      
      {/* Enhanced light particles effect - increased opacity */}
      <div className="absolute inset-0 z-5 bg-[url('/images/light-particles.png')] bg-repeat opacity-40"></div>
    </div>
  );
};

export default BackgroundSlideshow; 