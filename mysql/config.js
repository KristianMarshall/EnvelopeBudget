//Example config for mysql
const mysql = require('mysql');

module.exports = {
  getCon: () => mysql.createConnection({
    host: "localhost",
    user: "your user",
    password: "your password",
    database: "comp206_airbnb",
    multipleStatements: true
  }),
  functions: mysql
};