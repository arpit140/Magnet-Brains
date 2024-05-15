// app.js

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Dummy database with your user
let tasks = [];
let users = [{ username: 'arpit', password: '123' }];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
}

// Routes

// User authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken });
});

// Task creation
app.post('/tasks', authenticateToken, (req, res) => {
    const { title, description, dueDate, priority } = req.body;
    const task = { id: tasks.length + 1, title, description, dueDate, priority, status: 'pending' };
    tasks.push(task);
    res.status(201).json(task);
});

// Task list with pagination and Ajax
app.get('/tasks', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedTasks = tasks.slice(startIndex, endIndex);
    res.json(paginatedTasks);
});

// Task details
app.get('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(task => task.id === id);
    if (!task) return res.status(404).json({ error: 'Not Found' });
    res.json(task);
});

// Task editing
app.put('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, dueDate, priority } = req.body;
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Not Found' });

    tasks[taskIndex] = { id, title, description, dueDate, priority, status: 'pending' };
    res.json(tasks[taskIndex]);
});

// Task deletion with confirmation dialogue
app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Not Found' });

    const deletedTask = tasks.splice(taskIndex, 1);
    res.json(deletedTask);
});

// Task status update
app.patch('/tasks/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { status, priority } = req.body;
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Not Found' });

    if (status) tasks[taskIndex].status = status;
    if (priority) tasks[taskIndex].priority = priority;
    res.json(tasks[taskIndex]);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
