export type PetRecord = {
  id: string;
  name: string;
  age: string;
  species: string;
  sex: string;
  traits: [string, string];
  badge?: "new" | "urgent";
  emoji: string;
  accent: string;
  location: string;
  shelterName: string;
  story: string;
  healthStatus: string[];
  personality: string[];
  medicalSummary: {
    label: string;
    value: string;
  }[];
};

export const mockPets: PetRecord[] = [
  {
    id: "cooper",
    name: "Cooper",
    age: "2 Months",
    species: "Golden Retriever",
    sex: "Male",
    traits: ["Energetic", "Kid Friendly"],
    badge: "new",
    emoji: "🐶",
    accent: "from-amber-100 via-orange-100 to-rose-100",
    location: "Porto, Portugal",
    shelterName: "Canil Patas Felizes",
    story:
      "Cooper was rescued with his siblings and quickly became the happiest puppy in the shelter. He loves people, learns fast, and is always ready to play.",
    healthStatus: ["Vaccinated", "Microchipped", "Dewormed"],
    personality: ["Playful", "Social", "Loves Walks"],
    medicalSummary: [
      { label: "Vaccination", value: "Initial protocol completed" },
      { label: "Neuter status", value: "Scheduled when age-appropriate" },
      { label: "Vet note", value: "Healthy with regular checkups" },
    ],
  },
  {
    id: "luna",
    name: "Luna",
    age: "3 Years",
    species: "Russian Blue",
    sex: "Female",
    traits: ["Calm", "Indoor Only"],
    emoji: "🐱",
    accent: "from-slate-100 via-zinc-100 to-blue-100",
    location: "Lisbon, Portugal",
    shelterName: "Casa dos Bigodes",
    story:
      "Luna is a graceful cat with a gentle personality. She enjoys quiet routines, sunny spots by the window, and human companionship on her own sweet terms.",
    healthStatus: ["Vaccinated", "Spayed", "Microchipped"],
    personality: ["Gentle", "Quiet", "Affectionate"],
    medicalSummary: [
      { label: "Vaccination", value: "Core vaccines up to date" },
      { label: "Neuter status", value: "Spayed" },
      { label: "Vet note", value: "No chronic conditions identified" },
    ],
  },
  {
    id: "benson",
    name: "Benson",
    age: "5 Years",
    species: "French Bulldog",
    sex: "Male",
    traits: ["Apartment Life", "Well Trained"],
    badge: "urgent",
    emoji: "🐕",
    accent: "from-orange-100 via-red-100 to-rose-100",
    location: "Coimbra, Portugal",
    shelterName: "Centro Amigo Animal",
    story:
      "Benson was surrendered after a family relocation and is ready for a stable home again. He is friendly, knows basic commands, and adapts well to apartments.",
    healthStatus: ["Vaccinated", "Neutered", "Microchipped"],
    personality: ["Loyal", "Smart", "Low Energy Indoors"],
    medicalSummary: [
      { label: "Vaccination", value: "Annual boosters complete" },
      { label: "Neuter status", value: "Neutered" },
      { label: "Vet note", value: "Needs weight maintenance plan" },
    ],
  },
  {
    id: "marshmallow",
    name: "Marshmallow",
    age: "1 Year",
    species: "Persian",
    sex: "Female",
    traits: ["Sweet", "Cuddly"],
    emoji: "🐈",
    accent: "from-zinc-100 via-stone-100 to-neutral-100",
    location: "Braga, Portugal",
    shelterName: "Gatinhos do Norte",
    story:
      "Marshmallow was found wandering and has become a cuddle champion. She enjoys lap time, soft blankets, and short play sessions with teaser toys.",
    healthStatus: ["Vaccinated", "Spayed", "Microchipped"],
    personality: ["Calm", "Cuddly", "Indoor Friendly"],
    medicalSummary: [
      { label: "Vaccination", value: "Complete for this year" },
      { label: "Neuter status", value: "Spayed" },
      { label: "Vet note", value: "Requires regular coat grooming" },
    ],
  },
  {
    id: "duke",
    name: "Duke",
    age: "7 Years",
    species: "Labrador Mix",
    sex: "Male",
    traits: ["Loyal", "Senior Friendly"],
    emoji: "🐕‍🦺",
    accent: "from-emerald-100 via-teal-100 to-cyan-100",
    location: "Aveiro, Portugal",
    shelterName: "Projeto Quatro Patas",
    story:
      "Duke is a mellow senior with a big heart. He is great on relaxed walks, loves gentle company, and is the perfect fit for a calm family environment.",
    healthStatus: ["Vaccinated", "Neutered", "Dental care done"],
    personality: ["Calm", "Loyal", "Great with Adults"],
    medicalSummary: [
      { label: "Vaccination", value: "Updated this season" },
      { label: "Neuter status", value: "Neutered" },
      { label: "Vet note", value: "Mild joint stiffness, on supplements" },
    ],
  },
  {
    id: "mittens",
    name: "Mittens",
    age: "4 Months",
    species: "Domestic Shorthair",
    sex: "Female",
    traits: ["Playful", "Social"],
    emoji: "🐾",
    accent: "from-sky-100 via-indigo-100 to-purple-100",
    location: "Faro, Portugal",
    shelterName: "Refugio Sol e Patas",
    story:
      "Mittens is full of curiosity and kitten energy. She explores every corner, loves interactive toys, and gets along very well with other friendly pets.",
    healthStatus: ["Vaccinated", "Microchipped", "Dewormed"],
    personality: ["Curious", "Playful", "People-Oriented"],
    medicalSummary: [
      { label: "Vaccination", value: "Puppy/kitten plan in progress" },
      { label: "Neuter status", value: "Not yet due to age" },
      { label: "Vet note", value: "Healthy and active growth" },
    ],
  },
];

export function getMockPetById(petId: string) {
  return mockPets.find((pet) => pet.id === petId);
}

export function getRelatedMockPets(currentPetId: string, limit = 3) {
  return mockPets.filter((pet) => pet.id !== currentPetId).slice(0, limit);
}
