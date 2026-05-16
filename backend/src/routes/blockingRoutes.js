const express = require('express');
const router = express.Router();
const blockingController = require('../controllers/blockingController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.use(authenticateJWT);

// 5.1.5 Sync override events to backend
router.post('/overrides', blockingController.recordOverride);

module.exports = router;
