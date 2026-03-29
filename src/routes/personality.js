const express = require('express');
const router = express.Router();
const { getPersonality, updatePersonality } = require('../controllers/personalityController');

router.get('/', getPersonality);
router.put('/', updatePersonality);

module.exports = router;
