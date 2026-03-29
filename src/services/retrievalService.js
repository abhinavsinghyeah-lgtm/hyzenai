const { readIndex, readMemoryFile } = require('./memoryService');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PERSONAL_MAX_AGE_DAYS = 14;
const PERSONAL_HIGH_IMPORTANCE = 8;

// Words that signal a memory is personal / emotional
const PERSONAL_SIGNAL_WORDS = new Set([
  'feel', 'feeling', 'felt', 'stress', 'stressed', 'anxious', 'anxiety',
  'happy', 'happiness', 'sad', 'sadness', 'worried', 'worry', 'excited',
  'tired', 'exhausted', 'love', 'hate', 'life', 'family', 'friend',
  'relationship', 'emotion', 'emotional', 'mental', 'dream', 'hope', 'fear',
  'lonely', 'overwhelmed', 'proud', 'frustrated', 'angry', 'grief', 'loss',
]);

// ---------------------------------------------------------------------------
// Keyword extraction — removes stop words and short tokens
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'are', 'was', 'were',
  'have', 'has', 'had', 'can', 'will', 'what', 'when', 'where', 'who',
  'how', 'why', 'but', 'not', 'from', 'they', 'them', 'their', 'your',
  'you', 'its', 'about', 'also', 'just', 'more', 'than', 'into',
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

// ---------------------------------------------------------------------------
// Scoring — summary match +3, key_points match +5, tags match +2
// ---------------------------------------------------------------------------

function scoreEntry(entry, keywords) {
  let score = 0;

  for (const kw of keywords) {
    if (entry.summary.toLowerCase().includes(kw)) score += 3;

    for (const kp of entry.key_points) {
      if (kp.toLowerCase().includes(kw)) score += 5;
    }

    for (const tag of entry.tags) {
      if (tag.toLowerCase().includes(kw)) score += 2;
    }
  }

  return score;
}

// ---------------------------------------------------------------------------
// Personal memory filter — recent OR high importance
// ---------------------------------------------------------------------------

function isIncludablePersonalMemory(entry) {
  if (entry.type !== 'personal') return false;

  const ageMs = Date.now() - new Date(entry.created_at).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays <= PERSONAL_MAX_AGE_DAYS) return true;
  if (entry.importance > PERSONAL_HIGH_IMPORTANCE) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Main retrieval function
// ---------------------------------------------------------------------------

/**
 * Given a user message, return:
 *   relevant — top 2 keyword-scored memory entries (with full conversation loaded)
 *   personal — most recent includable personal memory (with full conversation loaded)
 *
 * @param {string} userMessage
 * @returns {{ relevant: Array, personal: object|null }}
 */
function retrieveRelevantMemories(userMessage) {
  const index = readIndex();

  if (!index.length) return { relevant: [], personal: null };

  const keywords = extractKeywords(userMessage);

  // Score every entry and take top 2 with score > 0
  const top2 = index
    .map(entry => ({ entry, score: scoreEntry(entry, keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ entry }) => ({
      ...entry,
      conversation: readMemoryFile(entry.file_path),
    }));

  // Most recent personal memory that passes the age/importance gate
  const personalEntry = index
    .filter(isIncludablePersonalMemory)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  const personal = personalEntry
    ? { ...personalEntry, conversation: readMemoryFile(personalEntry.file_path) }
    : null;

  return { relevant: top2, personal };
}

module.exports = { retrieveRelevantMemories };
