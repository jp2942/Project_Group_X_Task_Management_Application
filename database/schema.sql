-- Phase 1: Database Setup

-- Table 1: Stores team members who can be assigned tasks

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Table 2: Stores all task information

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,

    priority VARCHAR(10) NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('Low', 'Medium', 'High')),

    status VARCHAR(20) NOT NULL DEFAULT 'To Do'
        CHECK (status IN ('To Do', 'In Progress', 'Completed')),

    assigned_user_id INTEGER NOT NULL
        REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
