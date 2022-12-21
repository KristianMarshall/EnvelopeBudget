DROP DATABASE IF EXISTS BudgetTest;
CREATE DATABASE BudgetTest;
USE BudgetTest;

CREATE TABLE catGroup
(
	catGroupID			MEDIUMINT 	NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	catGroupName		VARCHAR(20) NOT NULL
);

CREATE TABLE timeOptions
(
	timeOpID		MEDIUMINT 		NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	timeOpName		VARCHAR(20) 	NOT NULL,
	timeOpLength	MEDIUMINT		NOT NULL
);

CREATE TABLE category
(
	categoryID			MEDIUMINT 		NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	categoryName		VARCHAR(20) 	NOT NULL,
	categoryHidden		BOOLEAN 		NOT NULL 	DEFAULT 0,
	categoryBudget		DECIMAL(8 ,2)	DEFAULT 0,
	timeOpID			MEDIUMINT,
		CONSTRAINT	category_fk_timeOptions
		FOREIGN KEY(timeOpID)				
        REFERENCES timeOptions(timeOpID),
	categoryDate		DATE,
    catGroupID 			MEDIUMINT,
		CONSTRAINT	category_fk_catGroups
		FOREIGN KEY(catGroupID)				
        REFERENCES catGroup(catGroupID)
);

CREATE TABLE account
(
	accountID			MEDIUMINT 	NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	accountName			VARCHAR(20)	NOT NULL,
	accountHidden		BOOLEAN 	NOT NULL 	DEFAULT 0
);

CREATE TABLE vendor
(
	vendorID			MEDIUMINT 	NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	vendorName			VARCHAR(20)	NOT NULL
);

-- //TODO: Add users

CREATE TABLE transaction
(
	transactionID			MEDIUMINT 		NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	transactionDate			DATE			NOT NULL,
	transactionAmt			DECIMAL(8 ,2)	NOT NULL,
    categoryID 				MEDIUMINT		NOT NULL,
		CONSTRAINT	transaction_fk_category
		FOREIGN KEY(categoryID)				
        REFERENCES category(categoryID),
	accountID 				MEDIUMINT		NOT NULL,
		CONSTRAINT	transaction_fk_accounts
		FOREIGN KEY(accountID)				
        REFERENCES account(accountID),
	vendorID 				MEDIUMINT,
		CONSTRAINT	transaction_fk_vendor
		FOREIGN KEY(vendorID)				
        REFERENCES vendor(vendorID),
	transactionMemo			VARCHAR(150),
    transactionNotCleared	BOOLEAN		NOT NULL	DEFAULT 0
);

CREATE TABLE categoryTransfer
(
	catTranID			MEDIUMINT 		NOT NULL 	AUTO_INCREMENT		PRIMARY KEY,
	catTranDate			DATE			NOT NULL,
	catTranAmt			DECIMAL(8 ,2)	NOT NULL,
	fromCategoryID 		MEDIUMINT		NOT NULL,
		CONSTRAINT	categoryTransfer_fk_category_from
		FOREIGN KEY(fromCategoryID)				
        REFERENCES category(categoryID),
	toCategoryID 		MEDIUMINT		NOT NULL,
		CONSTRAINT	categoryTransfer_fk_category_to
		FOREIGN KEY(toCategoryID)				
        REFERENCES category(categoryID),
	catTranMemo			VARCHAR(100)
);



--------- TEST DATA ------------

-- catGroupID, catGroupName
INSERT INTO catGroup VALUES 
(0, 'Built-in'),
(0, 'Expenses'),
(0, 'Spending Money'),
(0, 'Bills'),
(0, 'Car Bills'),
(0, 'Long-Term Funds');

-- timeOpID, timeOpName, timeOpLength
INSERT INTO timeOptions VALUES
(0, 'Yearly', 		1),
(0, 'Monthly', 		12),
(0, 'Bi-Weekly',	26),
(0, 'Weekly', 		52),
(0, 'Daily', 		365);

-- categoryID, categoryName, categoryHidden, categoryBudget, categoryTime, categoryDate, catGroupID
INSERT INTO category VALUES 
(0, 'Available to Budget', 	DEFAULT, 2000,	 	 2, NULL, 1),
(0, 'Account Transfer', 	DEFAULT, NULL,	   NULL, NULL, 1),
(0, 'Dining Out', 			DEFAULT, 100,		 3, NULL, 2),
(0, 'Fun Money', 			DEFAULT,  75,		 3, NULL, 3),
(0, 'Electric Bill', 		DEFAULT, 150,		 2, NULL, 4),
(0, 'Car Loan', 			DEFAULT, 118.04,	 3, NULL, 5),
(0, 'Vacation', 			DEFAULT, 200,		 3, NULL, 6),
(0, 'Groceries', 			DEFAULT, 200,		 3, NULL, 2),
(0, 'Rent', 				DEFAULT, 1040.72,	 3, NULL, 2),
(0, 'Emergency Fund', 		DEFAULT, 75,		 3, NULL, 6),
(0, 'Internet', 			DEFAULT, 101.64,	 2, NULL, 4);

-- accountID, accountName, accountHidden
INSERT INTO account VALUES 
(0, 'Spending', 	DEFAULT),
(0, 'Savings', 		DEFAULT),
(0, 'Cash', 		DEFAULT);

-- vendorID, vendorName
INSERT INTO vendor VALUES
(0, 'East Side Marios'),
(0, 'Walmart'),
(0, 'Taco Bell');

-- transactionID, transactionDate, transactionAmt, categoryID, accountID, vendorID, transactionMemo, transactionNotCleared
INSERT INTO transaction VALUES
(0,	'2022-01-01', 2000, 	 1, 1, NULL, 	'Start Of Budget',	DEFAULT),
(0,	'2022-01-01', 8000, 	 1, 2, NULL, 	'Start Of Budget',	DEFAULT),
(0,	'2022-01-25', -50.00,	 3, 1, 1, 		'Date Night',		DEFAULT),
(0,	'2022-01-27', -75.23, 	 8, 1, 2, 		'Few Things', 		DEFAULT),
(0,	'2022-01-30', -45.27, 	 4, 1, NULL, 	'game', 			DEFAULT),
(0,	'2022-02-01', -1040.38,  9, 1, NULL, 	'Rent', 			DEFAULT),
(0,	'2022-02-02', -250, 	 2, 1, NULL, 	'Move to savings', 	DEFAULT),
(0,	'2022-02-02', 250, 		 2, 2, NULL, 	'Move to savings', 	DEFAULT),
(0,	'2022-02-01', -15.72, 	 3, 1, 3, 		NULL,			 	DEFAULT),
(0,	'2022-02-01', 1423.58, 	 1, 1, NULL, 	'Paycheque', 		DEFAULT),
(0,	'2022-12-15', -18.37, 	 3, 1, 3, 		NULL,			 	DEFAULT),
(0,	'2022-12-17', -75.48, 	 5, 1, NULL, 	NULL,			 	DEFAULT);

-- catTranID, catTranDate, catTranAmt, fromCategoryID, toCategoryID, catTranMemo
INSERT INTO categoryTransfer VALUES
(0, '2022-01-01', 1040.38,  1,  9, NULL),
(0, '2022-01-01', 100,  	1,  3, NULL),
(0, '2022-01-01', 250,  	1,  8, NULL),
(0, '2022-01-01', 150,  	1,  4, NULL),
(0, '2022-02-01', 25,  		4,  5, NULL),
(0, '2022-02-02', 25,  		4,  5, NULL),
(0, '2022-02-01', 150,  	1, 	5, NULL),
(0, '2022-12-10', 2000,  	1, 10, NULL),
(0, '2022-12-05', 82,  		1, 	6, NULL),
(0, '2022-02-01', 1040.38,  1, 	9, NULL);

-- Views

-- Category View
CREATE VIEW Categories AS
SELECT categoryID, categoryName, categoryHidden, categoryBudget, timeOpName, categoryDate, catGroupName 
FROM BudgetTest.category c
	LEFT JOIN timeOptions timeO
    ON c.timeOpID = timeO.timeOpID
    LEFT JOIN catGroup cT
    on c.catGroupID = cT.catGroupID;

-- Transaction View
CREATE VIEW Transactions AS
SELECT transactionID, t.categoryID, t.accountID, t.vendorID, transactionDate as Date, transactionAmt as Amount, categoryName as Category, accountName as Account, vendorName as Vendor, transactionMemo as Memo
FROM BudgetTest.transaction t
	JOIN category c
    ON t.categoryID = c.categoryID
    JOIN account a
    ON t.accountID = a.accountID
    LEFT JOIN vendor v
    ON t.vendorID = v.vendorID
ORDER BY transactionDate DESC, transactionID DESC;

-- Account Balance View
CREATE VIEW AccountBalance AS
SELECT  SUM(transactionAmt) as balance, accountName
FROM BudgetTest.transaction t
	JOIN category c
    ON t.categoryID = c.categoryID
    JOIN account a
    ON t.accountID = a.accountID
    LEFT JOIN vendor v
    ON t.vendorID = v.vendorID
GROUP BY accountName;

-- Category Transaction View
CREATE VIEW CategoryTransfers AS
SELECT catTranID, fromCategoryID, toCategoryID, catTranDate as "Date", catTranAmt as "Amount", fC.categoryName as "From Category",  tC.categoryName as "To Category", catTranMemo as "Memo"
FROM BudgetTest.categoryTransfer cT
	join category tC
    on cT.toCategoryID = tC.categoryID
    join category fC
    on cT.fromCategoryID = fC.categoryID
ORDER BY catTranDate DESC, catTranID DESC;

-- Category Activity View
CREATE VIEW CategoryActivity AS
SELECT  t.categoryID, SUM(transactionAmt) as Activity, categoryName as Category
FROM BudgetTest.transaction t
	join category c
    on t.categoryID = c.categoryID
    join account a
    on t.accountID = a.accountID
    left join vendor v
    on t.vendorID = v.vendorID
WHERE NOT (t.categoryID = 2) 
GROUP BY Category, t.categoryID;

-- Category Total Budgeted View
CREATE VIEW CategoryTotalBudgeted AS
SELECT categoryID, SUM(Activity) AS Activity, Category
FROM (	SELECT categoryID, SUM(catTranAmt) as Activity, tC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category tC
			on cT.toCategoryID = tC.categoryID
		GROUP BY Category, categoryID
			UNION
		SELECT categoryID, SUM(catTranAmt)*-1 as Activity, fC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category fC
			on cT.fromCategoryID = fC.categoryID
		GROUP BY Category, categoryID
	  ) as AlmostCategoryBalances
GROUP BY Category, categoryID;

-- Category Balance VIEW
CREATE VIEW CategoryBalance AS
SELECT categoryID, SUM(Activity) as Balance
FROM	(SELECT categoryID, Activity
		FROM CategoryActivity
			UNION
		SELECT categoryID, Activity
		FROM CategoryTotalBudgeted) as AlmostCategoryBalance
GROUP BY categoryID;

-- Dashboard VIEW
CREATE VIEW Dashboard AS
SELECT tB.categoryID, tB.category as Category, Balance, cA.Activity, tB.Activity as "Total Budgeted"
FROM BudgetTest.CategoryTotalBudgeted tB
	LEFT JOIN BudgetTest.CategoryActivity cA
    ON cA.categoryID = tB.categoryID
    JOIN BudgetTest.CategoryBalance cB
    ON tB.categoryID = cB.categoryID;

-- Stored Procedures
DELIMITER $$


-- Account Balance Ending on Date
CREATE PROCEDURE AccountBalanceOnDate(date DATE)
BEGIN
SELECT  SUM(transactionAmt), accountName
FROM BudgetTest.transaction t
	JOIN category c
    ON t.categoryID = c.categoryID
    JOIN account a
    ON t.accountID = a.accountID
    LEFT JOIN vendor v
    ON t.vendorID = v.vendorID
WHERE transactionDate <= date
GROUP BY accountName;
END$$

-- Category Balance Ending on Date
CREATE PROCEDURE CategoryBalanceOnDate(date DATE)
BEGIN
SELECT SUM(Activity) as Balance, Category
FROM	(SELECT  SUM(transactionAmt) as Activity, categoryName as Category
		 FROM BudgetTest.transaction t
			join category c
			on t.categoryID = c.categoryID
			join account a
			on t.accountID = a.accountID
			left join vendor v
			on t.vendorID = v.vendorID
		 WHERE NOT (t.categoryID = 2) 
			AND transactionDate <= date
		 GROUP BY Category
				UNION
		SELECT SUM(catTranAmt) as Activity, tC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category tC
			on cT.toCategoryID = tC.categoryID
		WHERE catTranDate <= date
		GROUP BY Category
				UNION
		SELECT SUM(catTranAmt)*-1 as Activity, fC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category fC
			on cT.fromCategoryID = fC.categoryID
		WHERE catTranDate <= date
		GROUP BY Category
		) as AlmostCategoryBalance
GROUP BY Category;
END$$

-- Total Spent Between Dates
CREATE PROCEDURE SpentBetweenDates(fromDate DATE, toDate DATE)
BEGIN
SELECT SUM(transactionAmt) as Spent
FROM BudgetTest.transaction
WHERE transactionAmt < 0 
	AND (transactionDate BETWEEN fromDate AND toDate)
    AND NOT categoryID = 2;
END$$

-- Total Income Between Dates
CREATE PROCEDURE IncomeBetweenDates(fromDate DATE, toDate DATE)
BEGIN
SELECT SUM(transactionAmt) as Income
FROM BudgetTest.transaction
WHERE transactionAmt > 0 
	AND (transactionDate BETWEEN fromDate AND toDate)
    AND NOT categoryID = 2;
END$$

-- Category Activity Between Dates
CREATE PROCEDURE CategoryActivityBetweenDates(fromDate DATE, toDate DATE)
BEGIN
SELECT  t.categoryID, SUM(transactionAmt) as Activity
FROM BudgetTest.transaction t
	join category c
    on t.categoryID = c.categoryID
    join account a
    on t.accountID = a.accountID
    left join vendor v
    on t.vendorID = v.vendorID
WHERE NOT (t.categoryID = 2) 
	AND transactionDate BETWEEN fromDate AND toDate
GROUP BY t.categoryID;
END$$

-- Category Total Budgeted Between Dates //TODO: order should be on category id
CREATE PROCEDURE CategoryTotalBudgetedBetweenDates(fromDate DATE, toDate DATE)
BEGIN
SELECT categoryID, SUM(Activity) AS "Total Budgeted", Category
FROM (	SELECT categoryID, SUM(catTranAmt) as Activity, tC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category tC
			on cT.toCategoryID = tC.categoryID
		WHERE catTranDate BETWEEN fromDate AND toDate
		GROUP BY Category, categoryID
			UNION
		SELECT categoryID, SUM(catTranAmt)*-1 as Activity, fC.categoryName as Category
		FROM BudgetTest.categoryTransfer cT
			join category fC
			on cT.fromCategoryID = fC.categoryID
		WHERE catTranDate BETWEEN fromDate AND toDate
		GROUP BY Category, categoryID
	  ) as AlmostCategoryBalances
GROUP BY Category, categoryID;
END$$

-- Dashboard Table at a given date 
CREATE PROCEDURE getDashboardTable(dateMonth DATE)
BEGIN
SET @toDate = LAST_DAY(dateMonth), @fromDate = DATE_SUB(dateMonth, INTERVAL DAYOFMONTH(dateMonth)-1 DAY);
SELECT dateMonth as Date, @fromDate as "Start Date", @toDate as "End Date";
SELECT category.categoryID, category.categoryName as Envelope, cB.Balance, Activity, totalBudgeted as "Total Budgeted"
FROM category
LEFT JOIN
(SELECT  t.categoryID, SUM(transactionAmt) as Activity
FROM BudgetTest.transaction t
join category c
	on t.categoryID = c.categoryID
	join account a
	on t.accountID = a.accountID
	left join vendor v
	on t.vendorID = v.vendorID
WHERE NOT (t.categoryID = 2) 
AND transactionDate BETWEEN @fromDate AND @toDate
GROUP BY t.categoryID) as activityTable
ON category.categoryID = activityTable.categoryID
LEFT JOIN
(SELECT categoryID, SUM(Activity) AS totalBudgeted
FROM (	SELECT categoryID, SUM(catTranAmt) as Activity
	FROM BudgetTest.categoryTransfer cT
		join category tC
		on cT.toCategoryID = tC.categoryID
	WHERE catTranDate BETWEEN @fromDate AND @toDate
	GROUP BY categoryID
		UNION
	SELECT categoryID, SUM(catTranAmt)*-1 as Activity
	FROM BudgetTest.categoryTransfer cT
		join category fC
		on cT.fromCategoryID = fC.categoryID
	WHERE catTranDate BETWEEN @fromDate AND @toDate
	GROUP BY categoryID) as AlmostCategoryBalances
GROUP BY categoryID) as totalBudgetedTable
ON category.categoryID = totalBudgetedTable.categoryID
LEFT JOIN 
(SELECT categoryID, SUM(Activity) as Balance
FROM	(SELECT  c.categoryID, SUM(transactionAmt) as Activity
		 FROM BudgetTest.transaction t
			join category c
			on t.categoryID = c.categoryID
			join account a
			on t.accountID = a.accountID
			left join vendor v
			on t.vendorID = v.vendorID
		 WHERE NOT (t.categoryID = 2) 
			AND transactionDate <= @toDate
		 GROUP BY c.categoryID
				UNION
		SELECT  tC.categoryID, SUM(catTranAmt) as Activity
		FROM BudgetTest.categoryTransfer cT
			join category tC
			on cT.toCategoryID = tC.categoryID
		WHERE catTranDate <= @toDate
		GROUP BY tC.categoryID
				UNION
		SELECT  fC.categoryID, SUM(catTranAmt)*-1 as Activity
		FROM BudgetTest.categoryTransfer cT
			join category fC
			on cT.fromCategoryID = fC.categoryID
		WHERE catTranDate <= @toDate
		GROUP BY fC.categoryID
		) as AlmostCategoryBalance
GROUP BY categoryID) as cB
ON category.categoryID = cB.categoryID
WHERE NOT category.categoryID = 2;
END$$

DELIMITER ;