const fs = require('fs');
const path = require('path');
const { clearPersonalityCache } = require('../services/contextBuilder');

const PERSONALITY_FILE = path.join(__dirname, '../../personality.txt');

/**
 * GET /personality
 * Returns the current personality text
 */
function getPersonality(req, res) {
  if (!fs.existsSync(PERSONALITY_FILE)) {
    return res.status(404).json({ error: 'personality.txt not found.' });
  }
  const content = fs.readFileSync(PERSONALITY_FILE, 'utf8');
  return res.json({ personality: content });
}

/**
 * PUT /personality
 * Body: { personality: string }
 * Replaces the full personality.txt content
 */
function updatePersonality(req, res) {
  const { personality } = req.body;

  if (!personality || typeof personality !== 'string' || personality.trim() === '') {
    return res.status(400).json({ error: 'personality must be a non-empty string.' });
  }

  fs.writeFileSync(PERSONALITY_FILE, personality.trim(), 'utf8');
  clearPersonalityCache(); // force next request to re-read from disk

  return res.json({ message: 'Personality updated.' });
}

module.exports = { getPersonality, updatePersonality };
