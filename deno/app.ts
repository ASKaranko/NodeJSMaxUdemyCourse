import { Application } from "jsr:@oak/oak/application";

import todosRouter from "./routes/todos.ts";

const app = new Application();

// Middleware runs asynchronously
app.use(async (ctx, next) => {
    console.log('Middleware!');
    await next();
});

app.use(todosRouter.routes());
app.use(todosRouter.allowedMethods());

await app.listen({ port: 3000 });