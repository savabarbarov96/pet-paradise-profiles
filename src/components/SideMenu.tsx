import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserPetProfiles } from '@/services/petProfileService';
import { Button } from '@/components/ui/button';
import { 
  Bell, Menu, X, Settings, Heart, User, LogOut, 
  ChevronRight, Home, Mail
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import { PetProfile } from '@/services/petProfileService';
import { cn } from '@/lib/utils';

// Use custom paw icon since Lucide doesn't have one
const PawIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    width={size || 24}
    height={size || 24}
    className={className}
  >
    <path d="M12.83 9c1.74-2.35 3.99-3.14 4.77-1.86.78 1.28-.55 3.8-2.96 5.59-1.33.99-3.01 1.59-4.64 1.58-1.63 0-3.31-.59-4.64-1.58-2.41-1.79-3.74-4.31-2.96-5.59.78-1.28 3.03-.49 4.77 1.86" />
    <path d="M9 14c-1.1 1.15-1.55 2.3-1 4 .83 2.5 4.18 2.5 5 0 .55-1.7.1-2.85-1-4" />
  </svg>
);

const SideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'notifications' | 'pets'>('home');
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetProfiles = async () => {
      try {
        setIsLoading(true);
        const result = await getUserPetProfiles();
        if (result.success && result.data) {
          setPetProfiles(result.data);
        }
      } catch (error) {
        console.error("Error fetching pet profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetProfiles();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/auth');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSectionChange = (section: 'home' | 'notifications' | 'pets') => {
    setActiveSection(section);
    
    // Navigate to home page when home section is selected
    if (section === 'home') {
      navigate('/');
    }
  };

  const navigateToPetProfile = (id: string) => {
    navigate(`/pet/${id}`);
    setIsOpen(false);
  };

  // When user clicks outside the menu on mobile, close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('side-menu');
      const toggle = document.getElementById('menu-toggle');
      
      if (isOpen && sidebar && !sidebar.contains(target) && toggle && !toggle.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        id="menu-toggle"
        className="fixed z-50 top-4 left-4 md:hidden bg-paradise/80 hover:bg-paradise text-white p-2 rounded-full shadow-lg transition-all duration-300"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Side menu */}
      <div 
        id="side-menu"
        className={cn(
          "fixed z-40 inset-y-0 left-0 transform md:translate-x-0 transition-all duration-300 ease-in-out",
          "bg-white bg-opacity-90 backdrop-blur-md shadow-xl",
          "flex flex-col w-64 min-h-screen",
          "overflow-hidden border-r border-serenity/30",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header - Logo and user info */}
        <div className="p-4 bg-gradient-to-r from-paradise/20 to-serenity/20 border-b border-serenity/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-paradise">Pet Paradise</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
            >
              <X size={20} />
            </Button>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[180px]">{user.email}</span>
            </div>
          )}
        </div>

        {/* Navigation sections */}
        <nav className="flex flex-col gap-1 p-2">
          <Button
            variant={activeSection === 'home' ? "default" : "ghost"}
            className={cn(
              "justify-start gap-2 transition-all font-handwritten text-bulgarian",
              activeSection === 'home' ? "bg-paradise text-white" : "hover:bg-paradise/10"
            )}
            onClick={() => handleSectionChange('home')}
          >
            <Home size={18} />
            <span>Начало</span>
          </Button>
          
          <Button
            variant={activeSection === 'notifications' ? "default" : "ghost"}
            className={cn(
              "justify-start gap-2 transition-all font-handwritten text-bulgarian",
              activeSection === 'notifications' ? "bg-paradise text-white" : "hover:bg-paradise/10"
            )}
            onClick={() => handleSectionChange('notifications')}
          >
            <Bell size={18} />
            <span>Настройки за известия</span>
          </Button>

          <Button
            variant={activeSection === 'pets' ? "default" : "ghost"}
            className={cn(
              "justify-start gap-2 transition-all font-handwritten text-bulgarian",
              activeSection === 'pets' ? "bg-paradise text-white" : "hover:bg-paradise/10"
            )}
            onClick={() => handleSectionChange('pets')}
          >
            <PawIcon size={18} />
            <span>Моите любимци</span>
          </Button>
        </nav>

        {/* Content based on active section */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === 'home' && (
            <div className="space-y-4">
              <h3 className="font-medium text-paradise text-bulgarian">Добре дошли в Рай за Домашни Любимци</h3>
              <p className="text-sm text-muted-foreground text-bulgarian">
                Създайте и управлявайте мемориални профили за вашите любими домашни любимци.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-paradise/50 text-paradise hover:bg-paradise/10 text-bulgarian"
                  onClick={() => navigate('/')}
                >
                  <Heart size={16} />
                  Създайте нов профил
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-paradise/50 text-paradise hover:bg-paradise/10 text-bulgarian"
                  onClick={() => navigate('/profiles')}
                >
                  <PawIcon size={16} />
                  Управление на профили
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && <NotificationSettings />}

          {activeSection === 'pets' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-paradise">Вашите профили на домашни любимци</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-paradise/30 text-paradise hover:bg-paradise/10"
                  onClick={() => navigate('/profiles')}
                >
                  Управление
                </Button>
              </div>
              {isLoading ? (
                <div className="py-6 text-center text-muted-foreground text-sm">Зареждане...</div>
              ) : petProfiles.length > 0 ? (
                <ul className="space-y-2">
                  {petProfiles.map((pet) => (
                    <li key={pet.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-paradise/10 group px-3 py-2 h-auto"
                        onClick={() => pet.id && navigateToPetProfile(pet.id)}
                      >
                        <div className="flex items-center gap-3">
                          {pet.featured_media_url ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-paradise/30">
                              <img
                                src={pet.featured_media_url}
                                alt={pet.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-paradise/20 flex items-center justify-center">
                              <PawIcon size={18} className="text-paradise" />
                            </div>
                          )}
                          <span className="font-medium">{pet.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-6 text-center text-muted-foreground border border-dashed rounded-lg">
                  <PawIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No pet profiles yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/')} 
                    className="text-paradise mt-2"
                  >
                    Create your first profile
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with sign out button */}
        <div className="p-4 border-t border-serenity/30 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 hover:bg-paradise/10 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default SideMenu; 