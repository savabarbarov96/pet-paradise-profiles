import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Mail, 
  Link as LinkIcon, 
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SharingToolsProps {
  petName: string;
  petId: string;
}

const SharingTools: React.FC<SharingToolsProps> = ({ petName, petId }) => {
  const [showLinks, setShowLinks] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const profileUrl = window.location.href;
  
  const shareText = `Visit ${petName}'s memorial in Pet Paradise`;
  
  // Social media share links
  const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`;
  const twitterShareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
  const emailShareLink = `mailto:?subject=${encodeURIComponent(`${petName}'s Pet Paradise Memorial`)}&body=${encodeURIComponent(`I wanted to share ${petName}'s memorial with you: ${profileUrl}`)}`;
  
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      
      // Reset copy indicator after 3 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={() => setShowLinks(!showLinks)}
        variant="outline"
        className="w-full justify-between items-center border-paradise-light/30 hover:bg-paradise-light/10 hover:text-paradise-dark"
      >
        <div className="flex items-center">
          <Share2 className="mr-2 h-4 w-4 text-paradise" />
          <span>Share {petName}'s Paradise</span>
        </div>
        <span className="text-xs bg-paradise-light/20 px-2 py-0.5 rounded-full text-paradise-dark">
          Spread Love
        </span>
      </Button>
      
      {showLinks && (
        <Card className="overflow-hidden border-paradise-light/20 bg-white/90 backdrop-blur-sm shadow-soft">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <a 
                href={facebookShareLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Facebook className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs text-blue-700">Facebook</span>
              </a>
              
              <a 
                href={twitterShareLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <Twitter className="h-6 w-6 text-sky-500 mb-1" />
                <span className="text-xs text-sky-700">Twitter</span>
              </a>
              
              <a 
                href={emailShareLink}
                className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Mail className="h-6 w-6 text-amber-600 mb-1" />
                <span className="text-xs text-amber-700">Email</span>
              </a>
            </div>
            
            <div className="relative">
              <Input 
                readOnly
                value={profileUrl}
                className="pr-12 border-paradise-light/20 bg-paradise-light/5 text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={copyLinkToClipboard}
                className="absolute right-0 top-0 bottom-0 text-paradise-dark hover:text-paradise hover:bg-transparent"
              >
                {linkCopied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Share {petName}'s memorial with friends and family to celebrate their life
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharingTools; 