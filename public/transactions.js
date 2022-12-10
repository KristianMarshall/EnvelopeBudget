//Initialized data object to be filled after the fetch has returned
let transactionTable = "";


//This fetch grabs all of the data for the page. then draws the table with the information.
fetch("./transactionsJson")
    .then(response => response.json())
    .then(jsonData => {

        transactionTable = new TransactionTable(document.querySelector("table"), jsonData);

    });

//TODO: unused. but could be the beginning of a new add row.
function addStaticRow(rowID, wholeRowData) {
    totalRows++;
    let tableHTML = `<tr class="row" id="row_${rowID}">\n`;
    wholeRowData.forEach(rowData => {

        if (typeof rowData == "number") //Switch all the number values to currency.
            rowData = rowData.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        else if (rowData.constructor === Date)
            rowData = rowData.toDateString();
        else if (rowData == null)
            rowData = "";

        tableHTML += `<td>${rowData}</td>\n`;
    });

    tableHTML += `
        <td><input type="button" value="Edit" class="edit" onclick="editRow(${rowID})"></td>
        </tr>\n`;
    table.innerHTML += tableHTML;
}
//Add row click event. Using the json data from the database it populates all the dropdowns.
// function addRow() {
//     totalRows++;
//     table.querySelector("tr").insertAdjacentHTML("beforebegin", drawTableRow(totalRows)); //FIXME: adds the wrong rowID to the row. going by transaction id might fix it? or actually just reverse the row id's from top to bottom
// }

function addRow() {

}

function drawTableRow(rowID) {
    let newTableRowHtml = `
        <tr class="row" id="row_${rowID}">
            <td><input class="date" type="date"></td>
            <td><input size=10 class="amt"></td>
            <td>
                <select class="category" name="categories">
                    <option value=""> -- Select a category -- </option>`;
    data.categories.forEach(category => {
        newTableRowHtml += `<option value="${category.categoryID}">${category.categoryName}</option>`;
    });
    newTableRowHtml += `
                </select>
            </td>
            <td>
                <select class="account" name="account">
                    <option value=""> -- Select an account -- </option>`;
    data.accounts.forEach(account => {
        newTableRowHtml += `<option value="${account.accountID}">${account.accountName}</option>`;
    });
    newTableRowHtml += `
                </select>
            </td>
            <td>
                <select class="vendor" name="vendor" onchange="vendorSwapInput(${rowID})">
                    <option value="NULL"> -- Select a vendor -- </option>
                    <option value="new">* Add New *</option>`;
    data.vendors.forEach(vendor => {
        newTableRowHtml += `<option value="${vendor.vendorID}">${vendor.vendorName}</option>`;
    });
    newTableRowHtml += `
                </select>
            </td>
            <td><input class="memo"></td>
            <td><input class="done" type="button" value="Done" onclick="submitRow(${rowID})"></td>
        </tr>`;
    return newTableRowHtml;
}

function vendorSwapInput(rowID) {
    let vendorSelect = document.querySelector(`#row_${rowID} .vendor`)
    if (vendorSelect.value == "new") {
        vendorSelect.insertAdjacentHTML("afterend", `<input class="vendor" size=15>`);
        vendorSelect.remove();
    }
}

function editRow(rowID) {
    //add new row after the current one. then delete the current one
    let currentRow = document.querySelector("#row_" + rowID);
    currentRow.insertAdjacentHTML("afterend", drawTableRow(rowID));
    currentRow.remove();

    //reselect the new row
    currentRow = document.querySelector("#row_" + rowID);
    let transIndex = 0;
    for (transIndex = 0; transIndex < data.transactions.length; transIndex++) //Find the index of this transaction in the array
        if (data.transactions[transIndex].transactionID == rowID)
            break;

    //Add all table date into the fields
    currentRow.querySelector(".date").value = data.transactions[transIndex].transactionDate.substr(0, 10); //FIXME: after editing row and submitting this now pulls the wrong info
    currentRow.querySelector(".amt").value = data.transactions[transIndex].transactionAmt;
    currentRow.querySelector(".category").value = data.transactions[transIndex].categoryID;
    currentRow.querySelector(".account").value = data.transactions[transIndex].accountID;

    let vendorID = data.transactions[transIndex].vendorID
    currentRow.querySelector(".vendor").value = vendorID == null ? "NULL" : vendorID; //This fixes the dropdown selecting a blank value

    currentRow.querySelector(".memo").value = data.transactions[transIndex].transactionMemo;

}

function setRow(rowID, rowData) {
    let currentRow = document.querySelector(`#row_${rowID}`)


    let newRow = `<tr class="row" id="row_${rowID}">\n`;
    delete rowData.transactionID;
    Object.values(rowData).forEach(field => { //FIXME: pulls the ID's not the names
        newRow += `<td>${field}</td>\n`;
    });

    newRow += `<td><input type="button" value="Edit" class="edit" onclick="editRow(${rowID})"></td>
               </tr>\n`

    currentRow.insertAdjacentHTML("afterend", newRow);
    currentRow.remove();
}

function getRowData(rowID) {
    currentRow = document.querySelector("#row_" + rowID);

    let rowData = {
        transactionID: rowID > (totalRows - addedRows) ? null : rowID, //FIXME: maybe broken with the new rowID system.
        transactionDate: currentRow.querySelector(".date").value,
        transactionAmt: currentRow.querySelector(".amt").value,
        categoryID: currentRow.querySelector(".category").value,
        accountID: currentRow.querySelector(".account").value,
        vendorID: currentRow.querySelector(".vendor").value, //TODO: need to add a way to check if its a new vendor and make the appropriate changes first
        transactionMemo: currentRow.querySelector(".memo").value
    }

    return rowData;
}

function submitRow(rowID) {
    let body = getRowData(rowID);

    fetch("/transactionSubmitJson", {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            console.log(result); //TODO: error check
            setRow(rowID, body);
        });
}

function submitAll() {
    console.log("submit all button works");
    //TODO: need a submit all button. refresh the whole table when clicked
}



class TransactionTable extends htmlTable {
    #transactionIDs = [];
    #notsurewhattocallit;
    colsToHide = 4;
    constructor(tableElement, jsonData) {
        let tableData = [];

        let headings = Object.keys(jsonData.transactions[0]).slice(4);
        headings.push("Actions");

        tableData = jsonData.transactions.map(t => Object.entries(t).map(d => d[1]).slice(4)); //Really ugly but it converts an array of objects into an array of arrays and cuts off te first 4 values
        tableData.map(row => row[0] = new Date(row[0])); //Sets all the date rows as a date object
        tableData.unshift(headings);

        super(tableElement, tableData, false);

        let idHeadings = Object.keys(jsonData.transactions[0]).slice(0, 4);
        this.#transactionIDs = jsonData.transactions.map(t => Object.entries(t).map(d => d[1]).slice(0, 4)); //Same thing as above but grabs the other part of the array
        this.#transactionIDs.unshift(idHeadings);

        jsonData.vendors.unshift({
            id: "addNew",
            name: "-- Add New --" //adds the add new option to the vendor dropdown
        });

        this.#notsurewhattocallit = {
            categories: jsonData.categories,
            accounts: jsonData.accounts,
            vendors: jsonData.vendors
        }

        this._printTable();
        document.querySelector("#addRow").addEventListener("click", event => {
            this.addRow();
            this.#makeEditableRow([...document.querySelectorAll("tr")].pop());
        });
    }

    _printRow(rowID) {
        let tableBody = this._table.querySelector("tbody");
        let rowHTML = "";
        rowHTML += `<tr>`;

        this._rows[rowID].forEach(data => {
            
            //Formatting checks
            if (data == null)
                data = "";
            else if (typeof data == "number") //Switch all the number values to currency.
                data = data.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
            else if (data.constructor === Date)
                data = data.toDateString();

            rowHTML += `<td>${data}</td>`;      
        });

        rowHTML += "</tr>";

        //If no rows just add the row in the inner html. otherwise if its a new row append it to the end. lastly if its replacing
        //          a row add it after then remove it
        if(tableBody.rows.length == 0)
            tableBody.innerHTML += rowHTML; //calls to innerHTML overwrite the whole tbody including event listeners
        else{
            if(rowID >= tableBody.rows.length+1)
                tableBody.lastChild.insertAdjacentHTML("afterend", rowHTML);
            else{
                tableBody.rows[rowID-1].insertAdjacentHTML("afterend", rowHTML);
                tableBody.rows[rowID-1].remove();
            }
        }
    }

    _printTable(){
        this.#addEditButtons();
        super._printTable();
        this.#addEventListeners();
    }

    #addEditButtons(){
        this._rows.forEach((row, index) => {
            if(index)//Stops it from overwriting row 0
                row[row.length-1] = `
                    <input type="button" value="Edit" class="edit">
                    <input type="button" value="Delete" class="delete">
                    `;
        });
    }

    #addDataToEditableRow(rowElement){
        let rowID = rowElement.rowIndex;
        let vendor = this.#transactionIDs[rowID][3] === null ? "" : this.#transactionIDs[rowID][3]; //If its null make it equal a space because that will set it to select a vendor in the drop down
        let dataToAdd = [
            this._rows[rowID][0].toLocaleDateString("en-CA"), //date
            this._rows[rowID][1],                           //amount
            this.#transactionIDs[rowID][1],                 //category
            this.#transactionIDs[rowID][2],                 //account
            vendor,                                         //vendor
            this._rows[rowID][5]                            //memo
        ]
        for(let colIdx = 0; colIdx < dataToAdd.length; colIdx++)
            rowElement.querySelectorAll("td")[colIdx].querySelector("*").value = dataToAdd[colIdx];
    }

    #makeEditableRow(rowElement){
        let cells = rowElement.querySelectorAll("td");
        cells.forEach((cell, index) => {
            let inputElement = "";
            switch (index) {
                case 0:
                    inputElement = `<input type="date">`;
                    break;
                case 1:
                    inputElement = `<input size=10>`;
                    break;
                case 2:
                case 3:
                case 4:
                    inputElement = this.#createDropdown(Object.values(this.#notsurewhattocallit)[index-2], this._rows[0][index]);
                    break;
                case 6:
                    inputElement = `<input type="button" value="Save">\n<input type="button" value="Discard">`;
                    break;
                default:
                    inputElement = `<input>`;
                    break;
            }

            cell.innerHTML = inputElement;
        });


        //Event listener for the vendor dropdown
        cells[4].lastChild.addEventListener("change", event => {
            if(event.target.value === "addNew"){
                event.target.insertAdjacentHTML("afterend", "<input size=15>");
                event.target.remove();
            }
        })

        //event listener for the discard button
        cells[cells.length-1].lastChild.addEventListener("click", event => {
            this._printRow(rowElement.rowIndex);
        })

        //event listener for the save button
        cells[cells.length-1].firstChild.addEventListener("click", event => {
            console.log("save button pressed"); //TODO: add a submit to database function
        })

    }

    #addEventListeners(){
        let editButtons = document.querySelectorAll(".edit");

        editButtons.forEach(button => {
            button.addEventListener("click", event => {
                let tableRowElement = event.path[2];
                this.#makeEditableRow(tableRowElement);
                this.#addDataToEditableRow(tableRowElement);
            });
        });

        
    }

    #createDropdown(typeObj, name){
        let dropdownHtml = `
        <select>
            <option value=""> -- Select a ${name} -- </option>`;

        typeObj.forEach(object => {
            dropdownHtml += `<option value="${object.id}">${object.name}</option>`;
        });

        dropdownHtml += "</select>";
        return dropdownHtml;
    }


}