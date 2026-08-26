export const COMPLAINT_ICONS = [
  { id: 'fever', label: 'Bukhar', labelHi: 'बुखार', emoji: '🤒' },
  { id: 'headache', label: 'Sir Dard', labelHi: 'सिर दर्द', emoji: '🤕' },
  { id: 'cough', label: 'Khansi', labelHi: 'खांसी', emoji: '🤧' },
  { id: 'chest_pain', label: 'Chhati mein dard', labelHi: 'छाती में दर्द', emoji: '🫀' },
  { id: 'stomach_pain', label: 'Pet Dard', labelHi: 'पेट दर्द', emoji: '🤢' },
  { id: 'other', label: 'Kuch Aur', labelHi: 'कुछ और', emoji: '➕' }
];

export const COMPLAINT_DECISION_TREES = {
  headache: [
    'Kab se ho raha hai?',
    'Sar ke ek taraf hai ya poore sar mein?',
    'Ulti ya chakkar bhi aa raha hai?',
    'Aur koi dikkat hai?'
  ],
  fever: [
    'Kab se bukhar hai?',
    'Kitna bukhar hai?',
    'Khaansi ya sardi bhi hai?',
    'Aur koi dikkat hai?'
  ],
  chest_pain: [
    'Kab se dard hai?',
    'Dard kis taraf hai?',
    'Saans lene mein dikkat hai?',
    'Aur koi dikkat hai?'
  ],
  stomach_pain: [
    'Kab se pet dard hai?',
    'Khaane ke baad ya pehle?',
    'Ulti ya dast bhi hai?',
    'Aur koi dikkat hai?'
  ],
  cough: [
    'Kab se khaansi hai?',
    'Sukkhi hai ya balgam wali?',
    'Bukhar bhi hai?',
    'Aur koi dikkat hai?'
  ]
};

export const PAST_ILLNESS_OPTIONS = [
  { id: 'diabetes', label: 'Sugar/Diabetes', emoji: '💉' },
  { id: 'hypertension', label: 'BP', emoji: '🩸' },
  { id: 'heart', label: 'Dil ki bimari', emoji: '❤️' },
  { id: 'tb', label: 'TB', emoji: '🫁' },
  { id: 'asthma', label: 'Asthma/Dama', emoji: '😮‍💨' },
  { id: 'none', label: 'Koi nahi', emoji: '✅' }
];

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

export const RED_FLAG_RULES = [
  {
    condition: (complaints) => complaints.includes('chest_pain') && complaints.includes('sweating'),
    message: 'Possible cardiac event. Immediate attention required.'
  },
  {
    condition: (complaints) => complaints.includes('headache') && complaints.includes('vomiting') && complaints.includes('fever'),
    message: 'Possible meningitis. Immediate attention required.'
  }
];
