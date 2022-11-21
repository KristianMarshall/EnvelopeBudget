'use strict';
const express = require('express');
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

const mysql = require("./mysql/auth");


const PORT = 8080;
const HOST = 'localhost';

app.get('/transactions', (req, res) => {
  res.render('transactions');
});

app.get('/transactionsJson', (req, res) => {
  let con = mysql.getCon(); //TODO: move sql stuff into its own module

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  con.query("SELECT * FROM transaction;", (error, result) => { //TODO: query my transaction view instead of just the select
    res.json(result);
  });

  con.end();

});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});