
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-white/70 backdrop-blur-sm shadow-soft py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-paradise font-display text-xl font-medium">Pet Paradise</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground hidden sm:block">
              <User className="h-4 w-4 inline mr-1" />
              {user.email}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
