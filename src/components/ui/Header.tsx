
import React from 'react';
import { PawPrint } from 'lucide-react';

interface HeaderProps {
  currentStep?: number;
  totalSteps?: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep, totalSteps }) => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-center relative">
      <div className="absolute left-4">
        {currentStep && currentStep > 1 && (
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center glass-button"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-2 animate-fade-in">
        <PawPrint className="w-6 h-6 text-paradise" />
        <h1 className="text-xl font-display font-medium text-foreground">Pet Paradise</h1>
      </div>
      
      {currentStep && totalSteps && (
        <div className="absolute right-4 text-sm text-muted-foreground">
          {currentStep}/{totalSteps}
        </div>
      )}
    </header>
  );
};

export default Header;
