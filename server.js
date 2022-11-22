'use strict';
const express = require('express');
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

const mysql = require("./mysql/auth");

const PORT = 3000;

app.get('/Transactions', (req, res) => {
  res.render('transactions');
});

app.get('/TransactionsJson', (req, res) => {
  let con = mysql.getCon(); //TODO: move sql stuff into its own module

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  con.query("SELECT * FROM Transactions;", (error, result) => {
    res.json(result);
  });

  con.end();

});

app.get('/CategoryTransfers', (req, res) => {
  res.render('categoryTransfers');
});

app.get('/categoryTransfersJson', (req, res) => {
  let con = mysql.getCon();

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  con.query("SELECT * FROM CategoryTransfers;", (error, result) => {
    res.json(result);
  });

  con.end();

});

app.get('/AccountBalanceJson', (req, res) => {
  let con = mysql.getCon();

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  con.query("SELECT * FROM AccountBalance;", (error, result) => {
    res.json(result);
  });

  con.end();

});

app.listen(PORT, () => {
  console.log(`Node Started`);
});