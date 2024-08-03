import { Router } from 'jsr:@oak/oak/router';

const router = new Router();

interface Todo {
    id: string;
    text: string;
}

let todos: Todo[] = [];

router.get('/todos', (ctx) => {
    ctx.response.body = { todos: todos };
});

router.post('/todos', async (ctx) => {
    const body = await ctx.request.body.json();

    const newTodo: Todo = {
        id: new Date().toISOString(),
        text: body.text
    };

    todos.push(newTodo);
    console.log('created todo:', newTodo);
    

    ctx.response.status = 201;
    ctx.response.body = { message: 'Created Todo', todo: newTodo };
});

router.put('/todos/:todoId', async (ctx) => {
    const tid = ctx.params.todoId;
    const body = await ctx.request.body.json();

    const todoIndex = todos.findIndex((todoItem) => todoItem.id === tid);
    todos[todoIndex] = { id: todos[todoIndex].id, text: body.text };

    ctx.response.status = 200;
    ctx.response.body = {
        message: 'Updated Todo',
        updatedTodo: todos[todoIndex]
    };
});

router.delete('/todos/:todoId', async (ctx) => {
    const tid = ctx.params.todoId;

    todos = todos.filter((todoItem) => todoItem.id !== tid);

    ctx.response.status = 200;
    ctx.response.body = { message: 'Deleted Todo' };
});

export default router;
