const express = require('express');
const goalController = require('../controllers/goalController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

// All goal routes are protected
router.use(authenticateJWT);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.patch('/:id/tasks/:taskId/complete', goalController.completeTask);

module.exports = router;
