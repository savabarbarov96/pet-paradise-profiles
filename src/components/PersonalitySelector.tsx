
import React, { useState } from 'react';

type TraitCategory = 'temperament' | 'energy' | 'sociability' | 'quirks';

interface Trait {
  name: string;
  category: TraitCategory;
  color: string;
}

interface PersonalitySelectorProps {
  onTraitsChange: (traits: string[]) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ onTraitsChange }) => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<TraitCategory>('temperament');
  
  const traitList: Trait[] = [
    // Temperament traits
    { name: 'Playful', category: 'temperament', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Calm', category: 'temperament', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Curious', category: 'temperament', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Loyal', category: 'temperament', color: 'bg-tranquil-light text-tranquil-dark' },
    { name: 'Mischievous', category: 'temperament', color: 'bg-soft-light text-soft-dark' },
    { name: 'Gentle', category: 'temperament', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Stubborn', category: 'temperament', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Independent', category: 'temperament', color: 'bg-serenity-light text-serenity-dark' },
    
    // Energy traits
    { name: 'Energetic', category: 'energy', color: 'bg-tranquil-light text-tranquil-dark' },
    { name: 'Lazy', category: 'energy', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Athletic', category: 'energy', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Relaxed', category: 'energy', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Hyperactive', category: 'energy', color: 'bg-soft-light text-soft-dark' },
    { name: 'Sleepy', category: 'energy', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Early riser', category: 'energy', color: 'bg-tranquil-light text-tranquil-dark' },
    { name: 'Night owl', category: 'energy', color: 'bg-paradise-light text-paradise-dark' },
    
    // Sociability traits
    { name: 'Friendly', category: 'sociability', color: 'bg-tranquil-light text-tranquil-dark' },
    { name: 'Shy', category: 'sociability', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Social', category: 'sociability', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Reserved', category: 'sociability', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Affectionate', category: 'sociability', color: 'bg-soft-light text-soft-dark' },
    { name: 'Aloof', category: 'sociability', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Protective', category: 'sociability', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Clingy', category: 'sociability', color: 'bg-gentle-light text-gentle-dark' },
    
    // Quirks traits
    { name: 'Picky eater', category: 'quirks', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Food lover', category: 'quirks', color: 'bg-tranquil-light text-tranquil-dark' },
    { name: 'Talkative', category: 'quirks', color: 'bg-soft-light text-soft-dark' },
    { name: 'Quiet', category: 'quirks', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Water lover', category: 'quirks', color: 'bg-paradise-light text-paradise-dark' },
    { name: 'Toy hoarder', category: 'quirks', color: 'bg-gentle-light text-gentle-dark' },
    { name: 'Window watcher', category: 'quirks', color: 'bg-serenity-light text-serenity-dark' },
    { name: 'Lap sitter', category: 'quirks', color: 'bg-soft-light text-soft-dark' },
  ];

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => {
      const newTraits = prev.includes(trait) 
        ? prev.filter(t => t !== trait) 
        : [...prev, trait];
      
      onTraitsChange(newTraits);
      return newTraits;
    });
  };

  const categoryTitles: Record<TraitCategory, string> = {
    temperament: 'Temperament',
    energy: 'Energy & Activity',
    sociability: 'Social Behavior',
    quirks: 'Special Quirks'
  };

  const categoryIcons: Record<TraitCategory, React.ReactNode> = {
    temperament: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8a2 2 0 0 1 2 2v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V5a2 2 0 0 1 2-2z"></path>
        <path d="M8 14v.5"></path>
        <path d="M16 14v.5"></path>
        <path d="M11.5 2v1"></path>
        <path d="M11.5 22v-1"></path>
        <path d="M10 20h4"></path>
      </svg>
    ),
    energy: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>
      </svg>
    ),
    sociability: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M10 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M3 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M17 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M3 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M10 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M3 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M17 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      </svg>
    ),
    quirks: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c0-3 2.5-3 2.5-5 0-1-1-2-2.5-2s-2.5 1-2.5 2c0 3 2.5 2 2.5 2"></path>
        <circle cx="12" cy="17" r="1"></circle>
        <circle cx="12" cy="12" r="9"></circle>
      </svg>
    )
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 animate-fade-in-up">
      <h3 className="text-lg font-medium mb-4 text-center">
        What was {selectedTraits.length > 0 ? 'their' : 'your pet\'s'} personality like?
      </h3>
      
      <div className="flex justify-between p-1 bg-secondary rounded-xl mb-6">
        {(Object.keys(categoryTitles) as TraitCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm transition-all ${
              activeCategory === category 
                ? 'bg-white shadow-soft text-foreground' 
                : 'text-muted-foreground hover:bg-white/50'
            }`}
          >
            <span className="hidden sm:inline">{categoryIcons[category]}</span>
            <span className="font-medium">{categoryTitles[category]}</span>
          </button>
        ))}
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft">
        <div className="flex flex-wrap gap-2 justify-center">
          {traitList
            .filter(trait => trait.category === activeCategory)
            .map(trait => (
              <button
                key={trait.name}
                onClick={() => toggleTrait(trait.name)}
                className={`pet-trait-button ${trait.color} ${
                  selectedTraits.includes(trait.name) ? 'selected' : ''
                }`}
              >
                {trait.name}
                {selectedTraits.includes(trait.name) && (
                  <span className="ml-1">✓</span>
                )}
              </button>
            ))
          }
        </div>
      </div>
      
      {selectedTraits.length > 0 && (
        <div className="mt-6 p-4 glass-panel rounded-xl">
          <h4 className="text-sm font-medium mb-2">Selected traits:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTraits.map(trait => (
              <div 
                key={trait} 
                className="px-3 py-1 bg-paradise/10 text-paradise-dark rounded-full text-sm flex items-center"
              >
                <span>{trait}</span>
                <button 
                  onClick={() => toggleTrait(trait)}
                  className="ml-1 w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalitySelector;
