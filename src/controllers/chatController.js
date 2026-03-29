const aiService = require('../services/aiService');
const { retrieveRelevantMemories } = require('../services/retrievalService');
const { buildMessages } = require('../services/contextBuilder');
const { updateLastUsed, generateAndSaveMemory } = require('../services/memoryService');

// Per-session sliding window buffers
// Key: session_id (string), Value: Array of {role, content}
const MAX_BUFFER = 20;
const sessions = new Map();

function getSessionBuffer(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId);
}

function pushToBuffer(buffer, userMessage, reply) {
  buffer.push({ role: 'user', content: userMessage });
  buffer.push({ role: 'assistant', content: reply });
  if (buffer.length > MAX_BUFFER) {
    buffer.splice(0, buffer.length - MAX_BUFFER);
  }
}

/**
 * POST /chat
 * Body: { message: string, session_id?: string }
 */
async function handleChat(req, res) {
  const { message, session_id } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  const userMessage = message.trim();
  const sessionId = (typeof session_id === 'string' && session_id.trim()) ? session_id.trim() : 'default';
  const recentMessages = getSessionBuffer(sessionId);

  // 1. Retrieve relevant + personal memories
  const memories = retrieveRelevantMemories(userMessage);

  // 2. Mark retrieved memories as used
  for (const mem of memories.relevant) updateLastUsed(mem.id);
  if (memories.personal) updateLastUsed(memories.personal.id);

  // 3. Assemble full context
  const messages = buildMessages({ memories, recentMessages, userMessage });

  // 4. Call AI
  const reply = await aiService.complete(messages);

  // 5. Slide session window
  pushToBuffer(recentMessages, userMessage, reply);

  // 6. Persist to memory asynchronously (non-blocking)
  generateAndSaveMemory([
    { role: 'user', content: userMessage },
    { role: 'assistant', content: reply },
  ]).catch(err => {
    console.error('[Memory] Failed to save:', err.message);
  });

  return res.json({ reply, session_id: sessionId });
}

module.exports = { handleChat };
