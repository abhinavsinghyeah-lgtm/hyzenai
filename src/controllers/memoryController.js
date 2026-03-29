const fs = require('fs');
const { readIndex, writeIndex, readMemoryFile } = require('../services/memoryService');

/**
 * GET /memory
 * Returns the full index (metadata only, no conversation content)
 */
function listMemories(req, res) {
  const index = readIndex();
  return res.json({ count: index.length, memories: index });
}

/**
 * GET /memory/:id
 * Returns a single memory entry including its full conversation
 */
function getMemory(req, res) {
  const index = readIndex();
  const entry = index.find(e => e.id === req.params.id);

  if (!entry) {
    return res.status(404).json({ error: 'Memory not found.' });
  }

  return res.json({
    ...entry,
    conversation: readMemoryFile(entry.file_path),
  });
}

/**
 * PATCH /memory/:id
 * Update importance, type, tags, summary, or key_points
 */
function updateMemory(req, res) {
  const index = readIndex();
  const entryIndex = index.findIndex(e => e.id === req.params.id);

  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Memory not found.' });
  }

  const allowed = ['importance', 'type', 'tags', 'summary', 'key_points'];
  const updates = req.body;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      if (key === 'importance') {
        const val = Number(updates[key]);
        if (!Number.isInteger(val) || val < 1 || val > 10) {
          return res.status(400).json({ error: 'importance must be an integer between 1 and 10.' });
        }
        index[entryIndex][key] = val;
      } else if (key === 'type') {
        if (!['personal', 'fact'].includes(updates[key])) {
          return res.status(400).json({ error: 'type must be "personal" or "fact".' });
        }
        index[entryIndex][key] = updates[key];
      } else {
        index[entryIndex][key] = updates[key];
      }
    }
  }

  writeIndex(index);
  return res.json({ message: 'Memory updated.', memory: index[entryIndex] });
}

/**
 * DELETE /memory/:id
 * Remove a memory entry and its conversation file
 */
function deleteMemory(req, res) {
  const index = readIndex();
  const entryIndex = index.findIndex(e => e.id === req.params.id);

  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Memory not found.' });
  }

  const [entry] = index.splice(entryIndex, 1);

  // Delete the conversation file if it exists
  if (entry.file_path && fs.existsSync(entry.file_path)) {
    fs.unlinkSync(entry.file_path);
  }

  writeIndex(index);
  return res.json({ message: `Memory ${entry.id} deleted.` });
}

module.exports = { listMemories, getMemory, updateMemory, deleteMemory };
