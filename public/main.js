// public/main.js

let token = '';
let currentPage = 1;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error) });
        }
        return response.json();
    })
    .then(data => {
        token = data.accessToken;
        document.getElementById('auth').style.display = 'none';
        document.getElementById('task-manager').style.display = 'block';
        loadTasks();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed: ' + error.message);
    });
}

function createTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;

    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, dueDate, priority })
    })
    .then(response => response.json())
    .then(task => {
        console.log('Task created:', task);
        addTaskToDOM(task);
    })
    .catch(error => console.error('Error:', error));
}

function loadTasks() {
    fetch(`/tasks?page=${currentPage}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(tasks => {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';  // Clear existing tasks
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
        currentPage++;
    })
    .catch(error => console.error('Error:', error));
}

function addTaskToDOM(task) {
    const taskList = document.getElementById('task-list');
    const taskDiv = document.createElement('div');
    taskDiv.className = `task ${task.priority}`;
    taskDiv.id = `task-${task.id}`;
    taskDiv.innerHTML = `
        <h3>${task.title}</h3>
        <p>Due Date: ${task.dueDate}</p>
        <p>Status: ${task.status}</p>
        <p>Priority: ${task.priority}</p>
        <button onclick="deleteTask(${task.id})">Delete</button>
        <button onclick="markCompleted(${task.id})">Mark Completed</button>
        <button onclick="changePriority(${task.id})">Change Priority</button>
    `;
    taskList.appendChild(taskDiv);
}

function deleteTask(id) {
    fetch(`/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(task => {
        console.log('Task deleted:', task);
        removeTaskFromDOM(id);
    })
    .catch(error => console.error('Error:', error));
}

function removeTaskFromDOM(id) {
    const taskDiv = document.getElementById(`task-${id}`);
    if (taskDiv) {
        taskDiv.remove();
    }
}

function markCompleted(id) {
    fetch(`/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
    })
    .then(response => response.json())
    .then(task => {
        console.log('Task updated:', task);
        updateTaskStatusInDOM(task);
    })
    .catch(error => console.error('Error:', error));
}

function updateTaskStatusInDOM(task) {
    const taskDiv = document.getElementById(`task-${task.id}`);
    if (taskDiv) {
        const statusParagraph = taskDiv.querySelector('p:nth-of-type(2)');
        statusParagraph.textContent = `Status: ${task.status}`;
    }
}

function changePriority(id) {
    const newPriority = prompt('Enter new priority (low, medium, high):');
    if (newPriority !== 'low' && newPriority !== 'medium' && newPriority !== 'high') {
        alert('Invalid priority');
        return;
    }

    fetch(`/tasks/${id}/priority`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priority: newPriority })
    })
    .then(response => response.json())
    .then(task => {
        console.log('Task priority updated:', task);
        updateTaskPriorityInDOM(task);
    })
    .catch(error => console.error('Error:', error));
}

function updateTaskPriorityInDOM(task) {
    const taskDiv = document.getElementById(`task-${task.id}`);
    if (taskDiv) {
        taskDiv.className = `task ${task.priority}`;
        const priorityParagraph = taskDiv.querySelector('p:nth-of-type(3)');
        priorityParagraph.textContent = `Priority: ${task.priority}`;
    }
}
