const express = require('express');
const router = express.Router();
const {
  listMemories,
  getMemory,
  updateMemory,
  deleteMemory,
} = require('../controllers/memoryController');

router.get('/', listMemories);
router.get('/:id', getMemory);
router.patch('/:id', updateMemory);
router.delete('/:id', deleteMemory);

module.exports = router;
