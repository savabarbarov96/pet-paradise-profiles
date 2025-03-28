import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import './candle.css';

interface CandleLightingProps {
  petName: string;
  petId: string;
}

interface Candle {
  id: number | string;
  name: string;
  message?: string;
}

const CandleLighting: React.FC<CandleLightingProps> = ({ petName, petId }) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [message, setMessage] = useState('');
  const [isLighting, setIsLighting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load candles from database on component mount
  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setIsLoading(true);
        // Try to fetch from pet_tributes table with a type field or dedicated pet_candles table
        const { data, error } = await supabase
          .from('pet_tributes')
          .select('id, author_name, message')
          .eq('pet_id', petId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching candles:", error);
          // Fallback to localStorage if database fetch fails
          const savedCandles = localStorage.getItem(`candles-${petName}`);
          if (savedCandles) {
            try {
              setCandles(JSON.parse(savedCandles));
            } catch (e) {
              console.error("Error parsing saved candles:", e);
            }
          }
        } else {
          // Map database entries to candle format
          const mappedCandles = data.map(item => ({
            id: item.id,
            name: item.author_name,
            message: item.message
          }));
          setCandles(mappedCandles);
        }
      } catch (err) {
        console.error("Error fetching candles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchCandles();
    }
  }, [petId, petName]);

  const handleLightCandle = async () => {
    if (!visitorName) return;
    
    setIsLighting(true);
    
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Save to database
      const { data, error } = await supabase
        .from('pet_tributes')
        .insert([
          {
            pet_id: petId,
            author_name: visitorName,
            message: message || null,
            user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000' // Add guest_user_id if user is not logged in
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error("Error saving candle to database:", error);
        // Fallback to localStorage
        const newCandleLocal = {
          id: Date.now(),
          name: visitorName,
          message: message || undefined
        };
        
        const updatedCandles = [...candles, newCandleLocal];
        setCandles(updatedCandles);
        localStorage.setItem(`candles-${petName}`, JSON.stringify(updatedCandles));
      } else {
        // Add the new candle to state
        const newCandle = {
          id: data.id,
          name: visitorName,
          message: message || undefined
        };
        
        setCandles(prev => [...prev, newCandle]);
      }
      
      // Reset form
      setVisitorName('');
      setMessage('');
      setShowForm(false);
    } catch (err) {
      console.error("Error lighting candle:", err);
    } finally {
      setIsLighting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        {isLoading ? (
          <p className="text-white/70 text-center w-full">Зареждане на свещи...</p>
        ) : candles.length === 0 ? (
          <p className="text-white/70 text-center w-full italic">Все още няма запалени свещи. Бъдете първият, който ще почете паметта.</p>
        ) : (
          candles.map(candle => (
            <div key={candle.id} className="relative">
              {/* Candle Base */}
              <div className="w-16 h-32 flex flex-col items-center">
                <div className="candle-flame-container">
                  {/* Flame outer glow */}
                  <div className="absolute w-6 h-10 bg-amber-300/20 rounded-full blur-md animate-pulse"></div>
                  
                  {/* Main flame */}
                  <motion.div
                    className="candle-flame w-4 h-8 bg-gradient-to-t from-amber-400 to-amber-200 rounded-full"
                    animate={{
                      height: ['32px', '28px', '30px', '32px'],
                      width: ['16px', '14px', '15px', '16px']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  ></motion.div>
                  
                  {/* Inner flame */}
                  <motion.div
                    className="candle-inner-flame w-2 h-4 bg-white/80 rounded-full absolute top-1 left-1/2 transform -translate-x-1/2"
                    animate={{
                      height: ['16px', '14px', '15px', '16px']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  ></motion.div>
                </div>
                
                {/* Candle body */}
                <div className="candle-body w-6 h-20 bg-gradient-to-b from-amber-50 to-amber-100 rounded-md mt-1 relative overflow-hidden">
                  {/* Candle "dripping" effect */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-amber-50 rounded-t-md"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-amber-50 rounded-bl-full"></div>
                </div>
                
                {/* Candle base */}
                <div className="candle-base w-8 h-2 bg-amber-200 rounded-md"></div>
              </div>
              
              {/* Name label */}
              <div className="text-center mt-2 text-xs text-white/80">
                {candle.name}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex justify-center mt-6">
        {showForm ? (
          <div className="bg-white/5 p-4 rounded-lg w-full max-w-md border border-white/10">
            <div className="space-y-4">
              <div>
                <label htmlFor="visitor-name" className="block text-sm text-white/90 mb-1">
                  Вашето име *
                </label>
                <input
                  id="visitor-name"
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/40"
                  placeholder="Въведете вашето име"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm text-white/90 mb-1">
                  Съобщение (по желание)
                </label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/40"
                  placeholder="Добавете кратък спомен или пожелание"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Отказ
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2"
                  disabled={!visitorName || isLighting}
                  onClick={handleLightCandle}
                >
                  {isLighting ? (
                    <>Зареждане...</>
                  ) : (
                    <>
                      <Flame className="h-4 w-4" />
                      Запали свещ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            className="bg-amber-500 hover:bg-amber-600 flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Flame className="h-4 w-4" />
            Запали свещ за {petName}
          </Button>
        )}
      </div>
      
      {/* Messages Preview */}
      <AnimatePresence>
        {candles.filter(c => c.message).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 mt-6"
          >
            <h3 className="text-white font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-amber-400" />
              Съобщения за помен
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {candles
                .filter(c => c.message)
                .map(candle => (
                  <motion.div
                    key={candle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 p-3 rounded-md border border-white/10"
                  >
                    <p className="text-white/90 text-sm">{candle.message}</p>
                    <p className="text-white/60 text-xs mt-1">— {candle.name}</p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandleLighting;