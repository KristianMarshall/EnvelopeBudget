//Initialized data object to be filled after the fetch has returned
let transactionTable = "";
let page = 0;
let take = calcTableScreenRows();

// window.addEventListener("resize", event =>{ //This erases current table edits
//     take = calcTableScreenRows();
//     updateTable(page, take);
// });

function updateTable(page, take){
    drawAccountBalances();

    let transactionJson = fetch(`./transactionsJson?page=${page}&take=${take}`)
    .then(response => response.json())
    .then(allData => {
        transactionTable = new TransactionTable(document.querySelector("#transactionsTable"), allData);

    });

}

updateTable(page, take); //Initialize table

document.querySelector("#next").addEventListener("click", event =>{
    page++;
    updateTable(page, take);
    document.querySelector("#prev").disabled = page < 1;
});

document.querySelector("#prev").addEventListener("click", event =>{
    page--;
    updateTable(page, take);
    document.querySelector("#prev").disabled = page < 1;
});

document.querySelector("#submitAll").addEventListener("click", event =>{
    transactionTable.submitAllClick();
});

document.querySelector("#addRow").addEventListener("click", event =>{
    transactionTable.addRowClick();
});


class TransactionTable extends htmlTable { //TODO: should make rows and cells their own classes
    #transactionIDs = [];
    #notsurewhattocallit;
    #actionButtons = `
        <div class="btn-group" role="group">
            <input type="button" value="Edit" class="edit btn btn-sm btn-outline-secondary">
            <input type="button" value="Delete" class="delete btn btn-sm btn-outline-secondary">
        </div>
        `;
    constructor(tableElement, jsonData) {
        let tableData = [];
        let colsToHide = 5;
        let headings = Object.keys(jsonData.transactions[0]).slice(colsToHide);
        headings.push("Actions");

        tableData = jsonData.transactions.map(t => Object.entries(t).map(d => d[1]).slice(colsToHide)); //Really ugly but it converts an array of objects into an array of arrays and cuts off te first 4 values
        tableData.map(row => row[0] = new Date(row[0])); //Sets all the date rows as a date object

        let actionButtons = `
        <div class="btn-group" role="group">
            <input type="button" value="Edit" class="edit btn btn-sm btn-outline-secondary">
            <input type="button" value="Delete" class="delete btn btn-sm btn-outline-secondary">
        </div>
        `;
        tableData.map(row => row.push(actionButtons));

        tableData.unshift(headings);

        super(tableElement, tableData, false);

        let idHeadings = Object.keys(jsonData.transactions[0]).slice(0, colsToHide);
        this.#transactionIDs = jsonData.transactions.map(t => Object.entries(t).map(d => d[1]).slice(0, colsToHide)); //Same thing as above but grabs the other part of the array
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
    }

    addRowClick(){
        this._addRow();
        this.#makeEditableRow(this._table.rows[1]);
        document.querySelector("#submitAll").disabled = true;
    }

    submitAllClick(){
        let editableRows = [];

        this._table.querySelectorAll("tr").forEach(row => {
            if (row.querySelector(".rowInput") !== null)
                editableRows.push(row);
        });

        editableRows.forEach(row => {
            this.#saveButtonClick(row);
        });
    }

    _printRow(rowID, changedRow) {
        let tableBody = this._table.querySelector("tbody");
        let rowHTML = "";
        let classes = "";

        if(changedRow)
            classes += 'table-success';
        else if(this.#transactionIDs[rowID][4] && rowID != 0) //if transaction is pending colour the row blue
            classes = 'table-info';

        rowHTML += `<tr class="${classes}">`;

        this._rows[rowID == 0 ? 1 : rowID].forEach(data => {
            classes = "";
            //Formatting checks
            if (data == null)
                data = "";
            else if (typeof data == "number") {//Switch all the number values to currency. and add font colour if its inflow or outflow
                classes = "fw-semibold ";
                if(data > 0)
                    classes += "text-success";
                else
                    classes += "text-danger";
                data = data.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });
            } else if (data.constructor === Date)
                data = data.toDateString();

            rowHTML += `<td class="${classes}">${data}</td>`;
        });

        rowHTML += "</tr>";

        //If no rows just add the row in the inner html. otherwise if its a new row append it to the end. lastly if its replacing
        //          a row add it after then remove it
        if (tableBody.rows.length == 0)
            tableBody.innerHTML += rowHTML; //calls to innerHTML overwrite the whole tbody including event listeners
        else {
            if (rowID == 0)
                tableBody.firstChild.insertAdjacentHTML("beforebegin", rowHTML);
            else if (rowID > tableBody.rows.length)
                tableBody.lastChild.insertAdjacentHTML("afterend", rowHTML);
            else {
                tableBody.rows[rowID - 1].insertAdjacentHTML("afterend", rowHTML);
                tableBody.rows[rowID - 1].remove();
            }
        }

        let editButton = this._table.querySelectorAll("tr")[rowID].querySelector(".edit");
        let deleteButton = this._table.querySelectorAll("tr")[rowID].querySelector(".delete");
        //if a new row is added it will be blank and imminently switched to an editable row so the buttons aren't needed
        if (editButton != null) {
            editButton.addEventListener("click", event => {
                document.querySelector("#submitAll").disabled = true;
                let tableRowElement = event.composedPath()[3];
                tableRowElement.classList.remove("table-danger"); // removes red background if the delete button was pressed right before
                this.#makeEditableRow(tableRowElement);
                this.#addDataToEditableRow(tableRowElement);
            });

            deleteButton.addEventListener("click", deleteEvent => {
                deleteEvent.target.insertAdjacentHTML("afterend", `
                <input id="cancel" type="button" value="Cancel" class="btn btn-sm btn-outline-secondary">
                <input id="confirm" type="button" value="Confirm" class="btn btn-sm btn-danger">`);
                deleteEvent.target.hidden = true;

                deleteEvent.composedPath()[3].classList.add('table-danger'); // add red background if the delete button was pressed

                deleteEvent.target.parentElement.querySelector("#cancel").addEventListener("click", event => {
                    deleteEvent.target.hidden = false
                    event.composedPath()[3].classList.remove('table-danger');
                    event.target.parentElement.querySelector("#confirm").remove();
                    event.target.remove();
                });

                deleteEvent.target.parentElement.querySelector("#confirm").addEventListener("click", event => {
                    this.#deleteRow(rowID, event.composedPath()[3]);
                });
                
            });
        }

    }

    #deleteRow(rowID, rowElement){
        fetch("/transactionDeleteJson", {
            method: 'post',
            body: JSON.stringify({
                id: this.#transactionIDs[rowID][0]
            }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            updateAccountBalances();
        });
        this.#transactionIDs.splice(rowID,1); //TODO: ERROR check. dont remove the row unless the sql comes back positive
        this._rows.splice(rowID,1);
        rowElement.remove();
        
    }

    #addDataToEditableRow(rowElement) {
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

        let cells = rowElement.querySelectorAll("td");

        for (let colIdx = 0; colIdx < dataToAdd.length; colIdx++)
            cells[colIdx].querySelector("*").value = dataToAdd[colIdx];

        //highlight pending button if the row is pending
        if(this.#transactionIDs[rowID][4])
            cells[6].lastChild.children[0].classList.add("active");

    }

    #saveDataFromEditableRow(rowElement) {
        let cells = rowElement.querySelectorAll("td");

        this._rows[rowElement.rowIndex][0] = new Date(cells[0].lastChild.value + "T05:00:00.000Z");
        this._rows[rowElement.rowIndex][1] = Number(cells[1].lastChild.value); //Amount

        //This pulls the data in from Category and Account
        for (let dropdown = 1; dropdown < 3; dropdown++) {
            let id = Number(cells[dropdown + 1].lastChild.value)
            this.#transactionIDs[rowElement.rowIndex][dropdown] = id == 0 ? null : id;

            let name = cells[dropdown + 1].lastChild.selectedOptions[0].innerHTML;
            this._rows[rowElement.rowIndex][dropdown + 1] = id == 0 ? null : name;
        }

        let idOrValue = cells[4].lastChild.value;
        //If its a new vendor or a current one as we need to save them differently
        if(isNaN(idOrValue)){
            this._rows[rowElement.rowIndex][4] = cells[4].lastChild.value;
            this.#transactionIDs[rowElement.rowIndex][3] = -1; //Signals to the backend to create a vendor for this entry
        } else {
            this._rows[rowElement.rowIndex][4] = idOrValue !== "" ? cells[4].lastChild.selectedOptions[0].innerHTML : null;
            this.#transactionIDs[rowElement.rowIndex][3] = idOrValue !== "" ? Number(cells[4].lastChild.value) : null;
        }

        let memo = cells[5].lastChild.value;
        this._rows[rowElement.rowIndex][5] = memo == "" ? null : memo;

        if(cells[6].lastChild.children[0].classList.contains("active"))
            this.#transactionIDs[rowElement.rowIndex][4] = 1;
        else
            this.#transactionIDs[rowElement.rowIndex][4] = 0;
    }

    #makeEditableRow(rowElement) {
        let cells = rowElement.querySelectorAll("td");
        cells.forEach((cell, index) => {
            let inputElement = "";
            switch (index) {
                case 0:
                    inputElement = `<input type="date" class="rowInput" value="${new Date().toLocaleDateString("en-CA")}">`;
                    break;
                case 1:
                    inputElement = `<input size=8 class="rowInput">`;
                    break;
                case 2:
                case 3:
                case 4:
                    inputElement = this.#createDropdown(Object.values(this.#notsurewhattocallit)[index - 2], this._rows[0][index]);
                    break;
                case 5:
                    inputElement = `<input size=21 class="rowInput">`;
                    break;
                case 6:
                    inputElement = `
                    <div class="btn-group" role="group">
                        <button type="button" id="pending" class="btn btn-sm btn-outline-info" data-bs-toggle="button">Pending</button>
                        <input type="button" value="Save" class="saveButton btn btn-sm btn-outline-success" disabled>
                        <input type="button" value="Discard" class="btn btn-sm btn-outline-danger">
                    </div>`;
                    break;
            }

            cell.innerHTML = inputElement;
        });

        let rowInputs = rowElement.querySelectorAll(".rowInput");

        // Event listener for verifying all the inputs
        rowInputs.forEach(input => {
            input.addEventListener("change", event => {
                this.#validateRow(rowElement);
            });
        });


        //Event listener for the vendor dropdown
        cells[4].lastChild.addEventListener("change", event => {
            if (event.target.value === "addNew") {
                event.target.insertAdjacentHTML("afterend", "<input size=15>");
                event.target.remove();
                //TODO: focus text box
            }
        })

        //event listener for the pending button
        cells[6].lastChild.children[0].addEventListener("click", event => {
            if(event.target.classList.contains("active"))
                rowElement.classList.add("table-info");
            else
                rowElement.classList.remove("table-info");
            this.#validateRow(rowElement)
        })

        //event listener for the save button
        cells[6].lastChild.children[1].addEventListener("click", event => {
            this.#saveButtonClick(rowElement);
        })

        //event listener for the discard button
        cells[6].lastChild.children[2].addEventListener("click", event => {
            if (this._rows[rowElement.rowIndex][0] != '')
                this._printRow(rowElement.rowIndex);
            else {
                this._rows.splice(rowElement.rowIndex, 1);
                this.#transactionIDs.splice(rowElement.rowIndex, 1);

                let rowToReAdd = this._table.rows.length-1;
                
                rowElement.remove();
                
                this._printRow(rowToReAdd); //reprints the row that fell off the bottom of the table when the new row was added then removed
            }
        })

    }

    #saveButtonClick(rowElement){
        this.#saveDataFromEditableRow(rowElement); 
        this.#submitRow(rowElement.rowIndex); //FIXME: should only save if database update goes well
        this._printRow(rowElement.rowIndex, true);
    }

    #validateRow(rowElement){ 
        let cells = rowElement.querySelectorAll("td");
        let valid = true;

        if(new Date(cells[0].lastChild.value + "T05:00:00.000Z") == "Invalid Date")
            valid = false;


        if(isNaN(cells[1].lastChild.value)) //TODO: Still need to verify input precision
            valid = false;

        for (let dropdown = 1; dropdown < 3; dropdown++) 
            if(isNaN(cells[dropdown + 1].lastChild.value) || cells[dropdown + 1].lastChild.value == "")
                valid = false;

        //enable the button if all the data is valid
        cells[6].lastChild.children[1].disabled = !valid;

        //enable the submit all button if all the save buttons are clickable
        let allSaveButtons = true;

        document.querySelectorAll(".saveButton").forEach(saveButton => {
            if(saveButton.disabled)
                allSaveButtons = false;
        });

        document.querySelector("#submitAll").disabled = !allSaveButtons;
    }

    #submitRow(rowID) {
        let rowData = this._rows[rowID].slice(0, 6);
        rowData[0] = rowData[0].toLocaleString("en-CA", { timeZone: "America/Toronto" }).split(",")[0];
        fetch("/transactionSubmitJson", {
            method: 'post',
            body: JSON.stringify({
                transactionIDs: this.#transactionIDs[rowID],
                rowData: rowData
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(result => {
                console.log(result); //TODO: error check

                if(this.#transactionIDs[rowID][0] === null)
                    this.#transactionIDs[rowID][0] = result.transactionResult.insertId;

                //if a vendor was added then add the new vendor to the local array of vendors
                if(result.vendorResult !== undefined){
                    this.#transactionIDs[rowID][3] = result.vendorResult.insertId;
                    this.#notsurewhattocallit.vendors.push({id: result.vendorResult.insertId, name: this._rows[rowID][4]});
                }
                updateAccountBalances();
                
            });
    }

    #createDropdown(typeObj, name) {
        let dropdownHtml = `
        <select class="rowInput form-select form-select-sm">
            <option value=""> -- Select a ${name} -- </option>`;

        typeObj.forEach(object => {
            dropdownHtml += `<option value="${object.id}">${object.name}</option>`;
        });

        dropdownHtml += "</select>";
        return dropdownHtml;
    }

    //TODO: should default date to today
    _addRow(rowData) {
        if(rowData === undefined){
            rowData = [];
            for (let i = 0; i < this._rows[0].length-1; i++)
                rowData.push(''); //TODO: should probably switch to null
            rowData.push(this.#actionButtons);
        }

        this._rows.splice(1, 0, rowData);
        this._printRow(0);

        let transactionIDs = [];
        for (let i = 0; i < this.#transactionIDs[0].length; i++)
            transactionIDs.push(null);

        this.#transactionIDs.splice(1, 0, transactionIDs);
        if(this._table.rows.length-1 > take)
            this._table.querySelector("tbody").lastChild.remove(); //removes the last row to keep the table height the same
    }
}

//Update the account balances in left bar
function updateAccountBalances(){
    fetch("/AccountBalanceJson").then(response => response.json())
    .then(accountJson => {drawAccountBalances(accountJson)});
}