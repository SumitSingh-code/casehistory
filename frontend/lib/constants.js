export const SYMPTOM_CATEGORIES = [
  { id: 'fever', label: 'Fever', icon: '🌡️' },
  { id: 'pain', label: 'Pain', icon: '⚡' },
  { id: 'respiratory', label: 'Respiratory', icon: '🫁' },
  { id: 'digestive', label: 'Digestive', icon: '🤢' },
  { id: 'skin', label: 'Skin', icon: '🦠' },
  { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
];

export const RED_FLAG_SYMPTOMS = [
  'chest pain', 'difficulty breathing', 'severe bleeding', 
  'loss of consciousness', 'sudden weakness', 'severe abdominal pain'
];

export const PRAKRITI_QUESTIONS = [
  {
    id: 'body_frame',
    title: 'Body Frame & Built',
    icon: '👤',
    options: [
      { id: 'vata', label: 'Thin, bony, prominent joints' },
      { id: 'pitta', label: 'Medium built, well-proportioned' },
      { id: 'kapha', label: 'Broad, well-developed, stocky' }
    ]
  },
  {
    id: 'skin',
    title: 'Skin Texture',
    icon: '✨',
    options: [
      { id: 'vata', label: 'Dry, rough, thin' },
      { id: 'pitta', label: 'Soft, oily, warm, prone to acne' },
      { id: 'kapha', label: 'Thick, oily, cool, smooth' }
    ]
  },
  {
    id: 'hair',
    title: 'Hair Characteristics',
    icon: '💇',
    options: [
      { id: 'vata', label: 'Dry, thin, sparse, curly' },
      { id: 'pitta', label: 'Fine, early graying/thinning' },
      { id: 'kapha', label: 'Thick, lustrous, dark, wavy' }
    ]
  },
  {
    id: 'appetite',
    title: 'Appetite & Digestion',
    icon: '🍽️',
    options: [
      { id: 'vata', label: 'Variable, irregular' },
      { id: 'pitta', label: 'Strong, sharp, cannot skip meals' },
      { id: 'kapha', label: 'Steady, mild, can skip meals easily' }
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep Pattern',
    icon: '😴',
    options: [
      { id: 'vata', label: 'Light, interrupted, less hours' },
      { id: 'pitta', label: 'Sound, moderate duration' },
      { id: 'kapha', label: 'Deep, heavy, prolonged' }
    ]
  },
  {
    id: 'activity',
    title: 'Physical Activity Level',
    icon: '🏃',
    options: [
      { id: 'vata', label: 'Very active, restless' },
      { id: 'pitta', label: 'Moderate, goal-oriented' },
      { id: 'kapha', label: 'Slow, steady, dislikes strenuous exercise' }
    ]
  },
  {
    id: 'temperament',
    title: 'Mind & Temperament',
    icon: '🧠',
    options: [
      { id: 'vata', label: 'Quick, adaptable, anxious' },
      { id: 'pitta', label: 'Sharp, focused, irritable' },
      { id: 'kapha', label: 'Calm, patient, attached' }
    ]
  },
  {
    id: 'weather',
    title: 'Weather Preference',
    icon: '🌡️',
    options: [
      { id: 'vata', label: 'Dislikes cold and wind' },
      { id: 'pitta', label: 'Dislikes heat and sun' },
      { id: 'kapha', label: 'Dislikes cold and damp' }
    ]
  },
  {
    id: 'speech',
    title: 'Speech Pattern',
    icon: '🗣️',
    options: [
      { id: 'vata', label: 'Fast, talkative, omits words' },
      { id: 'pitta', label: 'Clear, sharp, precise' },
      { id: 'kapha', label: 'Slow, deep, melodious' }
    ]
  },
  {
    id: 'memory',
    title: 'Memory',
    icon: '💭',
    options: [
      { id: 'vata', label: 'Learns quickly, forgets quickly' },
      { id: 'pitta', label: 'Good, sharp, retains well' },
      { id: 'kapha', label: 'Learns slowly, retains forever' }
    ]
  }
];
