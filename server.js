'use strict';
const express = require('express');
const app = express();
app.use(express.static("public"));
app.use(express.json());
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

  let transactionsQuery = querySql("SELECT * FROM Transactions"); //TODO: should convert to multiple query
  let categoriesQuery = querySql("SELECT categoryID as id, categoryName as name FROM category");
  let accountsQuery = querySql("SELECT accountID as id, accountName as name FROM BudgetTest.account");
  let vendorsQuery = querySql("SELECT vendorID as id, vendorName as name FROM vendor");

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
  let con = mysql.getCon(); //TODO: should use the sqlQuery function

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  con.query(`
  SELECT * FROM CategoryTransfers; 
  SELECT categoryID as id, categoryName as name FROM category;`, 
  (error, result) => {
    res.json(result);
  });

  con.end();

});

app.get('/AccountBalanceJson', (req, res) => {
  let con = mysql.getCon(); //TODO: should use the sqlQuery function

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
  let con = mysql.getCon(); //TODO: should use the sqlQuery function
  
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

app.get('/githubPull', (req, res) => {
  const { exec } = require('child_process');
  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
    res.redirect('/');
  });
});

app.post('/transactionSubmitJson', (req, res) => {

  //if a new vendor was added we need to add it to the database before adding/updating the transaction
  if(req.body.transactionIDs[3] === -1){
    querySql(mysql.functions.format(`INSERT INTO vendor VALUES (0, ?)`, [req.body.rowData[4]]))
    .then(result => {
      console.log(result);
      updateOrAddTransaction(res, req, result);
    });
  } else 
    updateOrAddTransaction(res, req);
  
});

app.post('/transactionDeleteJson', (req, res) => {

  let query = "DELETE FROM transaction WHERE transactionID = ?;";

  let safeQuery = mysql.functions.format(query, [req.body.id]);

  querySql(safeQuery).then(result => {
      console.log(result);
      res.json(result);
  });
  
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
            console.log(error);  //WAS: return reject(error);
            return resolve(error);
          }           

          return resolve(sqlResult);
      });

      con.end();
  });
}

function updateOrAddTransaction(res, req , vendorAddResult){

  //if a new vendor was added set the vendor id to the new id
  let vendorId = vendorAddResult === undefined ? req.body.transactionIDs[3] : vendorAddResult.insertId;

  let sqlData = [
    req.body.rowData[0],        //Date
    req.body.rowData[1],        //Amount
    req.body.transactionIDs[1], //Id of Category
    req.body.transactionIDs[2], //Id of Account
    vendorId,                   //Id of Vendor
    req.body.rowData[5],        //Memo
    req.body.transactionIDs[0]  // Transaction Id
  ];
  
  let query = "";

  if(req.body.transactionIDs[0] !== null)
    query = `
    UPDATE transaction
    SET transactionDate = ?, transactionAmt = ?, categoryID = ?, accountID = ?, vendorID = ?, transactionMemo = ?
    WHERE transactionID = ?`;
  else{
    query = `INSERT INTO transaction VALUES
            (0, ?, ?, ?, ?, ?, ?, DEFAULT)`;
    sqlData.pop();
  }

  let safeQuery = mysql.functions.format(query, sqlData);

  querySql(safeQuery).then(result => {
      console.log(result);
      res.json({transactionResult: result, vendorResult: vendorAddResult});
  });
}