const fs = require('fs');
const path = require('path');

const PERSONALITY_FILE = path.join(__dirname, '../../personality.txt');
const MAX_RECENT_MESSAGES = 6; // last 3 exchanges

// ---------------------------------------------------------------------------
// Load personality from disk (cached after first read)
// ---------------------------------------------------------------------------

let _personalityCache = null;

function loadPersonality() {
  if (_personalityCache !== null) return _personalityCache;
  if (!fs.existsSync(PERSONALITY_FILE)) {
    _personalityCache = '';
    return '';
  }
  _personalityCache = fs.readFileSync(PERSONALITY_FILE, 'utf8').trim();
  return _personalityCache;
}

// ---------------------------------------------------------------------------
// Format a retrieved memory's conversation as readable text
// ---------------------------------------------------------------------------

function formatConversation(messages) {
  return messages
    .map(m => `${m.role === 'user' ? 'Architect' : 'Hyzen'}: ${m.content}`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Build the final message array to send to the AI
// ---------------------------------------------------------------------------

/**
 * @param {{ relevant: Array, personal: object|null }} memories
 * @param {Array<{role: string, content: string}>} recentMessages  — sliding window buffer
 * @param {string} userMessage — current user input
 * @returns {Array<{role: string, content: string}>}
 */
function buildMessages({ memories, recentMessages, userMessage }) {
  const messages = [];

  // 1. Personality — always first, as system prompt
  const personality = loadPersonality();
  if (personality) {
    messages.push({ role: 'system', content: personality });
  }

  // 2. Memory context — injected as a system block so it never confuses roles
  const memoryParts = [];

  if (memories.relevant.length > 0) {
    memoryParts.push('## Relevant Past Conversations');
    for (const mem of memories.relevant) {
      memoryParts.push(`### Topic: ${mem.summary}`);
      if (mem.conversation && mem.conversation.length) {
        memoryParts.push(formatConversation(mem.conversation));
      }
      if (mem.key_points && mem.key_points.length) {
        memoryParts.push(`Key points: ${mem.key_points.join(' | ')}`);
      }
    }
  }

  if (memories.personal) {
    const p = memories.personal;
    memoryParts.push('## Personal Context About the Architect');
    memoryParts.push(`Summary: ${p.summary}`);
    if (p.key_points && p.key_points.length) {
      memoryParts.push(`Details: ${p.key_points.join(' | ')}`);
    }
  }

  if (memoryParts.length > 0) {
    messages.push({
      role: 'system',
      content: memoryParts.join('\n\n'),
    });
  }

  // 3. Recent conversation — sliding window (oldest first)
  const window = recentMessages.slice(-MAX_RECENT_MESSAGES);
  for (const msg of window) {
    messages.push(msg);
  }

  // 4. Current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

// Expose for testing personality hot-reload
function clearPersonalityCache() {
  _personalityCache = null;
}

module.exports = { buildMessages, loadPersonality, clearPersonalityCache };
