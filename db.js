const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(require('express-session'));

const options = {
  host: 'localhost',
  port: 3306,

  database: 'group_project_test',
};

const connection = mysql.createConnection(options);

const sessionStore = new MySQLStore({
  createDatabaseTable: true,
  charset: 'utf8mb4_bin',
  expiration: 86400000,
  checkExpirationInterval: 900000,
  clearExpired: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
}, connection);

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log("Connected to mySQL");
  }
});

module.exports = { connection, sessionStore };