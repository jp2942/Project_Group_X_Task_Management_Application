import { useState } from 'react'

function EditTask({ task }) {
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description)
    const [dueDate, setDueDate] = useState(task.dueDate)
    const [priority, setPriority] = useState(task.priority)
    const [status, setStatus] = useState(task.status)
    const [assignedUser, setAssignedUser] = useState(task.assignedUser)

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
            <h2>Edit Task</h2>

            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />

                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
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
                    required
                />

                <button type="submit">Save Changes</button>
            </form>
        </section>
    )
}

export default EditTask