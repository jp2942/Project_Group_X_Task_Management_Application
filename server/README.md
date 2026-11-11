# TaskHive Backend API (Express + PostgreSQL)

Backend REST API for the TaskHive task management application, built to integrate with the PostgreSQL schema and seed files from the `Student2` branch.

## Setup

### 1. Initialize PostgreSQL Database (from `Student2`)

Ensure PostgreSQL is running and create the database using the SQL scripts from `Student2`:

```bash
psql -U postgres -c "CREATE DATABASE task_management;"
psql -U postgres -d task_management -f ../database/schema.sql
psql -U postgres -d task_management -f ../database/seed.sql
```

### 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`) or `DATABASE_URL`.

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

The server listens on `http://localhost:5000` by default.

### 4. Run Integration Tests

```bash
npm test
```

## API Endpoints

### Health Check
- `GET /api/health` - Verifies server and PostgreSQL database connectivity

### Tasks (`/api/tasks`)
- `GET /api/tasks` - List tasks with assigned user details (`assigned_to`, `assigned_user_name`, `assigned_user_email`, `assigned_user_id`). Supports query filters: `status`, `priority`, `assigned_user_id`, `search`.
- `GET /api/tasks/:id` - Retrieve a single task by ID
- `POST /api/tasks` - Create a new task (`title`, `due_date`, `assigned_user_id`, optional `description`, `priority`, `status`)
- `PUT /api/tasks/:id` - Update task fields
- `PATCH /api/tasks/:id` - Partially update task fields (e.g., status change)
- `DELETE /api/tasks/:id` - Delete a task

### Users (`/api/users`)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Retrieve a single user by ID
- `POST /api/users` - Create a new user (`name`, `email`)
- `DELETE /api/users/:id` - Delete a user (blocked with `400` if user has assigned tasks)

## Error Responses

All failed requests and invalid operations return a consistent JSON structure:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```
