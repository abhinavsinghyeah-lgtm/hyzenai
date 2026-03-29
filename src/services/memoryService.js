const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../../memory');
const FILES_DIR = path.join(MEMORY_DIR, 'files');
const MAIN_JSON = path.join(MEMORY_DIR, 'main.json');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureDirs() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
  if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });
  if (!fs.existsSync(MAIN_JSON)) fs.writeFileSync(MAIN_JSON, '[]', 'utf8');
}

function extractJson(text) {
  // 1. Try direct parse
  try { return JSON.parse(text); } catch {}
  // 2. Try stripping markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch {}
  }
  // 3. Try extracting first raw JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public: read / write index
// ---------------------------------------------------------------------------

function readIndex() {
  ensureDirs();
  return JSON.parse(fs.readFileSync(MAIN_JSON, 'utf8'));
}

function writeIndex(entries) {
  fs.writeFileSync(MAIN_JSON, JSON.stringify(entries, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Public: read a full conversation file
// ---------------------------------------------------------------------------

function readMemoryFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public: persist a new memory entry
// ---------------------------------------------------------------------------

function saveMemory({ conversation, summary, key_points, tags, type, importance }) {
  ensureDirs();

  const index = readIndex();
  const id = `mem_${Date.now()}`;
  const filePath = path.join(FILES_DIR, `${id}.json`);
  const now = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2), 'utf8');

  const entry = {
    id,
    summary: summary || 'Untitled conversation',
    key_points: Array.isArray(key_points) ? key_points : [],
    tags: Array.isArray(tags) ? tags : [],
    file_path: filePath,
    type: type === 'personal' ? 'personal' : 'fact',
    importance: typeof importance === 'number' ? Math.min(10, Math.max(1, importance)) : 5,
    created_at: now,
    last_used: now,
  };

  index.push(entry);
  writeIndex(index);

  console.log(`[Memory] Saved: ${id} — "${entry.summary}"`);
  return entry;
}

// ---------------------------------------------------------------------------
// Public: update last_used timestamp on a memory entry
// ---------------------------------------------------------------------------

function updateLastUsed(id) {
  const index = readIndex();
  const entry = index.find(e => e.id === id);
  if (entry) {
    entry.last_used = new Date().toISOString();
    writeIndex(index);
  }
}

// ---------------------------------------------------------------------------
// Public: use AI to generate metadata, then save — fire-and-forget friendly
// ---------------------------------------------------------------------------

async function generateAndSaveMemory(conversation) {
  // Lazy require to avoid circular dependency
  const aiService = require('./aiService');

  const conversationText = conversation
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const prompt = `Analyze the following conversation and respond ONLY with a valid JSON object. No markdown, no explanation, no extra text.

JSON schema:
{
  "summary": "One sentence describing what was discussed",
  "key_points": ["3 to 5 short factual points from the conversation"],
  "tags": ["2 to 5 lowercase single-word tags"],
  "type": "personal or fact",
  "importance": 5
}

Rules:
- type = "personal" if the conversation involves emotions, stress, personal life, relationships, mental state, or feelings; otherwise "fact"
- importance = integer 1–10; personal memories with strong emotion = 7–10; casual chat = 3–5; technical facts = 5–7
- tags must be lowercase single words

Conversation:
${conversationText}`;

  const raw = await aiService.complete([{ role: 'user', content: prompt }]);
  const meta = extractJson(raw);

  if (!meta) {
    console.error('[Memory] Could not parse meta JSON from AI response. Skipping save.');
    return;
  }

  saveMemory({
    conversation,
    summary: meta.summary,
    key_points: meta.key_points,
    tags: meta.tags,
    type: meta.type,
    importance: meta.importance,
  });
}

module.exports = {
  readIndex,
  readMemoryFile,
  saveMemory,
  updateLastUsed,
  generateAndSaveMemory,
};
