import PetProfileCreation from '@/components/pet-profile/PetProfileCreation';
import SideMenu from '@/components/SideMenu';
import PremiumBackground from '@/components/PremiumBackground';

const Index = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideMenu />
      <main className="flex-1 md:ml-64 relative">
        <div className="relative min-h-screen">
          {/* Premium background */}
          <PremiumBackground />
          
          {/* Content */}
          <div className="relative z-10">
            <PetProfileCreation />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
