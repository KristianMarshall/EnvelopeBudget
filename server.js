'use strict';
const express = require('express');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.set('view engine', 'ejs');

const queries = require('./mysql/queries');

const PORT = 3000;

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/Transactions', (req, res) => {
  res.render('transactions');
});

app.get('/TransactionsJson', (req, res) => {

  queries.getTransactionTableData()
  .then(queriesData =>{
    res.json({
      transactions: queriesData[0],
      categories:   queriesData[1],
      accounts:     queriesData[2],
      vendors:      queriesData[3],
    });
  });
});

app.get('/CategoryTransfers', (req, res) => {
  res.render('categoryTransfers');
});

app.get('/AccountReport', (req, res) => {
  res.render('accountReport');
});

app.get('/categoryTransfersJson', (req, res) => {

  queries.getCatTransTableData().then(queriesData => {
    res.json(queriesData);
  });
});

app.get('/AccountBalanceJson', (req, res) => {

  queries.getAccountBalanceData().then( result => {
    res.json(result);
  });
});

app.get('/DashboardJson', (req, res) => {
  queries.getDashboardTableData(req.query.month).then( result => {
    res.json(result);
  });
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
    queries.addNewVendor(req.body.rowData[4]).then(vendorAddResult => {
      console.log(vendorAddResult);
      queries.updateOrAddTransaction(req.body, vendorAddResult)
      .then(result => returnTransactionResult(res, result, vendorAddResult));
    });
  } else 
      queries.updateOrAddTransaction(req.body)
      .then(result => returnTransactionResult(res, result));
});

function returnTransactionResult(res, transactionResult, vendorAddResult){
      console.log(transactionResult);
      res.json({transactionResult: transactionResult, vendorResult: vendorAddResult});
}

app.post('/catTransSubmitJson', (req, res) => {
  queries.updateOrAddCatTrans(req.body).then(result => {
    console.log(result);
    res.json(result);
  });
});

app.post('/transactionDeleteJson', (req, res) => {

  queries.deleteTransaction(req.body.id).then(result => {
    console.log(result);
    res.json(result);
  });
});

app.post('/catTranDeleteJson', (req, res) => {

  queries.deleteCatTransfer(req.body.id).then(result => {
      console.log(result);
      res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Node Started`);
});