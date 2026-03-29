const { readIndex, readMemoryFile, updateEmbedding } = require('./memoryService');
const { generateEmbedding, cosineSimilarity, getCached, setCached } = require('./embeddingService');

// ---------------------------------------------------------------------------
// Config — weights are configurable via environment variables
// ---------------------------------------------------------------------------

const PERSONAL_MAX_AGE_DAYS = 14;
const PERSONAL_HIGH_IMPORTANCE = 8;
const DEBUG = process.env.DEBUG === 'true';

// Keyword score is normalized to 0–1 using this soft cap before weighting
const KEYWORD_NORM_CAP = 20;

// Blend weights — must sum to 1 for intuitive scoring but not required
const KEYWORD_WEIGHT  = parseFloat(process.env.KEYWORD_WEIGHT  || '0.5');
const SEMANTIC_WEIGHT = parseFloat(process.env.SEMANTIC_WEIGHT || '0.5');

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
// Keyword scoring — summary +3, key_points +5, tags +2
// ---------------------------------------------------------------------------

function keywordScore(entry, keywords) {
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

  const ageDays = (Date.now() - new Date(entry.created_at).getTime()) / 86400000;

  return ageDays <= PERSONAL_MAX_AGE_DAYS || entry.importance > PERSONAL_HIGH_IMPORTANCE;
}

// ---------------------------------------------------------------------------
// Lazy embedding back-fill — for memories saved before embeddings were added
// Fire-and-forget: does not block the current request
// ---------------------------------------------------------------------------

function backfillEmbedding(entry) {
  const text = `${entry.summary} ${entry.key_points.join(' ')}`;
  generateEmbedding(text)
    .then(vec => {
      if (vec) {
        setCached(entry.id, vec);
        updateEmbedding(entry.id, vec);
        if (DEBUG) console.log(`[Retrieval] Back-filled embedding for ${entry.id}`);
      }
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Main retrieval — async (generates user embedding for semantic comparison)
// ---------------------------------------------------------------------------

/**
 * @param {string} userMessage
 * @returns {Promise<{ relevant: Array, personal: object|null }>}
 */
async function retrieveRelevantMemories(userMessage) {
  const index = readIndex();

  if (!index.length) return { relevant: [], personal: null };

  const keywords = extractKeywords(userMessage);

  // Generate embedding for the current user message
  const userEmbedding = await generateEmbedding(userMessage).catch(() => null);
  const semanticEnabled = !!userEmbedding;

  if (DEBUG) console.log(`[Retrieval] Semantic: ${semanticEnabled ? 'enabled' : 'disabled (no key or API error)'}`);

  const scored = index.map(entry => {
    // --- Keyword score (normalized 0–1) ---
    const rawKeyword = keywordScore(entry, keywords);
    const normKeyword = Math.min(rawKeyword / KEYWORD_NORM_CAP, 1);

    // --- Semantic score (0–1) ---
    let normSemantic = 0;
    if (semanticEnabled) {
      // Use in-memory cache first, then stored embedding, else skip + back-fill
      let entryEmbedding = getCached(entry.id);

      if (!entryEmbedding && Array.isArray(entry.embedding)) {
        entryEmbedding = entry.embedding;
        setCached(entry.id, entryEmbedding); // warm cache
      }

      if (entryEmbedding) {
        normSemantic = Math.max(0, cosineSimilarity(userEmbedding, entryEmbedding));
      } else {
        // No embedding stored — back-fill asynchronously for future requests
        backfillEmbedding(entry);
      }
    }

    const finalScore = (normKeyword * KEYWORD_WEIGHT) + (normSemantic * SEMANTIC_WEIGHT);

    if (DEBUG && (rawKeyword > 0 || normSemantic > 0)) {
      console.log(
        `[Retrieval] ${entry.id} | keyword=${rawKeyword}(${normKeyword.toFixed(2)}) ` +
        `semantic=${normSemantic.toFixed(3)} final=${finalScore.toFixed(3)} | "${entry.summary.slice(0, 50)}"`
      );
    }

    return { entry, finalScore };
  });

  // Top 2 by final score (must have any signal)
  const top2 = scored
    .filter(({ finalScore }) => finalScore > 0)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 2)
    .map(({ entry }) => ({
      ...entry,
      conversation: readMemoryFile(entry.file_path),
    }));

  // Most recent valid personal memory
  const personalEntry = index
    .filter(isIncludablePersonalMemory)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  const personal = personalEntry
    ? { ...personalEntry, conversation: readMemoryFile(personalEntry.file_path) }
    : null;

  if (DEBUG) console.log(`[Retrieval] Selected ${top2.length} relevant + ${personal ? 1 : 0} personal`);

  return { relevant: top2, personal };
}

module.exports = { retrieveRelevantMemories };

