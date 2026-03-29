const Groq = require('groq-sdk');

// Lazy initialization — client is created on first use so the module
// can be required safely before dotenv has loaded the API key.
let _groq = null;

function getClient() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/**
 * Send a list of messages to Groq and return the assistant's reply.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
async function complete(messages) {
  const response = await getClient().chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama3-70b-8192',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { complete };
