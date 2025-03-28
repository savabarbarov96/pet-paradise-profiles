import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserPetProfiles } from '@/services/petProfileService';
import { Button } from '@/components/ui/button';
import {
  Bell, Menu, X, Settings, Heart, User, LogOut,
  ChevronRight, Home, Mail, PanelLeftClose, PanelLeftOpen,
  Plus, List, PartyPopper
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import { PetProfile } from '@/services/petProfileService';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator";

// PawIcon component remains the same...
const PawIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12.83 9c1.74-2.35 3.99-3.14 4.77-1.86.78 1.28-.55 3.8-2.96 5.59-1.33.99-3.01 1.59-4.64 1.58-1.63 0-3.31-.59-4.64-1.58-2.41-1.79-3.74-4.31-2.96-5.59.78-1.28 3.03-.49 4.77 1.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 14c-1.1 1.15-1.55 2.3-1 4 .83 2.5 4.18 2.5 5 0 .55-1.7.1-2.85-1-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SectionType = 'home' | 'notifications' | 'pets' | 'profiles' | 'paradise' | 'create';

const SideMenu: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveSection('home');
    } else if (path === '/profiles') {
      setActiveSection('profiles');
    } else if (path === '/paradise') {
      setActiveSection('paradise');
    } else if (path === '/create-profile') {
      setActiveSection('create');
    } else if (path.startsWith('/pet/')) {
      setActiveSection('pets');
    }
  }, [location.pathname]);

  // useEffect for fetching pet profiles remains the same...
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

    if (user) {
        fetchPetProfiles();
    } else {
        setIsLoading(false);
        setPetProfiles([]);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileOpen(false);
    setIsDesktopCollapsed(false);
    navigate('/auth');
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
    if (section === 'home') {
      navigate('/');
    } else if (section === 'profiles') {
      navigate('/profiles');
    } else if (section === 'paradise') {
      navigate('/paradise');
    } else if (section === 'create') {
      navigate('/create-profile');
    } else if (section === 'pets' && petProfiles.length > 0 && petProfiles[0].id) {
      navigate(`/pet/${petProfiles[0].id}`);
    }
    
    if (isMobileOpen) {
        setIsMobileOpen(false);
    }
  };

  const navigateToPetProfile = (id: string) => {
    navigate(`/pet/${id}`);
    if (isMobileOpen) {
        setIsMobileOpen(false);
    }
  };

  // useEffect for click outside remains the same...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('side-menu');
      const toggle = document.getElementById('mobile-menu-toggle');

      if (isMobileOpen && sidebar && !sidebar.contains(target) && toggle && !toggle.contains(target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  const sidebarClasses = cn(
    "fixed z-40 inset-y-0 left-0",
    "flex flex-col", // Ensures flex column layout
    "bg-gradient-to-b from-white/95 via-white/95 to-gray-100/95 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-800/95",
    "backdrop-blur-lg", // Keep the blur effect
    "border-r border-gray-200/80 dark:border-gray-700/80", // Adjusted border color
    "shadow-xl",
    "transition-all duration-300 ease-in-out",
    // Mobile specific transition and visibility
    isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72",
    // Desktop specific transition and width - overrides mobile translate
    "md:translate-x-0",
    isDesktopCollapsed ? "md:w-20" : "md:w-72"
  );

  const navItemClasses = (isActive: boolean) => cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-paradise text-white" // Active state
      : "text-gray-700 dark:text-gray-300 hover:bg-paradise/10 hover:text-paradise dark:hover:bg-paradise/20", // Default & Hover
    // Adjust padding and justification for collapsed state
    isDesktopCollapsed ? "justify-center" : "justify-start"
  );

  const petsGroupClasses = cn(
    "w-full",
    "transition-all duration-200",
    activeSection === 'pets' ? "bg-paradise/10 rounded-md" : ""
  );

  const navIconSize = 18;

  return (
    <TooltipProvider delayDuration={100}>
      {/* Mobile menu toggle button */}
       <button
        id="mobile-menu-toggle"
        className="fixed z-50 top-4 left-4 md:hidden bg-paradise/80 hover:bg-paradise text-white p-2 rounded-full shadow-lg transition-all duration-300"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Side menu container */}
      <div id="side-menu" className={sidebarClasses}>

        {/* Header */}
        <div className={cn(
            "flex items-center justify-between px-4 h-16 border-b border-gray-200/80 dark:border-gray-700/80 shrink-0", // Match border color
            isDesktopCollapsed ? "px-0 justify-center" : "px-4"
        )}>
           {/* Logo/Title */}
           <h2 className={cn(
              "text-xl font-display text-paradise font-medium", // Keep paradise color for brand
              isDesktopCollapsed && "md:hidden"
           )}>
             Pet Paradise
           </h2>
           {isDesktopCollapsed && (
             <PawIcon size={28} className="text-paradise hidden md:block"/>
           )}
           {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-500 dark:text-gray-400" // Adjusted color
            onClick={toggleMobileMenu}
          >
            <X size={20} />
          </Button>
        </div>

         {/* User Info (conditionally shown) */}
         {!isDesktopCollapsed && user && (
          <div className="p-4 border-b border-gray-200/80 dark:border-gray-700/80"> {/* Match border color */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"> {/* Adjusted text color */}
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate" title={user.email}>{user.email}</span>
            </div>
          </div>
         )}

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {/* Home */}
          <Tooltip>
             <TooltipTrigger asChild>
               <button className={cn(navItemClasses(activeSection === 'home'), "w-full")} onClick={() => handleSectionChange('home')}>
                 <Home size={navIconSize} className="shrink-0"/>
                 {!isDesktopCollapsed && <span className="text-sm">Pet Paradise</span>}
               </button>
             </TooltipTrigger>
             {isDesktopCollapsed && <TooltipContent side="right">Pet Paradise</TooltipContent>}
          </Tooltip>

          {/* Create Profile */}
          <Tooltip>
             <TooltipTrigger asChild>
               <button className={cn(navItemClasses(activeSection === 'create'), "w-full")} onClick={() => handleSectionChange('create')}>
                 <Plus size={navIconSize} className="shrink-0"/>
                 {!isDesktopCollapsed && <span className="text-sm">Създай профил</span>}
               </button>
             </TooltipTrigger>
             {isDesktopCollapsed && <TooltipContent side="right">Създай профил</TooltipContent>}
          </Tooltip>

          {/* Notifications */}
           <Tooltip>
             <TooltipTrigger asChild>
               <button className={cn(navItemClasses(activeSection === 'notifications'), "w-full")} onClick={() => handleSectionChange('notifications')}>
                 <Bell size={navIconSize} className="shrink-0"/>
                 {!isDesktopCollapsed && <span className="text-sm">Известия</span>}
               </button>
             </TooltipTrigger>
             {isDesktopCollapsed && <TooltipContent side="right">Известия</TooltipContent>}
           </Tooltip>

           {/* Profile Management */}
           <Tooltip>
             <TooltipTrigger asChild>
               <button className={cn(navItemClasses(activeSection === 'profiles'), "w-full")} onClick={() => handleSectionChange('profiles')}>
                 <List size={navIconSize} className="shrink-0"/>
                 {!isDesktopCollapsed && <span className="text-sm">Управление профили</span>}
               </button>
             </TooltipTrigger>
             {isDesktopCollapsed && <TooltipContent side="right">Управление профили</TooltipContent>}
           </Tooltip>

           <Separator className="my-2 opacity-50" />

           {/* My Pets */}
           <div className={petsGroupClasses}>
             <Tooltip>
               <TooltipTrigger asChild>
                 <button 
                   className={cn(
                     "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full",
                     activeSection === 'pets' ? "text-paradise font-semibold" : "text-gray-700 dark:text-gray-300",
                     isDesktopCollapsed ? "justify-center" : "justify-start"
                   )} 
                   onClick={() => handleSectionChange('pets')}
                 >
                   <PawIcon size={navIconSize} className="shrink-0"/>
                   {!isDesktopCollapsed && <span className="text-sm">Моите любимци</span>}
                 </button>
               </TooltipTrigger>
               {isDesktopCollapsed && <TooltipContent side="right">Моите любимци</TooltipContent>}
             </Tooltip>

             {/* Pet list - only visible when not collapsed and pets section is active */}
             {!isDesktopCollapsed && activeSection === 'pets' && (
               <div className="mt-1 pl-4">
                 {isLoading ? (
                   <div className="py-2 text-center text-gray-500 dark:text-gray-400 text-xs">Зареждане...</div>
                 ) : petProfiles.length > 0 ? (
                   <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                     {petProfiles.map((pet) => (
                       <li key={pet.id}>
                         <Button
                           variant="ghost"
                           className="w-full justify-start text-left hover:bg-paradise/10 dark:hover:bg-paradise/20 group px-2 py-1.5 h-auto"
                           onClick={() => pet.id && navigateToPetProfile(pet.id)}
                           title={pet.name}
                         >
                           <div className="flex items-center gap-2 w-full">
                             {pet.featured_media_url ? (
                               <div className="h-8 w-8 rounded-full overflow-hidden border border-paradise/30 shrink-0">
                                 <img
                                   src={pet.featured_media_url}
                                   alt={pet.name}
                                   className="h-full w-full object-cover"
                                 />
                               </div>
                             ) : (
                               <div className="h-8 w-8 rounded-full bg-paradise/20 flex items-center justify-center shrink-0">
                                 <PawIcon size={16} className="text-paradise" />
                               </div>
                             )}
                             <span className="text-sm font-medium truncate flex-1 text-gray-800 dark:text-gray-200">{pet.name}</span>
                             <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                           </div>
                         </Button>
                       </li>
                     ))}
                   </ul>
                 ) : (
                    <div className="py-3 px-2 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <PawIcon className="h-5 w-5 mx-auto mb-1 text-gray-400 dark:text-gray-500" />
                      <p className="text-xs mb-1">Няма намерени профили.</p>
                      <Button
                        variant="link"
                        onClick={() => navigate('/create-profile')}
                        className="text-paradise text-xs h-auto p-0"
                      >
                        Създайте профил
                      </Button>
                    </div>
                 )}
               </div>
             )}
           </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-2 border-t border-gray-200/80 dark:border-gray-700/80 mt-auto shrink-0">
           {/* Desktop Collapse Toggle */}
           <Tooltip>
             <TooltipTrigger asChild>
                 <Button
                    variant="ghost"
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        "text-gray-600 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100",
                         isDesktopCollapsed ? "justify-center" : "justify-start"
                    )}
                    onClick={toggleDesktopCollapse}
                    aria-label={isDesktopCollapsed ? "Expand Menu" : "Collapse Menu"}
                >
                    {isDesktopCollapsed ? <PanelLeftOpen size={navIconSize} className="shrink-0"/> : <PanelLeftClose size={navIconSize} className="shrink-0"/>}
                    {!isDesktopCollapsed && <span className="text-sm">Свиване</span>}
                </Button>
             </TooltipTrigger>
             {isDesktopCollapsed && <TooltipContent side="right">{isDesktopCollapsed ? "Разширяване" : "Свиване"}</TooltipContent>}
           </Tooltip>

           {/* Sign Out Button */}
           <Tooltip>
             <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        "text-red-600 dark:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-400",
                        isDesktopCollapsed ? "justify-center" : "justify-start"
                    )}
                    onClick={handleSignOut}
                >
                    <LogOut size={navIconSize} className="shrink-0" />
                    {!isDesktopCollapsed && <span className="text-sm">Изход</span>}
                </Button>
            </TooltipTrigger>
            {isDesktopCollapsed && <TooltipContent side="right">Изход</TooltipContent>}
           </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SideMenu;