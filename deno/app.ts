import { Application } from 'jsr:@oak/oak/application';

import { connect } from './utils/db_client.ts';
import todosRouter from './routes/todos.ts';

await connect();

const app = new Application();

// Middleware runs asynchronously
app.use(async (ctx, next) => {
    console.log('Middleware!');
    await next();
});

// Middleware to set CORS headers
app.use(async (ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    ctx.response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE'
    );
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    await next();
});

app.use(todosRouter.routes());
app.use(todosRouter.allowedMethods());

await app.listen({ port: 8000 });
