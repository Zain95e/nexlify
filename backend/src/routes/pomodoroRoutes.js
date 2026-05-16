const express = require('express');
const pomodoroController = require('../controllers/pomodoroController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);
router.post('/', pomodoroController.logSession);

module.exports = router;
