const db = require('../config/db');
const { createHttpError, parsePositiveInt } = require('../utils/validation');

// Retrieve all team members ordered by ID
const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, name, email FROM users ORDER BY id ASC');
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// Retrieve a single team member by ID
const getUserById = async (req, res, next) => {
  try {
    const userId = parsePositiveInt(req.params.id);
    if (!userId) {
      return next(createHttpError('Invalid user ID.', 400));
    }

    const { rows } = await db.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return next(createHttpError(`User with ID ${userId} not found.`, 404));
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Create a new team member with input validation
const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(createHttpError('User name is required.', 400));
    }
    if (name.trim().length > 100) {
      return next(createHttpError('User name cannot exceed 100 characters.', 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return next(createHttpError('A valid email address is required.', 400));
    }
    if (email.trim().length > 255) {
      return next(createHttpError('Email address cannot exceed 255 characters.', 400));
    }

    const insertQuery = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email';
    const { rows } = await db.query(insertQuery, [name.trim(), email.trim().toLowerCase()]);

    res.status(201).json({ success: true, message: 'User created successfully.', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Delete a team member by ID
const deleteUser = async (req, res, next) => {
  try {
    const userId = parsePositiveInt(req.params.id);
    if (!userId) {
      return next(createHttpError('Invalid user ID.', 400));
    }

    const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [userId]);
    if (rows.length === 0) {
      return next(createHttpError(`User with ID ${userId} not found.`, 404));
    }

    res.status(200).json({ success: true, message: `User '${rows[0].name}' was deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
};
