const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
const { pool } = require('../config/db');

let server;
let baseUrl;

// Send JSON HTTP requests to the test server
async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

describe('TaskHive Backend API Integration Tests', () => {
  // Start Express on an ephemeral port before running tests
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  // Close HTTP server and PostgreSQL pool after tests complete
  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  it('verifies PostgreSQL connectivity via health check', async () => {
    const { status, body } = await request('/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'healthy');
    assert.equal(body.database, 'connected');
  });

  it('lists seeded users and seeded tasks with assigned user fields', async () => {
    const usersRes = await request('/api/users');
    assert.equal(usersRes.status, 200);
    assert.equal(usersRes.body.success, true);
    assert.ok(usersRes.body.data.length >= 1);

    const tasksRes = await request('/api/tasks');
    assert.equal(tasksRes.status, 200);
    assert.equal(tasksRes.body.success, true);
    if (tasksRes.body.data.length > 0) {
      assert.ok('assigned_to' in tasksRes.body.data[0]);
      assert.ok('assigned_user_name' in tasksRes.body.data[0]);
      assert.ok('assigned_user_id' in tasksRes.body.data[0]);
    }
  });

  it('completes full task CRUD workflow and cleans up test record', async () => {
    const usersRes = await request('/api/users');
    const firstUserId = usersRes.body.data[0].id;

    // Create a new task
    const createRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Integration Test Task',
        description: 'Testing Express and PostgreSQL CRUD flow',
        due_date: '2026-12-01',
        priority: 'High',
        status: 'To Do',
        assigned_user_id: firstUserId,
      }),
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.data.title, 'Integration Test Task');
    assert.equal(createRes.body.data.assigned_to, usersRes.body.data[0].name);
    const createdId = createRes.body.data.id;

    // Read the newly created task by ID
    const getRes = await request(`/api/tasks/${createdId}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.id, createdId);

    // Filter tasks using query parameters
    const filterRes = await request(`/api/tasks?status=To%20Do&priority=High&assigned_user_id=${firstUserId}&search=Integration`);
    assert.equal(filterRes.status, 200);
    assert.ok(filterRes.body.data.some((t) => t.id === createdId));

    // Full update using PUT
    const putRes = await request(`/api/tasks/${createdId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Integration Test Task',
        priority: 'Medium',
      }),
    });
    assert.equal(putRes.status, 200);
    assert.equal(putRes.body.data.title, 'Updated Integration Test Task');
    assert.equal(putRes.body.data.priority, 'Medium');

    // Partial status update using PATCH
    const patchRes = await request(`/api/tasks/${createdId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.body.data.status, 'Completed');

    // Delete the test task
    const deleteRes = await request(`/api/tasks/${createdId}`, { method: 'DELETE' });
    assert.equal(deleteRes.status, 200);

    // Confirm 404 after deletion
    const missingRes = await request(`/api/tasks/${createdId}`);
    assert.equal(missingRes.status, 404);
  });

  it('rejects invalid task operations and malformed requests with proper errors', async () => {
    const emptyTitle = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: '', due_date: '2026-12-01', assigned_user_id: 1 }),
    });
    assert.equal(emptyTitle.status, 400);

    const invalidDate = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Valid', due_date: 'not-a-date', assigned_user_id: 1 }),
    });
    assert.equal(invalidDate.status, 400);

    const invalidPriority = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Valid', due_date: '2026-12-01', priority: 'Urgent', assigned_user_id: 1 }),
    });
    assert.equal(invalidPriority.status, 400);

    const invalidStatus = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Valid', due_date: '2026-12-01', status: 'Archived', assigned_user_id: 1 }),
    });
    assert.equal(invalidStatus.status, 400);

    const unknownUser = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Valid', due_date: '2026-12-01', assigned_user_id: 999999 }),
    });
    assert.equal(unknownUser.status, 400);

    const invalidFilter = await request('/api/tasks?status=Unknown');
    assert.equal(invalidFilter.status, 400);

    const badId = await request('/api/tasks/abc');
    assert.equal(badId.status, 400);

    const emptyUpdate = await request('/api/tasks/1', {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    assert.equal(emptyUpdate.status, 400);

    const badJson = await request('/api/tasks', {
      method: 'POST',
      body: '{bad json',
    });
    assert.equal(badJson.status, 400);

    const unknownRoute = await request('/api/nonexistent');
    assert.equal(unknownRoute.status, 404);
  });

  it('handles user creation, duplicate email conflicts, and deletion cleanup', async () => {
    const email = `temp.test.${Date.now()}@example.com`;
    const createUserRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Temp User', email }),
    });
    assert.equal(createUserRes.status, 201);
    const tempUserId = createUserRes.body.data.id;

    // Duplicate email should return 409 Conflict
    const dupRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Dup User', email }),
    });
    assert.equal(dupRes.status, 409);

    // Clean up temporary user
    const deleteRes = await request(`/api/users/${tempUserId}`, { method: 'DELETE' });
    assert.equal(deleteRes.status, 200);
  });
});
