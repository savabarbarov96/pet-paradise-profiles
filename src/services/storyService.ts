
import { supabase } from "@/integrations/supabase/client";

// Generate a random story for a pet
export const generatePetStory = (petName: string, traits: string[]): string => {
  const settings = [
    "under a rainbow bridge",
    "in a meadow of catnip",
    "by a crystal clear pond",
    "under a shady tree",
    "in a sunbeam patch",
    "on a fluffy cloud",
    "in a field of butterflies",
    "beside a peaceful stream",
    "on a hill overlooking paradise",
    "in a garden of treats"
  ];

  const activities = [
    "taking a peaceful nap",
    "playing with new friends",
    "exploring new scents",
    "chasing butterflies",
    "basking in the sunlight",
    "enjoying treats",
    "watching clouds float by",
    "running through fields",
    "climbing trees",
    "swimming happily"
  ];

  const feelings = [
    "with pure contentment",
    "without a care in the world",
    "feeling young and energetic again",
    "with a happy smile",
    "purring loudly",
    "wagging their tail happily",
    "feeling peaceful and loved",
    "with a playful spirit",
    "in complete bliss",
    "surrounded by love"
  ];

  // Use traits to personalize the story if available
  let personalizedDetails = "";
  if (traits && traits.length > 0) {
    const trait = traits[Math.floor(Math.random() * traits.length)];
    switch (trait.toLowerCase()) {
      case "playful":
        personalizedDetails = " The other paradise pets love playing with such a fun friend!";
        break;
      case "lazy":
        personalizedDetails = " Finding the perfect napping spot is what they do best!";
        break;
      case "affectionate":
        personalizedDetails = " All the paradise caretakers adore their loving nature!";
        break;
      case "curious":
        personalizedDetails = " There's always a new corner of paradise to explore!";
        break;
      case "intelligent":
        personalizedDetails = " They've quickly learned all the best spots in paradise!";
        break;
      default:
        personalizedDetails = " It's the perfect day in paradise!";
    }
  }

  const setting = settings[Math.floor(Math.random() * settings.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  const feeling = feelings[Math.floor(Math.random() * feelings.length)];

  return `${petName} spent the day ${setting}, ${activity} ${feeling}.${personalizedDetails}`;
};

// Fetch pet profile by ID
export const fetchPetProfile = async (profileId: string) => {
  const { data, error } = await supabase
    .from('pet_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error("Error fetching pet profile:", error);
    return null;
  }

  return data;
};

// Generate multiple random stories
export const generateMultipleStories = (petName: string, traits: string[], count: number = 3): string[] => {
  const stories = [];
  for (let i = 0; i < count; i++) {
    stories.push(generatePetStory(petName, traits));
  }
  return stories;
};
