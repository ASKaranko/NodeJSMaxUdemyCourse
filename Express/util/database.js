const Sequelize = require('sequelize');

const sequelize = new Sequelize('node', 'root', 'p9oqzjTeWQJpkw', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;