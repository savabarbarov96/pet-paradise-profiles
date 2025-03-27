import React, { useState, useEffect } from 'react';
import { fetchTributes, addTribute, Tribute } from '@/services/tributeService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';

interface TributesProps {
  petId: string;
  petName: string;
  showAll?: boolean;
}

const Tributes: React.FC<TributesProps> = ({ petId, petName, showAll = false }) => {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadTributes = async () => {
      setLoading(true);
      const tributesData = await fetchTributes(petId);
      setTributes(tributesData);
      setLoading(false);
    };

    loadTributes();
  }, [petId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Моля, въведете съобщение');
      return;
    }
    
    if (!authorName.trim()) {
      toast.error('Моля, въведете вашето име');
      return;
    }
    
    setSubmitting(true);
    
    const tribute: Tribute = {
      pet_id: petId,
      message: message.trim(),
      author_name: authorName.trim()
    };
    
    const { success, error } = await addTribute(tribute);
    
    if (success) {
      toast.success('Трибютът е добавен успешно');
      setMessage('');
      
      // Refresh tributes list
      const updatedTributes = await fetchTributes(petId);
      setTributes(updatedTributes);
    } else {
      toast.error(`Грешка при добавяне на трибют: ${error}`);
    }
    
    setSubmitting(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const isRecent = new Date().getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (isRecent) {
      return formatDistanceToNow(date, { addSuffix: true, locale: bg });
    } else {
      return format(date, 'dd MMM yyyy', { locale: bg });
    }
  };

  // Display only a limited number of tributes if not showing all
  const visibleTributes = showAll ? tributes : tributes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-white font-handwritten">
          <MessageCircle className="inline-block mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Трибюти & Спомени
        </h2>
        <span className="text-sm text-white/80">{tributes.length} трибюта</span>
      </div>

      <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg text-white font-handwritten">Споделете вашия спомен</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 px-3 sm:px-6">
            <div>
              <Textarea 
                placeholder={`Споделете спомен или съобщение за ${petName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-white text-sm sm:text-base"
              />
            </div>
            <div>
              <Input 
                placeholder="Вашето име"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-white text-sm sm:text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/10 bg-white/5 px-3 sm:px-6 py-2 sm:py-3">
            <Button 
              type="submit" 
              disabled={submitting}
              className="ml-auto bg-paradise hover:bg-paradise-dark text-white font-handwritten text-sm sm:text-base"
            >
              <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {submitting ? 'Изпращане...' : 'Споделете трибют'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : visibleTributes.length === 0 ? (
        <Card className="border-dashed border-white/30 bg-white/5 backdrop-blur-sm">
          <CardContent className="py-6 sm:py-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-white/50 mb-3 sm:mb-4" />
            <p className="text-white/80 font-handwritten text-sm sm:text-base">
              Все още няма трибюти. Бъдете първият, който ще сподели спомен за {petName}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {visibleTributes.map((tribute) => (
            <Card key={tribute.id} className="overflow-hidden border-white/20 bg-white/10 backdrop-blur-sm">
              <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white font-handwritten">{tribute.author_name}</h3>
                  <span className="text-xs text-white/70">
                    {formatDate(tribute.created_at)}
                  </span>
                </div>
                <p className="text-white/90 text-sm sm:text-base">{tribute.message}</p>
              </CardContent>
              <CardFooter className="bg-white/5 px-3 sm:px-6 py-1.5 sm:py-2 border-t border-white/10">
                <div className="flex items-center text-xs sm:text-sm text-white/70">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-paradise-light" />
                  <span className="font-handwritten">С любов</span>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {!showAll && tributes.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-white/70 text-xs sm:text-sm font-handwritten">
                Показани са 3 от {tributes.length} трибюта
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tributes; 