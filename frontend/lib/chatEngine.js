/**
 * Local Chat Engine — Fallback conversation when backend is unavailable.
 * Uses complaint-specific decision trees to ask relevant follow-up questions.
 * 
 * Flow:
 *   Patient selects complaint → Engine asks 3-4 relevant questions →
 *   "और कोई दिक्कत है जो डॉक्टर को बताना चाहते हैं?" →
 *   If yes → accept more → ask again →
 *   If no → "धन्यवाद!" → redirect to next step
 */

import { COMPLAINT_DECISION_TREES, COMPLAINT_ICONS } from './constants';

/**
 * Detect complaint ID from user text or icon click
 */
function detectComplaintId(message) {
  const msg = message.toLowerCase();

  // Direct icon IDs
  const directIds = ['headache', 'fever', 'cough', 'chest_pain', 'stomach_pain', 'other'];
  if (directIds.includes(msg)) {
    return msg === 'other' ? null : msg;
  }

  // Hindi/Hinglish/English keyword matching
  if (/सिर|sir|sar|head/.test(msg)) return 'headache';
  if (/बुखार|bukhar|fever|taap/.test(msg)) return 'fever';
  if (/खांसी|khansi|khaansi|cough/.test(msg)) return 'cough';
  if (/छाती|सीने|सीना|chest|seene|chhati/.test(msg)) return 'chest_pain';
  if (/पेट|pet|stomach|tummy/.test(msg)) return 'stomach_pain';

  return null; // unrecognized → generic flow
}

/**
 * Check if user response is negative (no / nahi / bas)
 */
function isNegative(message) {
  const msg = message.toLowerCase().trim();
  const negWords = ['नहीं', 'nahi', 'nhi', 'no', 'nope', 'bas', 'बस', 'na', 'nah', 'kuch nahi', 'कुछ नहीं'];
  return negWords.some(w => msg === w || msg.startsWith(w + ' ') || msg.startsWith(w + ',') || msg.startsWith(w + '.'));
}

/**
 * Get human-readable complaint label
 */
function getComplaintName(complaintId, isHi) {
  const icon = COMPLAINT_ICONS.find(c => c.id === complaintId);
  if (icon) return isHi ? icon.labelHi : icon.label;
  return complaintId || 'Unknown';
}

/**
 * Create a local chat engine instance
 * @param {string} language - 'hi' or 'en'
 * @returns chat engine with processMessage, isDone, getCollectedData methods
 */
export function createChatEngine(language = 'hi') {
  const isHi = language === 'hi';

  // Engine state
  let phase = 'awaiting_complaint'; // awaiting_complaint | asking_questions | closing | extra | done
  let complaintId = null;
  let treeQuestions = []; // questions to ask (excluding the last "aur koi dikkat" question)
  let questionIndex = 0;
  let collectedData = {
    complaint: '',
    complaintId: null,
    answers: [],
    extras: [],
  };

  /**
   * Process a user message and return AI response
   * @returns {{ text: string, isDone: boolean }}
   */
  function processMessage(userMessage) {
    switch (phase) {
      case 'awaiting_complaint':
        return handleComplaint(userMessage);
      case 'asking_questions':
        return handleQuestionAnswer(userMessage);
      case 'closing':
        return handleClosingAnswer(userMessage);
      case 'extra':
        return handleExtraAnswer(userMessage);
      case 'done':
        return { text: isHi ? 'धन्यवाद!' : 'Thank you!', isDone: true };
      default:
        return { text: isHi ? 'धन्यवाद!' : 'Thank you!', isDone: true };
    }
  }

  function handleComplaint(message) {
    complaintId = detectComplaintId(message);
    collectedData.complaint = message;
    collectedData.complaintId = complaintId;

    const tree = complaintId ? COMPLAINT_DECISION_TREES[complaintId] : null;

    if (tree && tree.questions && tree.questions.length > 0) {
      // Use all questions except the last generic "Aur koi dikkat hai?" 
      // We'll handle the closing question ourselves with a more specific phrasing
      const allQ = tree.questions;
      if (allQ.length > 1) {
        treeQuestions = allQ.slice(0, allQ.length - 1); // skip last generic question
      } else {
        treeQuestions = allQ;
      }
      
      phase = 'asking_questions';
      questionIndex = 0;

      const firstQ = treeQuestions[0];
      return {
        text: isHi ? firstQ.textHi : firstQ.textEn,
        isDone: false,
      };
    }

    // No tree found → go straight to closing
    phase = 'closing';
    return {
      text: isHi
        ? 'समझ गया। और कोई दिक्कत है जो आप डॉक्टर को बताना चाहते हैं?'
        : 'I understand. Is there anything else you want to tell the doctor?',
      isDone: false,
    };
  }

  function handleQuestionAnswer(answer) {
    // Save answer to current question
    const currentQ = treeQuestions[questionIndex];
    collectedData.answers.push({
      question: currentQ.text,
      questionHi: currentQ.textHi,
      answer: answer,
    });

    questionIndex++;

    if (questionIndex < treeQuestions.length) {
      // More questions to ask
      const nextQ = treeQuestions[questionIndex];
      return {
        text: isHi ? nextQ.textHi : nextQ.textEn,
        isDone: false,
      };
    }

    // All tree questions done → ask the closing question
    phase = 'closing';
    return {
      text: isHi
        ? 'और कोई दिक्कत है जो आप डॉक्टर के साथ शेयर करना चाहते हैं?'
        : 'Is there anything else you want to share with the doctor?',
      isDone: false,
    };
  }

  function handleClosingAnswer(answer) {
    if (isNegative(answer)) {
      // Patient has nothing more → done
      phase = 'done';
      return {
        text: isHi
          ? 'धन्यवाद! आपकी सारी जानकारी नोट कर ली गई है। अब हम आगे बढ़ते हैं।'
          : 'Thank you! All your information has been recorded. Let\'s move forward.',
        isDone: true,
      };
    }

    // Patient has more to share
    collectedData.extras.push(answer);
    phase = 'extra';
    return {
      text: isHi
        ? 'समझ गया। और कुछ बताना चाहते हैं?'
        : 'Understood. Anything else you want to add?',
      isDone: false,
    };
  }

  function handleExtraAnswer(answer) {
    if (isNegative(answer)) {
      phase = 'done';
      return {
        text: isHi
          ? 'धन्यवाद! आपकी सारी जानकारी नोट कर ली गई है।'
          : 'Thank you! All your information has been noted.',
        isDone: true,
      };
    }

    // More info from patient
    collectedData.extras.push(answer);
    return {
      text: isHi
        ? 'और कुछ बताना चाहते हैं?'
        : 'Anything else?',
      isDone: false,
    };
  }

  function isDone() {
    return phase === 'done';
  }

  function getCollectedData() {
    return { ...collectedData };
  }

  return { processMessage, isDone, getCollectedData };
}
