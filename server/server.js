const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for frontend requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Root API overview endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskHive Backend API is running.',
    endpoints: {
      health: '/api/health',
      tasks: '/api/tasks',
      users: '/api/users',
    },
  });
});

// Server and PostgreSQL database health check endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    err.statusCode = 503;
    next(err);
  }
});

// Mount application API routers
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Handle unknown route endpoints
app.use(notFoundHandler);

// Handle internal and validation errors centrally
app.use(errorHandler);

// Verify PostgreSQL connection and start HTTP server when run directly
if (require.main === module) {
  db.query('SELECT NOW()')
    .then(() => {
      console.log('Connected to PostgreSQL database.');
      app.listen(PORT, () => {
        console.log(`TaskHive backend running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to PostgreSQL database:', err.message);
      process.exit(1);
    });
}

module.exports = app;
