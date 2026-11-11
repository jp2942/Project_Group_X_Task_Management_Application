const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// Route for listing all tasks and creating a new task
router.route('/')
  .get(getAllTasks)
  .post(createTask);

// Route for retrieving, updating, or deleting a specific task
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
