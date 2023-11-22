const express = require('express');
const path = require('path');

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(userRoutes);
app.use(mainRoutes);
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(3000);