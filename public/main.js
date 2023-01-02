const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//Highlights the current page in the navbar
let pageLinks = document.querySelectorAll("#sidebarMenu .nav-link");

pageLinks.forEach(link => {
    if (document.title.includes(link.id) && link.id != "")
        link.classList.add("active");
});


function drawAccountBalances(jsonData) {
    let accounts = jsonData;
    let balanceHtml = "";

    accounts.forEach(account => {
        balanceHtml += `<p>${account.accountName}: <span class="text-success fw-semibold">$${account.balance}</span></p>\n`; //TODO: need to right aline numbers
    });

    document.querySelector("#AB").innerHTML = balanceHtml;
}

class htmlTable {
    _table;
    _rows = [];
    constructor(tableElement, tableData, printTable = true) {
        this._table = tableElement;

        this._addHeadings(tableData[0]);
        this._addRowData(tableData.slice(1));
        if (printTable)
            this._printTable();
    }

    _printHeading() {
        let tableHeading = this._table.querySelector("thead");
        let headingHTML = "";
        headingHTML += "<tr>";

        this._rows[0].forEach(heading => {
            headingHTML += `<th>${heading}</th>`;
        });

        headingHTML += "</tr>";

        tableHeading.innerHTML = headingHTML;
    }

    _printRow(rowID) {
        let tableBody = this._table.querySelector("tbody");
        let rowHTML = "";
        rowHTML += `<tr>`;

        this._rows[rowID].forEach(data => {
            rowHTML += `<td>${data}</td>`;
        });

        rowHTML += "</tr>";

        if (tableBody.lastChild == null)
            tableBody.innerHTML += rowHTML; //calls to innerHTML overwrite the whole tbody including event listeners
        else
            tableBody.lastChild.insertAdjacentHTML("afterend", rowHTML);
    }

    _printTable() {
        this._table.innerHTML = "<thead></thead>\n<tbody></tbody>";
        this._printHeading();

        for (let rowID = 1; rowID < this._rows.length; rowID++) {
            this._printRow(rowID);
        }
    }

    _addHeadings(tableStringHeadings) {
        this._rows.push(tableStringHeadings);
    }

    //adds a row to the classes row data. if the inputted data is shorter it gets padded with null
    _addRowData(rowData) {
        rowData.forEach(row => {
            let newRow = [];

            for (let column = 0; column < this._rows[0].length; column++)
                newRow.push(row[column] === undefined ? null : row[column]);


            this._rows.push(newRow);
        });
    }

    _addRow(rowData) {
        if (rowData === undefined) {
            rowData = [];
            for (let i = 0; i < this._rows[0].length; i++)
                rowData.push(''); //TODO: should probably switch to null
        }

        this._rows.push(rowData);
        this._printRow(this._rows.length - 1);
    }

}