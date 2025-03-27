import { supabase } from "@/integrations/supabase/client";

// Generate a random story for a pet
export const generatePetStory = (petName: string, traits: string[]): string => {
  const settings = [
    "под дъгата на моста",
    "в ливада с котешка трева",
    "до кристално чист извор",
    "под сянката на дърво",
    "в слънчев лъч",
    "на пухкав облак",
    "в поле с пеперуди",
    "до спокоен поток",
    "на хълм с изглед към рая",
    "в градина с лакомства"
  ];

  const activities = [
    "си почива спокойно",
    "играе с нови приятели",
    "изследва нови аромати",
    "гони пеперуди",
    "се радва на слънцето",
    "хапва любимите си лакомства",
    "наблюдава облаците",
    "тича из полята",
    "се катери по дърветата",
    "плува щастливо"
  ];

  const feelings = [
    "с пълно удовлетворение",
    "без никакви грижи",
    "чувствайки се отново млад и енергичен",
    "с щастлива усмивка",
    "мъркайки силно",
    "махайки радостно с опашка",
    "изпитвайки мир и любов",
    "с игрив дух",
    "в пълно блаженство",
    "заобиколен от любов"
  ];

  // Use traits to personalize the story if available
  let personalizedDetails = "";
  if (traits && traits.length > 0) {
    const trait = traits[Math.floor(Math.random() * traits.length)];
    switch (trait.toLowerCase()) {
      case "игрив":
      case "playful":
        personalizedDetails = " Другите любимци в рая обожават да играят с такъв забавен приятел!";
        break;
      case "мързелив":
      case "lazy":
        personalizedDetails = " Намирането на перфектното място за дрямка е това, което прави най-добре!";
        break;
      case "гальовен":
      case "affectionate":
        personalizedDetails = " Всички в рая обожават неговата любвеобилна природа!";
        break;
      case "любопитен":
      case "curious":
        personalizedDetails = " Винаги има ново кътче от рая за изследване!";
        break;
      case "умен":
      case "intelligent":
        personalizedDetails = " Бързо е научил всички най-добри места в рая!";
        break;
      default:
        personalizedDetails = " Перфектен ден в рая!";
    }
  }

  const setting = settings[Math.floor(Math.random() * settings.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  const feeling = feelings[Math.floor(Math.random() * feelings.length)];

  return `${petName} прекара деня ${setting}, ${activity} ${feeling}.${personalizedDetails}`;
};

// Fetch pet profile by ID
export const fetchPetProfile = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from('pet_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error("Error fetching pet profile:", error);
      
      // Check if this is a permission error, which might indicate that
      // this is a private profile the user doesn't have access to
      if (error.code === 'PGRST116') {
        // Permission denied error code in Supabase
        return { error: "Този профил е личен и не е достъпен за преглед." };
      }
      
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching pet profile:", error);
    return null;
  }
};

// Generate multiple random stories
export const generateMultipleStories = (petName: string, traits: string[], count: number = 3): string[] => {
  const stories = [];
  for (let i = 0; i < count; i++) {
    stories.push(generatePetStory(petName, traits));
  }
  return stories;
};
