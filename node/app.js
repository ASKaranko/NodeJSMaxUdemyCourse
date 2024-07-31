const express = require('express');
const bodyParser = require('body-parser');
const todosRoutes = require('./routes/todos');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('This always runs!');
    next();
});

app.use(todosRoutes);

app.listen(3000, () => {});
