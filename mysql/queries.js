const mysql = require("./auth");

function querySql(sql) {
  let con = mysql.getCon();

  con.connect(function (error) {
    if (error) {
      return console.error(error);
    }
  });

  return new Promise((resolve, reject) => {
    con.query(sql, (error, sqlResult) => {
      if (error) {
        console.log(error);  //WAS: return reject(error);
        return resolve(error);
      }

      return resolve(sqlResult);
    });

    con.end();
  });
}

function getTransactionTableData() {
  let transactionsQuery = "SELECT * FROM Transactions;";
  let categoriesQuery = "SELECT categoryID as id, categoryName as name FROM category;";
  let accountsQuery = "SELECT accountID as id, accountName as name FROM BudgetTest.account;";
  let vendorsQuery = "SELECT vendorID as id, vendorName as name FROM vendor;";

  return querySql(`${transactionsQuery} ${categoriesQuery} ${accountsQuery} ${vendorsQuery}`);
}

function getCatTransTableData() {
  return querySql(`
      SELECT * FROM CategoryTransfers; 
      SELECT categoryID as id, categoryName as name FROM category;`
  );
}

function getAccountBalanceData() {
  return querySql(`SELECT * FROM AccountBalance;`);
}

function getAccountReport() {
  return querySql(`call getAccountReport(CURDATE());`);
}

function getDashboardTableData(previousMonthDelta) { //0 is current month and each positive integer is another month in the past

  let dashboardQuery = `call BudgetTest.getDashboardTable(CURDATE() - interval ${previousMonthDelta} month);`;

  //let safeQuery = mysql.functions.format(query, sqlData);

  return querySql(dashboardQuery);
}

function addNewVendor(vendor) {
  return querySql(mysql.functions.format(`INSERT INTO vendor VALUES (0, ?)`, [vendor]));
}

function updateOrAddTransaction(transaction, vendorAddResult) {

  //if a new vendor was added set the vendor id to the new id
  let vendorId = vendorAddResult === undefined ? transaction.transactionIDs[3] : vendorAddResult.insertId;

  let sqlData = [
    transaction.rowData[0],        //Date
    transaction.rowData[1],        //Amount
    transaction.transactionIDs[1], //Id of Category
    transaction.transactionIDs[2], //Id of Account
    vendorId,                      //Id of Vendor
    transaction.rowData[5],        //Memo
    transaction.transactionIDs[4], //Pending
    transaction.transactionIDs[0]  // Transaction Id
  ];

  let query = "";

  if (transaction.transactionIDs[0] !== null)
    query = `
    UPDATE transaction
    SET transactionDate = ?, transactionAmt = ?, categoryID = ?, accountID = ?,
         vendorID = ?, transactionMemo = ?, transactionPending = ?
    WHERE transactionID = ?`;
  else {
    query = `INSERT INTO transaction VALUES
            (0, ?, ?, ?, ?, ?, ?, ?)`;
    sqlData.pop();
  }

  let safeQuery = mysql.functions.format(query, sqlData);

  return querySql(safeQuery);
}

function updateOrAddCatTrans(catTransfer) {

  let sqlData = [
    catTransfer.rowData[0],        //Date
    catTransfer.rowData[1],        //Amount
    catTransfer.catTranIDs[1],     //Id of from Category
    catTransfer.catTranIDs[2],     //Id of to Category
    catTransfer.rowData[4],        //Memo
    catTransfer.catTranIDs[0]  // Transaction Id
  ];

  let query = "";

  if (catTransfer.catTranIDs[0] !== null)
    query = `
      UPDATE categoryTransfer
      SET catTranDate = ?, catTranAmt = ?, fromCategoryID = ?, toCategoryID = ?, catTranMemo = ?
      WHERE catTranID = ?`;
  else {
    query = `INSERT INTO categoryTransfer VALUES
              (0, ?, ?, ?, ?, ?)`;
    sqlData.pop();
  }

  let safeQuery = mysql.functions.format(query, sqlData);

  return querySql(safeQuery)
}

function deleteTransaction(transactionID) {
  let query = "DELETE FROM transaction WHERE transactionID = ?;";
  let safeQuery = mysql.functions.format(query, [transactionID]);

  return querySql(safeQuery);
}

function deleteCatTransfer(catTransID) {
  let query = "DELETE FROM categoryTransfer WHERE catTranID = ?;";
  let safeQuery = mysql.functions.format(query, [catTransID]);

  return querySql(safeQuery);
}

module.exports = {
  getTransactionTableData,
  getCatTransTableData,
  getAccountBalanceData,
  getDashboardTableData,
  addNewVendor,
  updateOrAddTransaction,
  updateOrAddCatTrans,
  deleteTransaction,
  deleteCatTransfer,
  getAccountReport
}