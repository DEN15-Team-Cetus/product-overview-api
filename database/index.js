/* eslint-disable no-console */
/* eslint-disable comma-dangle */
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  database: 'productOverview',
  user: 'root',
  password: 'password'
});

connection.connect(() => {
  console.log('Connected to the db!');
});

module.exports = connection;
