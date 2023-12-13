const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node',
    password: 'p9oqzjTeWQJpkw'
});

module.exports = pool.promise();
