const aiService = require('../services/aiService');
const { retrieveRelevantMemories } = require('../services/retrievalService');
const { buildMessages } = require('../services/contextBuilder');
const { updateLastUsed, generateAndSaveMemory } = require('../services/memoryService');

// In-process sliding window — shared across all requests (single-user personal AI)
// Resets on server restart; capped at MAX_BUFFER to prevent memory leaks.
const MAX_BUFFER = 20; // 10 exchanges
const recentMessages = [];

/**
 * POST /chat
 * Body: { message: string }
 */
async function handleChat(req, res) {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  const userMessage = message.trim();

  // 1. Retrieve relevant + personal memories
  const memories = retrieveRelevantMemories(userMessage);

  // 2. Mark retrieved memories as used
  for (const mem of memories.relevant) {
    updateLastUsed(mem.id);
  }
  if (memories.personal) {
    updateLastUsed(memories.personal.id);
  }

  // 3. Assemble context: personality + memories + recent messages + user input
  const messages = buildMessages({ memories, recentMessages, userMessage });

  // 4. Call AI
  const reply = await aiService.complete(messages);

  // 5. Slide the conversation window
  recentMessages.push({ role: 'user', content: userMessage });
  recentMessages.push({ role: 'assistant', content: reply });
  if (recentMessages.length > MAX_BUFFER) {
    recentMessages.splice(0, recentMessages.length - MAX_BUFFER);
  }

  // 6. Persist this exchange to memory asynchronously (non-blocking)
  generateAndSaveMemory([
    { role: 'user', content: userMessage },
    { role: 'assistant', content: reply },
  ]).catch(err => {
    console.error('[Memory] Failed to save:', err.message);
  });

  return res.json({ reply });
}

module.exports = { handleChat };
