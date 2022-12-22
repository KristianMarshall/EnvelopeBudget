//Example config for mysql
const mysql = require('mysql');

module.exports = {
  getCon: () => mysql.createConnection({
    host: "localhost",
    user: "your user",
    password: "your password",
    database: "BudgetTest",
    multipleStatements: true
  }),
  functions: mysql
};