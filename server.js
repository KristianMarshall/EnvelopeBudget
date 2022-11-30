'use strict';
const express = require('express');
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

const mysql = require("./mysql/auth");

const PORT = 3000;

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/Transactions', (req, res) => {
  res.render('transactions');
});

app.get('/TransactionsJson', (req, res) => {
  let con = mysql.getCon(); 

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  let transactionsQuery = querySql("SELECT * FROM Transactions");
  let categoriesQuery = querySql("SELECT categoryID, categoryName FROM category");
  let accountsQuery = querySql("SELECT accountID, accountName FROM BudgetTest.account");
  let vendorsQuery = querySql("SELECT * FROM vendor");

  Promise.all([transactionsQuery, categoriesQuery, accountsQuery, vendorsQuery])
  .then(queriesData =>{
    res.json({
      transactions: queriesData[0],
      categories:   queriesData[1],
      accounts:     queriesData[2],
      vendors:      queriesData[3],
    });
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

app.get('/DashboardJson', (req, res) => {
  let con = mysql.getCon();
  
  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });
  con.query("SELECT * FROM Dashboard;", (error, result) => {
    res.json(result);
  });
  con.end();
});

app.listen(PORT, () => {
  console.log(`Node Started`);
});

function querySql(sql) {
  let con = mysql.getCon();

  con.connect(function(error) {
      if (error) {
        return console.error(error);
      } 
    });

  return new Promise((resolve, reject) => {
      con.query(sql, (error, sqlResult) => {
          if(error) {
              return reject(error);
          }           

          return resolve(sqlResult);
      });

      con.end();
  });
}