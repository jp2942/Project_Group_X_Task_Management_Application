# TaskHive Database

This folder has the PostgreSQL database files for our Task Management App. The database stores users and tasks so the app can create, view, edit, and delete tasks.

## Database Tables

The database has two tables:

Users
- id: Unique ID for each user
- name: User's name
- email: User's email address

Tasks
- id: Unique ID for each task
- title: Task name
- description: Task details
- due_date: Task deadline
- priority: Low, Medium, or High
- status: To Do, In Progress, or Completed
- assigned_user_id: ID of the user assigned to the task
- created_at: Date and time the task was created

The tables are connected through assigned_user_id, which references the user's ID in the users table. This allows one user to have multiple tasks assigned to them.

## Files

- schema.sql - Creates the users and tasks tables.
- crud.sql - Contains SQL for adding, viewing, updating, and deleting tasks.
- seed.sql - Adds sample users and tasks for testing.
- test_crud.sql - Tests the CRUD operations without permanently changing the sample data.

## Setting Up the Database

1. Open pgAdmin and connect to your PostgreSQL server.
2. Create a new database called taskhive.
3. Open the Query Tool for that database.
4. Run schema.sql to create the tables.
5. Run seed.sql to add the sample data.
6. Check that the users and tasks were added.

Only run the setup files once on a new database to avoid errors or duplicate sample tasks.

## Testing

I tested the database by creating, viewing, updating, and deleting tasks. I also used a separate test file with a transaction and ROLLBACK so the sample data wouldn't be affected.

The Express backend will connect to this database to handle task requests from the React frontend.

Make sure to use the same table names and column names when connecting the backend.
