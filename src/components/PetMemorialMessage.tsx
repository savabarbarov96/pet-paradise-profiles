import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PetMemorialMessageProps {
    petName: string;
    onComplete?: () => void;
    profileId?: string;
    isDeceased?: boolean;
}

// Messages for living pets
const confirmationMessages = [
    (name: string) => `${name} зае специално място в Pet Paradise!`,
    (name: string) => `Успешно създадохте профил за ${name}!`,
    (name: string) => `${name} вече е част от общността на Pet Paradise!`,
    (name: string) => `Профилът на ${name} е готов за разглеждане!`,
    (name: string) => `${name} е добавен успешно към вашите любимци!`,
];

// Messages for deceased pets
const memorialMessages = [
    (name: string) => `Вашият приятел ${name} е на по-добро място...`,
    (name: string) => `${name} ще остане завинаги в нашите сърца...`,
    (name: string) => `Спомените за ${name} ще живеят вечно...`,
    (name: string) => `${name} сега тича във вечните поля...`,
    (name: string) => `Душата на ${name} е намерила покой...`,
];

const PetMemorialMessage: React.FC<PetMemorialMessageProps> = ({ 
    petName, 
    onComplete, 
    profileId,
    isDeceased = false 
}) => {
    const navigate = useNavigate();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const messages = isDeceased ? memorialMessages : confirmationMessages;

    useEffect(() => {
        // Initial fade in
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        // Start fade out
        const fadeOutTimer = setTimeout(() => {
            setIsLeaving(true);
        }, 4500);

        // Navigate after fade out
        const navigateTimer = setTimeout(() => {
            if (onComplete) {
                onComplete();
            } else if (profileId) {
                navigate(`/pet/${profileId}`);
            } else {
                navigate('/');
            }
        }, 5500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(navigateTimer);
        };
    }, [navigate, onComplete, profileId]);

    // Randomly select a message when component mounts
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setCurrentMessageIndex(randomIndex);
    }, [messages]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50"
        >
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-paradise to-paradise-light/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLeaving ? 0 : 0.95 }}
                transition={{ duration: 0.8 }}
            />
            
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                    opacity: isLeaving ? 0 : 1,
                    y: isLeaving ? -20 : 0,
                    scale: isLeaving ? 0.95 : 1
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative z-10 px-6 text-center max-w-3xl mx-auto"
            >
                <motion.p 
                    className="text-white font-handwritten text-3xl md:text-4xl lg:text-5xl leading-relaxed"
                    animate={{ 
                        textShadow: [
                            "0px 0px 8px rgba(255,255,255,0.5)",
                            "0px 0px 16px rgba(255,255,255,0.8)",
                            "0px 0px 8px rgba(255,255,255,0.5)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {messages[currentMessageIndex](petName)}
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default PetMemorialMessage; 