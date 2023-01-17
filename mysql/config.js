//Example config for mysql
const mysql = require('mysql2');

module.exports = {
  getPool: () => mysql.createPool({
    host: "localhost",
    user: "your user",
    password: "your password",
    database: "BudgetTest",
    multipleStatements: true,
    decimalNumbers: true
  }),
  functions: mysql
};