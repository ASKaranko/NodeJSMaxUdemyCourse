import { Router } from 'express';
import { ToDo } from '../models/todo';

type RequestBody = { text: string };
type RequestParams = { todoId: string };

let todos: Array<ToDo> = [];

const router = Router();
router.get('/', (req, res, next) => {
    res.status(200).json({ todos });
});

router.post('/todo', (req, res, next) => {
    // req.body will be an object with a text property
    const body = req.body as RequestBody;

    const newTodo: ToDo = {
        id: new Date().toISOString(),
        text: body.text
    };
    todos.push(newTodo);

    res.status(201).json({ message: 'Added Todo', todo: newTodo, todos });
});

//replace a todo
router.put('/todo/:todoId', (req, res, next) => {
    const body = req.body as RequestBody;
    const params = req.params as RequestParams;
    
    const todoId = params.todoId;
    const todoIndex = todos.findIndex((todoItem) => todoItem.id === todoId);
    if (todoIndex >= 0) {
        todos[todoIndex] = { id: todos[todoIndex].id, text: body.text };
        //don't forget to return the updated todo, to not use 2 responses
        return res.status(200).json({ message: 'Updated todo', todos });
    }
    res.status(404).json({ message: 'Could not find todo for this id.' });
});

//delete a todo
router.delete('/todo/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;
    todos = todos.filter((todoItem) => todoItem.id !== params.todoId);
    res.status(200).json({ message: 'Todo deleted', todos });
});

export default router;
