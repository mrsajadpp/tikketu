const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASS,
    database: 'tikketu'
});

module.exports = connection; 