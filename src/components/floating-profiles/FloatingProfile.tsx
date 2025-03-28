import React from 'react';
import { animated } from '@react-spring/web';
import { PawPrint, Star } from 'lucide-react';
import { FloatingProfileProps } from './types';

/**
 * Individual floating profile component that displays a single pet profile
 * with optional comic box message
 */
const FloatingProfile: React.FC<FloatingProfileProps> = ({
    profile,
    style,
    index,
    isHovered,
    isPendingNav,
    isHighlighted,
    comicBoxState,
    responsiveSize,
    onPointerEnter,
    onPointerLeave,
    onClick
}) => {
    const showComicBox = comicBoxState?.visible && !isPendingNav;

    return (
        <animated.div
            key={profile.id || `profile-${index}`}
            className={`absolute cursor-pointer rounded-full ${isPendingNav ? 'opacity-70' : ''}`}
            style={{
                ...style,
                width: responsiveSize.baseSize * responsiveSize.renderScale,
                height: responsiveSize.baseSize * responsiveSize.renderScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: `brightness(${isHovered && !isPendingNav ? 1.3 : 1.0}) drop-shadow(0 4px 15px rgba(0,0,0,0.1))`,
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: isPendingNav ? 'none' : 'auto', // Disable clicks if pending
            }}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onClick={onClick}
            aria-label={`View profile for ${profile.name}`}
            data-profile-id={profile.id}
            data-index={index}
        >
            {/* Comic Box */}
            {showComicBox && (
                <div 
                    className="absolute min-w-[130px] max-w-[180px] p-3 rounded-xl bg-white/40 backdrop-blur-sm shadow-lg z-30"
                    style={{
                        top: '-85px', // Positioned higher above the profile
                        left: '45%', // Moved slightly to the left (was 50%)
                        transform: 'translateX(-50%)',
                        animation: 'comicBoxFadeIn 0.5s forwards',
                        border: '1px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 5px 10px -5px rgba(0,0,0,0.05), 0 0 15px rgba(255,255,255,0.4)'
                    }}
                >
                    {/* Comic tail - triangle pointing down */}
                    <div 
                        className="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px]"
                        style={{
                            bottom: '-10px',
                            left: '50%', // Keep centered to the box
                            transform: 'translateX(-50%)',
                            borderTopColor: 'rgba(255,255,255,0.4)'
                        }}
                    ></div>
                    <p className="text-center text-sm md:text-base font-handwritten text-purple-900 break-words font-medium">
                        {comicBoxState.message}
                    </p>
                </div>
            )}
            
            {/* Inner content */}
            <div className="relative flex flex-col items-center transition-transform duration-200 ease-out">
                <div className={`absolute inset-[-10px] rounded-full blur-lg transition-opacity duration-300 ${isHovered && !isPendingNav ? 'bg-white/30 opacity-100' : 'bg-white/10 opacity-70'}`} />
                
                {isHighlighted && !isHovered && !isPendingNav && (
                    <div className="absolute -top-3 -right-3 z-10 text-yellow-300 animate-pulse">
                        <Star className="w-5 h-5 fill-current filter drop-shadow-[0_0_5px_rgba(255,255,0,0.7)]" />
                    </div>
                )}
                
                <div 
                    className={`relative rounded-full overflow-hidden border-2 transition-all duration-300 ease-out ${isHovered && !isPendingNav ? 'border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/30 shadow-md'}`} 
                    style={{ 
                        width: responsiveSize.baseSize, 
                        height: responsiveSize.baseSize,
                        boxShadow: isHovered ? '0 0 25px rgba(255,255,255,0.5)' : '0 0 15px rgba(255,255,255,0.2)'
                    }}
                >
                    {profile.featured_media_url ? (
                        <img 
                            src={profile.featured_media_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            draggable="false"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-300/70 to-blue-300/70">
                            <PawPrint size={responsiveSize.baseSize * 0.4} className="text-white/80" />
                        </div>
                    )}
                </div>
                
                <div className={`mt-2 px-3 py-0.5 rounded-full backdrop-blur-sm transition-colors duration-300 ${isHovered && !isPendingNav ? 'bg-white/30 shadow-md' : 'bg-white/15'}`}>
                    <p className={`text-center text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${isHovered && !isPendingNav ? 'text-white' : 'text-white/85'} font-handwritten`}>
                        {profile.name}
                    </p>
                </div>
            </div>
        </animated.div>
    );
};

export default FloatingProfile; 