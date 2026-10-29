const express = require('express');
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

router.get('/stats', getStats);
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
