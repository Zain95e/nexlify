const express = require('express');
const router = express.Router();
const detoxController = require('../controllers/detoxController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.use(authenticateJWT);

// 5.2.4 Log session start/end
router.post('/', detoxController.startSession);
router.patch('/:id', detoxController.endSession);

module.exports = router;
