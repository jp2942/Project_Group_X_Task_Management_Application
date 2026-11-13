import { useState } from 'react'
import CreateTask from './components/CreateTask'
import EditTask from './components/EditTask'
import './App.css'

function App() {
  const [page, setPage] = useState('dashboard')
  const sampleTask = {
    title: 'Finish project proposal',
    description: 'Complete and review the project proposal before submission',
    dueDate: '2026-11-15',
    priority: 'High',
    status: 'In Progress',
    assignedUser: 'User123',
  }

   return (
    <div className="app">
      <aside className="sidebar">
         <h1>TaskHive</h1>

        <nav>
          <button onClick={() => setPage('dashboard')}>Dashboard</button>
          <button onClick={() => setPage('tasks')}>Tasks</button>
          <button onClick={() => setPage('create')}>Create Task</button>
        </nav>

        <div className="user-info">
          <p>User123</p>
          <p>user@example.com</p>
        </div>
      </aside>

      <main className="main-content">
        {page === 'dashboard' && (
          <>
            <h2>Dashboard</h2>
            <p>Welcome back!</p>

            <div className="dashboard-cards">
              <div className="card">
                <h3>18</h3>
                <p>Total Tasks</p>
              </div>

              <div className="card">
                <h3>10</h3>
                <p>Completed</p>
              </div>

              <div className="card">
                <h3>4</h3>
                <p>Overdue</p>
              </div>

              <div className="card">
                <h3>4</h3>
                <p>Upcoming</p>
              </div>
            </div>

            <section className="dashboard-task">
              <h2>Recent Tasks</h2>
              <div className="task-card">
                <h3>Finish project proposal</h3>
                <p>Complete and review the project proposal before submission</p>
                <p><strong>Priority:</strong> High</p>
                <p><strong>Status:</strong> In Progress</p>
                <p><strong>Assigned To:</strong> User123</p>
              </div>
            </section>
          </>
        )}

        {page === 'tasks' && (
          <section className="task-list">
            <h2>Tasks</h2>

            <div className="task-card">
              <h3>Finish project proposal</h3>
              <p>Complete and review the project proposal before submission</p>
              <p><strong>Due Date:</strong> November 15, 2026</p>
              <p><strong>Priority:</strong> High</p>
              <p><strong>Status:</strong> In Progress</p>
              <p><strong>Assigned To:</strong> User123</p>

              <button onClick={() => setPage('edit')}>Edit</button>
            </div>
          </section>
        )}
      
        {page === 'create' && <CreateTask />}
        {page === 'edit' && <EditTask task={sampleTask} />}
      </main>
    </div>
  )
}

export default App