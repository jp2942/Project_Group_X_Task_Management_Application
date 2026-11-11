const db = require('../config/db');
const { createHttpError, parsePositiveInt } = require('../utils/validation');

// Allowed enum values matching Student 2 database check constraints
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['To Do', 'In Progress', 'Completed'];

// Shared SELECT query joining tasks with assigned user details
const TASK_WITH_USER_SELECT = `
  SELECT t.id, t.title, t.description, t.due_date, t.priority, t.status,
         t.assigned_user_id, t.created_at,
         u.name AS assigned_to, u.name AS assigned_user_name, u.email AS assigned_user_email
  FROM tasks t
  JOIN users u ON t.assigned_user_id = u.id
`;

// Verify that a due_date input is a valid non-numeric date string
const isValidDateInput = (value) => {
  return typeof value === 'string' && value.trim() !== '' && !/^\d+$/.test(value.trim()) && !isNaN(Date.parse(value));
};

// Fetch a single joined task record by ID
const fetchTaskWithUser = async (id) => {
  const { rows } = await db.query(`${TASK_WITH_USER_SELECT} WHERE t.id = $1`, [id]);
  return rows[0] || null;
};

// Verify that the referenced user exists in the users table
const ensureUserExists = async (userId) => {
  const { rows } = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    throw createHttpError(`Assigned user with ID ${userId} does not exist.`, 400);
  }
};

// Validate task fields for both creation and partial or full updates
const validateTaskPayload = (body, { isUpdate = false } = {}) => {
  const { title, description, due_date, priority, status, assigned_user_id } = body || {};

  if (isUpdate && title === undefined && description === undefined && due_date === undefined &&
      priority === undefined && status === undefined && assigned_user_id === undefined) {
    throw createHttpError('At least one task field is required to update.', 400);
  }

  if (!isUpdate || title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw createHttpError('Task title is required.', 400);
    }
    if (title.trim().length > 200) {
      throw createHttpError('Task title cannot exceed 200 characters.', 400);
    }
  }

  if (!isUpdate || due_date !== undefined) {
    if (!isValidDateInput(due_date)) {
      throw createHttpError('A valid due date is required.', 400);
    }
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    throw createHttpError(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}.`, 400);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw createHttpError(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}.`, 400);
  }

  if (!isUpdate || assigned_user_id !== undefined) {
    if (!parsePositiveInt(assigned_user_id)) {
      throw createHttpError('A valid assigned user ID is required.', 400);
    }
  }
};

// Fetch all tasks with optional status, priority, assigned_user_id, and search filters
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, assigned_user_id, search } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      if (!VALID_STATUSES.includes(status)) {
        return next(createHttpError(`Invalid status filter. Allowed values: ${VALID_STATUSES.join(', ')}.`, 400));
      }
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (priority && priority !== 'All') {
      if (!VALID_PRIORITIES.includes(priority)) {
        return next(createHttpError(`Invalid priority filter. Allowed values: ${VALID_PRIORITIES.join(', ')}.`, 400));
      }
      params.push(priority);
      conditions.push(`t.priority = $${params.length}`);
    }

    if (assigned_user_id !== undefined && assigned_user_id !== '') {
      const userId = parsePositiveInt(assigned_user_id);
      if (!userId) {
        return next(createHttpError('Invalid assigned_user_id filter.', 400));
      }
      params.push(userId);
      conditions.push(`t.assigned_user_id = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const queryText = `${TASK_WITH_USER_SELECT}${whereClause} ORDER BY t.id ASC`;

    const { rows } = await db.query(queryText, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// Retrieve a single task by ID
const getTaskById = async (req, res, next) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    if (!taskId) {
      return next(createHttpError('Invalid task ID.', 400));
    }

    const task = await fetchTaskWithUser(taskId);
    if (!task) {
      return next(createHttpError(`Task with ID ${taskId} not found.`, 404));
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// Create a new task with input validation
const createTask = async (req, res, next) => {
  try {
    validateTaskPayload(req.body, { isUpdate: false });

    const { title, description, due_date, priority = 'Medium', status = 'To Do', assigned_user_id } = req.body;
    const userId = parsePositiveInt(assigned_user_id);
    await ensureUserExists(userId);

    const insertText = `
      INSERT INTO tasks (title, description, due_date, priority, status, assigned_user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [title.trim(), description ? String(description).trim() : null, due_date, priority, status, userId];
    const { rows } = await db.query(insertText, values);

    const createdTask = await fetchTaskWithUser(rows[0].id);
    res.status(201).json({ success: true, message: 'Task created successfully.', data: createdTask });
  } catch (err) {
    next(err);
  }
};

// Update an existing task with partial or full field updates
const updateTask = async (req, res, next) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    if (!taskId) {
      return next(createHttpError('Invalid task ID.', 400));
    }

    validateTaskPayload(req.body, { isUpdate: true });

    const existingResult = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (existingResult.rows.length === 0) {
      return next(createHttpError(`Task with ID ${taskId} not found.`, 404));
    }
    const current = existingResult.rows[0];

    const { title, description, due_date, priority, status, assigned_user_id } = req.body;
    const targetUserId = assigned_user_id !== undefined ? parsePositiveInt(assigned_user_id) : current.assigned_user_id;
    if (assigned_user_id !== undefined) {
      await ensureUserExists(targetUserId);
    }

    const updateValues = [
      title !== undefined ? title.trim() : current.title,
      description !== undefined ? (description ? String(description).trim() : null) : current.description,
      due_date !== undefined ? due_date : current.due_date,
      priority !== undefined ? priority : current.priority,
      status !== undefined ? status : current.status,
      targetUserId,
      taskId,
    ];

    const updateQuery = `
      UPDATE tasks
      SET title = $1, description = $2, due_date = $3, priority = $4, status = $5, assigned_user_id = $6
      WHERE id = $7
    `;
    await db.query(updateQuery, updateValues);

    const updatedTask = await fetchTaskWithUser(taskId);
    res.status(200).json({ success: true, message: 'Task updated successfully.', data: updatedTask });
  } catch (err) {
    next(err);
  }
};

// Delete a task by ID
const deleteTask = async (req, res, next) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    if (!taskId) {
      return next(createHttpError('Invalid task ID.', 400));
    }

    const { rows } = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id, title', [taskId]);
    if (rows.length === 0) {
      return next(createHttpError(`Task with ID ${taskId} not found.`, 404));
    }

    res.status(200).json({ success: true, message: `Task '${rows[0].title}' was deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
