
-- Task #8: Sample User and Task Data

-- add sample users
INSERT INTO users (name, email)
VALUES
    ('Jaden Patel', 'jaden@example.com'),
    ('Robyn Hoyt', 'robyn@example.com'),
    ('Anthony Pagnotti', 'anthony@example.com')
ON CONFLICT (email) DO NOTHING;

-- add sample tasks
INSERT INTO tasks (
    title,
    description,
    due_date,
    priority,
    status,
    assigned_user_id
)
VALUES
    (
        'Design Homepage',
        'Create the initial React homepage',
        CURRENT_DATE + 7,
        'High',
        'To Do',
        (SELECT id FROM users WHERE email = 'robyn@example.com')
    ),
    (
        'Set Up Backend',
        'Configure the Express server',
        CURRENT_DATE + 5,
        'Medium',
        'In Progress',
        (SELECT id FROM users WHERE email = 'anthony@example.com')
    ),
    (
        'Test Application',
        'Test the task management features',
        CURRENT_DATE + 10,
        'Low',
        'Completed',
        (SELECT id FROM users WHERE email = 'jaden@example.com')
    );
