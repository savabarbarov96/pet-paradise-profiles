import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  petName: string;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  petName,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-xl overflow-hidden",
      className
    )}>
      <div className="bg-paradise/50 backdrop-blur-sm px-4 py-3 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-white" />
          <h3 className="font-display font-medium text-white">
            Истории от Рая на {petName}
          </h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm max-w-[80%] ml-auto">
                <p className="text-gray-800">{message.content}</p>
              </div>
              <div className="mt-1 text-right">
                <span className="text-xs text-white/70 font-medium">
                  {format(message.timestamp, 'd MMMM, HH:mm', { locale: bg })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow; 