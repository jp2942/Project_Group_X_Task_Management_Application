-- Task #5: Database Development

-- SETUP: create a temp user for testing
INSERT INTO users (name, email)
VALUES ('CRUD Test User', 'crud.test@taskhive.example')
ON CONFLICT (email) DO NOTHING;


-- CREATE: add a new task
INSERT INTO tasks (
    title,
    description,
    due_date,
    priority,
    status,
    assigned_user_id
)
VALUES (
    'Complete Project Report',
    'Finish the Phase 1 project report',
    CURRENT_DATE + 7,
    'Medium',
    'To Do',
    (SELECT id FROM users
     WHERE email = 'crud.test@taskhive.example')
)
RETURNING *;


-- READ view tasks and their assigned users
SELECT
    tasks.id,
    tasks.title,
    tasks.description,
    tasks.due_date,
    tasks.priority,
    tasks.status,
    users.name AS assigned_to
FROM tasks
JOIN users
    ON tasks.assigned_user_id = users.id
ORDER BY tasks.id;


-- UPDATE: change the task status and priority
UPDATE tasks
SET
    status = 'In Progress',
    priority = 'High'
WHERE title = 'Complete Project Report'
    AND assigned_user_id = (
        SELECT id FROM users
        WHERE email = 'crud.test@taskhive.example'
    )
RETURNING *;


-- DELETE: remove the test task
DELETE FROM tasks
WHERE title = 'Complete Project Report'
    AND assigned_user_id = (
        SELECT id FROM users
        WHERE email = 'crud.test@taskhive.example'
    )
RETURNING *;


-- CLEANUP: remove the temporary testing user
DELETE FROM users
WHERE email = 'crud.test@taskhive.example';
