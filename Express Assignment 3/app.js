const express = require('express');
const path = require('path');

const rootRoutes = require('./routes/root');
const userRoutes = require('./routes/users');

const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(rootRoutes.routes);
app.use(userRoutes);

app.listen(3000);