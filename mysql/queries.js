const mysql = require('mysql2');
const config = require("./auth");

config.dbInfo.database = "BudgetTest";
const poolTest = mysql.createPool(config.dbInfo);
config.dbInfo.database = "Budget";
const poolReal = mysql.createPool(config.dbInfo);

let pool = poolTest;

function querySql(sql) {

  return new Promise((resolve, reject) => {
    pool.query(sql, (error, sqlResult) => {
      if (error) {
        console.log(error);  //WAS: return reject(error);
        return resolve(error);
      }

      return resolve(sqlResult);
    });

  });
}

function getTransactionTableData(page, take) {
  let transactionsQuery = `SELECT * FROM Transactions LIMIT ?, ?;`;
  let categoriesQuery = "SELECT categoryID as id, categoryName as name FROM category;";
  let accountsQuery = "SELECT accountID as id, accountName as name FROM account;";
  let vendorsQuery = "SELECT vendorID as id, vendorName as name FROM vendor;";

  let safeQuery = mysql.format(`${transactionsQuery} ${categoriesQuery} ${accountsQuery} ${vendorsQuery}`, [page*take, take]);

  return querySql(safeQuery);
}

function getSettingsTable() {

  let categoriesQuery = "SELECT * FROM Categories;";
  let categoryGroupsQuery = `SELECT * FROM catGroup;`;
  let timeOptionsQuery = `SELECT timeOpID AS id, timeOpName AS name FROM timeOptions`;

  return querySql(`${categoriesQuery} ${categoryGroupsQuery} ${timeOptionsQuery}`);
}

function getCatTransTableData(page, take) {

  let safeQuery = mysql.format(`
  SELECT * FROM CategoryTransfers LIMIT ?, ?; 
  SELECT categoryID as id, categoryName as name FROM category;`,
  [page*take, take]);

  return querySql(safeQuery);
}

function getAccountBalanceData(pending) {
  let query = `SELECT * FROM AccountBalance;`;
  if(pending)
    query = `SELECT * FROM AccountPendingBalance;`

  return querySql(query);
}

function getAccountReport() {
  return querySql(`call getAccountReport(CURDATE());`);
}

function getDashboardTableData(previousMonthDelta) { //0 is current month and each positive integer is another month in the past

  let dashboardQuery = `call getDashboardTable(CURDATE() - interval ${previousMonthDelta} month);`;

  //let safeQuery = mysql.format(query, sqlData);

  return querySql(dashboardQuery);
}

function addNewVendor(vendor) {
  return querySql(mysql.format(`INSERT INTO vendor VALUES (0, ?)`, [vendor]));
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

  let safeQuery = mysql.format(query, sqlData);

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

  let safeQuery = mysql.format(query, sqlData);

  return querySql(safeQuery)
}

function deleteTransaction(transactionID) {
  let query = "DELETE FROM transaction WHERE transactionID = ?;";
  let safeQuery = mysql.format(query, [transactionID]);

  return querySql(safeQuery);
}

function deleteCatTransfer(catTransID) {
  let query = "DELETE FROM categoryTransfer WHERE catTranID = ?;";
  let safeQuery = mysql.format(query, [catTransID]);

  return querySql(safeQuery);
}

function setSettings(settings){
  if(settings.database == "Budget") 
    pool = poolReal;
  else
    pool = poolTest; 
  return true;
}

module.exports = { //TODO: turn this into a module
  getTransactionTableData,
  getCatTransTableData,
  getAccountBalanceData,
  getDashboardTableData,
  addNewVendor,
  updateOrAddTransaction,
  updateOrAddCatTrans,
  deleteTransaction,
  deleteCatTransfer,
  getAccountReport,
  getSettingsTable,
  setSettings
}