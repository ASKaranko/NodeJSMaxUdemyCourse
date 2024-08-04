import { Router } from 'jsr:@oak/oak/router';
import { ObjectId } from 'https://deno.land/x/mongo@v0.33.0/deps.ts';
import 'jsr:@std/dotenv/load';

import { getDb } from '../utils/db_client.ts';

const dbName: string = Deno.env.get('MONGO_DATABASE_NAME')!;
const router = new Router();

interface Todo {
    id?: string; // optional
    text: string;
}

router.get('/todos', async (ctx) => {
    const todos = await getDb().collection(dbName).find().toArray(); // Array of {_id: ObjectId, text: string}
    const transformedTodos = todos.map(
        (todo: { _id: ObjectId; text: string }) => {
            return { id: todo._id.toString(), text: todo.text };
        }
    ); // Array of {id: string, text: string}

    ctx.response.body = { todos: transformedTodos };
});

router.post('/todos', async (ctx) => {
    const body = await ctx.request.body.json();
    const newTodo: Todo = {
        text: body.text
    };
    const id = await getDb().collection(dbName).insertOne(newTodo);
    newTodo.id = id.toString();
    console.log('created todo:', newTodo);

    ctx.response.status = 201;
    ctx.response.body = { message: 'Created Todo', todo: newTodo };
});

router.put('/todos/:todoId', async (ctx) => {
    try {
        const tid = ctx.params.todoId;
        const body = await ctx.request.body.json();

        await getDb()
            .collection(dbName)
            .updateOne(
                { _id: new ObjectId(tid) },
                { $set: { text: body.text } }
            );

        ctx.response.status = 200;
        ctx.response.body = {
            message: 'Updated Todo'
        };
    } catch (error) {
        console.log(error);
    }
});

router.delete('/todos/:todoId', async (ctx) => {
    const tid = ctx.params.todoId;

    await getDb()
        .collection(dbName)
        .deleteOne({ _id: new ObjectId(tid) });

    ctx.response.status = 200;
    ctx.response.body = { message: 'Deleted Todo' };
});

export default router;
