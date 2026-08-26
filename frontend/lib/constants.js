export const COMPLAINT_ICONS = [
  { id: 'fever', label: 'Bukhar', labelHi: 'बुखार', emoji: '🤒' },
  { id: 'headache', label: 'Sir Dard', labelHi: 'सिर दर्द', emoji: '🤕' },
  { id: 'cough', label: 'Khansi', labelHi: 'खांसी', emoji: '🤧' },
  { id: 'chest_pain', label: 'Seene mein dard', labelHi: 'सीने में दर्द', emoji: '🫀' },
  { id: 'stomach_pain', label: 'Pet Dard', labelHi: 'पेट दर्द', emoji: '🤢' },
  { id: 'other', label: 'Kuch Aur', labelHi: 'कुछ और', emoji: '➕' }
];

export const COMPLAINT_DECISION_TREES = {
  headache: {
    questions: [
      { text: 'Kab se ho raha hai?', textHi: 'कब से हो रहा है?', textEn: 'Since when?' },
      { text: 'Sar ke ek taraf hai ya poore sar mein?', textHi: 'सर के एक तरफ है या पूरे सर में?', textEn: 'One side or whole head?' },
      { text: 'Ulti ya chakkar bhi aa raha hai?', textHi: 'उल्टी या चक्कर भी आ रहा है?', textEn: 'Nausea or dizziness?' },
      { text: 'Aur koi dikkat hai?', textHi: 'और कोई दिक्कत है?', textEn: 'Any other problem?' }
    ],
    redFlagKeywords: ['worst headache', 'sabse tez dard', 'vision loss', 'nazar kamzor']
  },
  fever: {
    questions: [
      { text: 'Kab se bukhar hai?', textHi: 'कब से बुखार है?', textEn: 'Since when?' },
      { text: 'Kitna bukhar hai?', textHi: 'कितना बुखार है?', textEn: 'How high is the fever?' },
      { text: 'Khaansi ya sardi bhi hai?', textHi: 'खांसी या सर्दी भी है?', textEn: 'Cough or cold too?' },
      { text: 'Aur koi dikkat hai?', textHi: 'और कोई दिक्कत है?', textEn: 'Any other problem?' }
    ],
    redFlagKeywords: ['rash', 'daane', 'stiff neck', 'gardan akad']
  },
  chest_pain: {
    questions: [
      { text: 'Kab se dard hai?', textHi: 'कब से दर्द है?', textEn: 'Since when?' },
      { text: 'Dard kis taraf hai?', textHi: 'दर्द किस तरफ है?', textEn: 'Which side is the pain?' },
      { text: 'Saans lene mein dikkat hai?', textHi: 'सांस लेने में दिक्कत है?', textEn: 'Breathing difficulty?' },
      { text: 'Pasina bhi aa raha hai?', textHi: 'पसीना भी आ रहा है?', textEn: 'Are you sweating too?' },
      { text: 'Aur koi dikkat hai?', textHi: 'और कोई दिक्कत है?', textEn: 'Any other problem?' }
    ],
    redFlagKeywords: ['radiating', 'failta hua', 'arm pain', 'haath mein dard', 'jaw pain', 'sweating', 'pasina']
  },
  stomach_pain: {
    questions: [
      { text: 'Kab se pet dard hai?', textHi: 'कब से पेट दर्द है?', textEn: 'Since when?' },
      { text: 'Khaane ke baad ya pehle?', textHi: 'खाने के बाद या पहले?', textEn: 'Before or after eating?' },
      { text: 'Ulti ya dast bhi hai?', textHi: 'उल्टी या दस्त भी है?', textEn: 'Vomiting or diarrhea?' },
      { text: 'Aur koi dikkat hai?', textHi: 'और कोई दिक्कत है?', textEn: 'Any other problem?' }
    ],
    redFlagKeywords: ['blood in stool', 'khoon', 'vomiting blood', 'khoon ki ulti']
  },
  cough: {
    questions: [
      { text: 'Kab se khaansi hai?', textHi: 'कब से खांसी है?', textEn: 'Since when?' },
      { text: 'Sukkhi hai ya balgam wali?', textHi: 'सूखी है या बलगम वाली?', textEn: 'Dry or with phlegm?' },
      { text: 'Bukhar bhi hai?', textHi: 'बुखार भी है?', textEn: 'Fever too?' },
      { text: 'Aur koi dikkat hai?', textHi: 'और कोई दिक्कत है?', textEn: 'Any other problem?' }
    ],
    redFlagKeywords: ['blood in cough', 'khoon', 'weight loss', 'vajan kam']
  }
};

export const PAST_ILLNESS_OPTIONS = [
  { id: 'diabetes', label: 'Sugar/Diabetes', labelHi: 'शुगर', emoji: '💉' },
  { id: 'hypertension', label: 'BP', labelHi: 'बीपी', emoji: '🩸' },
  { id: 'heart', label: 'Heart Disease', labelHi: 'दिल की बीमारी', emoji: '❤️' },
  { id: 'tb', label: 'TB', labelHi: 'टीबी', emoji: '🫁' },
  { id: 'asthma', label: 'Asthma/Dama', labelHi: 'दमा', emoji: '😮‍💨' },
  { id: 'thyroid', label: 'Thyroid', labelHi: 'थायरॉइड', emoji: '🦋' },
  { id: 'none', label: 'None', labelHi: 'कोई नहीं', emoji: '✅' }
];

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

export const PRAKRITI_QUESTIONS = [
  {
    id: 'body_frame',
    question: 'Aapka shareer kaisa hai?',
    questionHi: 'आपका शरीर कैसा है?',
    questionEn: 'What is your body frame like?',
    options: [
      { label: 'Patla/Dubla', labelHi: 'पतला/दुबला', labelEn: 'Thin/Lean', dosha: 'vata' },
      { label: 'Madhyam', labelHi: 'मध्यम', labelEn: 'Medium/Athletic', dosha: 'pitta' },
      { label: 'Bhari/Mota', labelHi: 'भारी/मोटा', labelEn: 'Heavy/Large', dosha: 'kapha' }
    ]
  },
  {
    id: 'skin_type',
    question: 'Aapki twacha kaisi hai?',
    questionHi: 'आपकी त्वचा कैसी है?',
    questionEn: 'What is your skin type?',
    options: [
      { label: 'Sukhhi/Roohkhi', labelHi: 'सूखी/रूखी', labelEn: 'Dry/Rough', dosha: 'vata' },
      { label: 'Narm/Garam', labelHi: 'नरम/गरम', labelEn: 'Soft/Warm', dosha: 'pitta' },
      { label: 'Chikni/Thandi', labelHi: 'चिकनी/ठंडी', labelEn: 'Oily/Cool', dosha: 'kapha' }
    ]
  },
  {
    id: 'appetite',
    question: 'Aapki bhook kaisi hai?',
    questionHi: 'आपकी भूख कैसी है?',
    questionEn: 'How is your appetite?',
    options: [
      { label: 'Asamaan/Badalta hai', labelHi: 'असमान/बदलती है', labelEn: 'Irregular', dosha: 'vata' },
      { label: 'Tez bhook', labelHi: 'तेज भूख', labelEn: 'Strong/Sharp', dosha: 'pitta' },
      { label: 'Dheemi bhook', labelHi: 'धीमी भूख', labelEn: 'Slow/Steady', dosha: 'kapha' }
    ]
  },
  {
    id: 'sleep',
    question: 'Aapki neend kaisi hai?',
    questionHi: 'आपकी नींद कैसी है?',
    questionEn: 'How is your sleep?',
    options: [
      { label: 'Halki/Tooti hui', labelHi: 'हल्की/टूटी हुई', labelEn: 'Light/Disturbed', dosha: 'vata' },
      { label: 'Theek/Madhyam', labelHi: 'ठीक/मध्यम', labelEn: 'Moderate', dosha: 'pitta' },
      { label: 'Gehri/Zyada', labelHi: 'गहरी/ज़्यादा', labelEn: 'Deep/Heavy', dosha: 'kapha' }
    ]
  },
  {
    id: 'digestion',
    question: 'Aapka paachan kaisa hai?',
    questionHi: 'आपका पाचन कैसा है?',
    questionEn: 'How is your digestion?',
    options: [
      { label: 'Gas/Kabz', labelHi: 'गैस/कब्ज', labelEn: 'Gas/Constipation', dosha: 'vata' },
      { label: 'Tez/Acidity', labelHi: 'तेज/एसिडिटी', labelEn: 'Quick/Acidity', dosha: 'pitta' },
      { label: 'Dheema/Bhaari', labelHi: 'धीमा/भारी', labelEn: 'Slow/Heavy', dosha: 'kapha' }
    ]
  }
];

export const RED_FLAG_RULES = [
  {
    condition: (complaints) => complaints.includes('chest_pain') && complaints.includes('sweating'),
    message: 'Possible cardiac event. Immediate attention required.'
  },
  {
    condition: (complaints) => complaints.includes('headache') && complaints.includes('vomiting') && complaints.includes('fever'),
    message: 'Possible meningitis. Immediate attention required.'
  },
  {
    condition: (complaints) => complaints.includes('chest_pain') && complaints.includes('breathlessness'),
    message: 'Respiratory and cardiac concern. Immediate evaluation recommended.'
  }
];

export const FLOW_STEPS = [
  { path: '/', label: 'Welcome', step: 0 },
  { path: '/register', label: 'Register', step: 1 },
  { path: '/consent', label: 'Consent', step: 2 },
  { path: '/intake', label: 'Intake', step: 3 },
  { path: '/prakriti', label: 'History', step: 4 },
  { path: '/scan', label: 'Documents', step: 5 },
  { path: '/summary', label: 'Summary', step: 6 },
  { path: '/complete', label: 'Done', step: 7 },
];
