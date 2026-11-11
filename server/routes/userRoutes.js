const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
} = require('../controllers/userController');

// Route for getting all users and registering a new user
router.route('/')
  .get(getAllUsers)
  .post(createUser);

// Route for retrieving or deleting a specific user
router.route('/:id')
  .get(getUserById)
  .delete(deleteUser);

module.exports = router;
