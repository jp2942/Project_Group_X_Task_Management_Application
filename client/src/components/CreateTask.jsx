import { useState } from 'react'

function CreateTask() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState('Medium')
    const [status, setStatus] = useState('To Do')
    const [assignedUser, setAssignedUser] = useState('')

    function handleSubmit(event) {
        event.preventDefault()

        console.log({
            title,
            description,
            dueDate,
            priority,
            status,
            assignedUser
        })
    }

    return (
        <section className="create-task">
            <h2>Create Task</h2>

            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter task title"
                    required
                />

                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Enter task description"
                />

                <label>Due Date</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    required
                />

                <label>Priority</label>
                <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>

                <label>Status</label>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                </select>

                <label>Assign To</label>
                <input
                    type="text"
                    value={assignedUser}
                    onChange={(event) => setAssignedUser(event.target.value)}
                    placeholder="Enter user"
                    required
                />

                <button type="submit">Create Task</button>
            </form>
        </section>
    )
}

export default CreateTask