const { Router } = require('express');

const router = Router();

let todos = [];

router.get('/todos', (req, res, next) => {
    res.json({ todos: todos });
});

router.post('/todos', (req, res, next) => {
    const newTodo = {
        id: new Date().toISOString(),
        text: req.body.text
    };

    todos.push(newTodo);

    res.status(201).json({ message: 'Created Todo', todo: newTodo });
});

router.put('/todos/:todoId', (req, res, next) => {
    const tid = req.params.todoId;
    const todoIndex = todos.findIndex(todoItem => todoItem.id === tid);
    todos[todoIndex] = { id: todos[todoIndex].id, text: req.body.text };
    res.status(200).json({ message: 'Updated Todo', updatedTodo: todos[todoIndex] });
});

router.delete('/todos/:todoId', (req, res, next) => {
    const tid = req.params.todoId;
    todos = todos.filter(todoItem => todoItem.id !== tid);
    res.status(200).json({ message: 'Deleted Todo' });
});

module.exports = router;