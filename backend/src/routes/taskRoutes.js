const express = require('express');
const taskController = require('../controllers/taskController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

// All task routes are protected
router.use(authenticateJWT);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.patch('/:id/complete', taskController.completeTask);
router.patch('/:id/incomplete', taskController.incompleteTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
