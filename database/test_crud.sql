BEGIN;

-- TEST 1: insert a new task
INSERT INTO tasks (
    title,
    description,
    due_date,
    priority,
    status,
    assigned_user_id
)
VALUES (
    'Phase 1 Database Test',
    'Testing the database CRUD operations',
    CURRENT_DATE + 3,
    'Medium',
    'To Do',
    (SELECT id FROM users
     WHERE email = 'jaden@example.com')
)
RETURNING *;


-- TEST 2: retrieve the test task
SELECT *
FROM tasks
WHERE title = 'Phase 1 Database Test';


-- TEST 3: update the test task
UPDATE tasks
SET
    status = 'Completed',
    priority = 'High'
WHERE title = 'Phase 1 Database Test'
AND assigned_user_id = (
    SELECT id FROM users
    WHERE email = 'jaden@example.com'
)
RETURNING *;


-- TEST 4: delete the test task
DELETE FROM tasks
WHERE title = 'Phase 1 Database Test'
AND assigned_user_id = (
    SELECT id FROM users
    WHERE email = 'jaden@example.com'
)
RETURNING *;


ROLLBACK;
