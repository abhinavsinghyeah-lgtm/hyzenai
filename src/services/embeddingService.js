const DEBUG = process.env.DEBUG === 'true';

// ---------------------------------------------------------------------------
// In-memory cache: memoryId -> float[]
// Avoids recomputing embeddings for stored memories within a session
// ---------------------------------------------------------------------------

const _cache = new Map();

function getCached(id) {
  return _cache.get(id) || null;
}

function setCached(id, embedding) {
  _cache.set(id, embedding);
}

// ---------------------------------------------------------------------------
// Embedding generation via OpenAI text-embedding-3-small (256 dims)
// Uses Node.js built-in fetch (Node 18+)
// Returns null if OPENAI_API_KEY is not set or the call fails
// ---------------------------------------------------------------------------

async function generateEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // stay within token limits
        dimensions: 256,            // compact; accurate enough for personal AI
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      if (DEBUG) console.error('[Embedding] API error:', err);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (err) {
    if (DEBUG) console.error('[Embedding] Failed:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cosine similarity — returns 0–1 for text embeddings
// ---------------------------------------------------------------------------

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { generateEmbedding, cosineSimilarity, getCached, setCached };
