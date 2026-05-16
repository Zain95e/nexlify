const express = require('express');
const pomodoroController = require('../controllers/pomodoroController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);
router.post('/', pomodoroController.logSession);
router.get('/today', pomodoroController.getTodayStats);

module.exports = router;
