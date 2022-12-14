//Initialized data object to be filled after the fetch has returned
let transactionTable = "";

let transactionJson = fetch("./transactionsJson").then(response => response.json());
let accountBalanceJson = fetch("/AccountBalanceJson").then(response => response.json());

window.addEventListener("load", event => {
    //This fetch grabs all of the data for the page. then draws the table with the information.
    Promise.all([transactionJson, accountBalanceJson]).then(allData => {
        transactionTable = new TransactionTable(document.querySelector("table"), allData[0]);

        drawAccountBalances(allData[1]);
    });
});



class TransactionTable extends htmlTable { //TODO: should make rows and cells their own classes
    #transactionIDs = [];
    #notsurewhattocallit;
    colsToHide = 4;
    #actionButtons = `
        <input type="button" value="Edit" class="edit">
        <input type="button" value="Delete" class="delete">
        `;
    constructor(tableElement, jsonData) {
        let tableData = [];

        let headings = Object.keys(jsonData.transactions[0]).slice(4);
        headings.push("Actions");

        tableData = jsonData.transactions.map(t => Object.entries(t).map(d => d[1]).slice(4)); //Really ugly but it converts an array of objects into an array of arrays and cuts off te first 4 values
        tableData.map(row => row[0] = new Date(row[0])); //Sets all the date rows as a date object

        let actionButtons = `
        <input type="button" value="Edit" class="edit">
        <input type="button" value="Delete" class="delete">
        `;
        tableData.map(row => row.push(actionButtons));

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
            this._addRow();
            this.#makeEditableRow([...document.querySelectorAll("tr")][1]);
        });
    }

    _printRow(rowID) {
        let tableBody = this._table.querySelector("tbody");
        let rowHTML = "";
        rowHTML += `<tr>`;

        this._rows[rowID == 0 ? 1 : rowID].forEach(data => {

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

        let editButton = document.querySelectorAll("tr")[rowID].querySelector(".edit");
        let deleteButton = document.querySelectorAll("tr")[rowID].querySelector(".delete");
        //if a new row is added it will be blank and imminently switched to an editable row so the buttons aren't needed
        if (editButton != null) {
            editButton.addEventListener("click", event => {
                let tableRowElement = event.path[2];
                this.#makeEditableRow(tableRowElement);
                this.#addDataToEditableRow(tableRowElement);
            });

            //TODO: need to center these buttons
            deleteButton.addEventListener("click", deleteEvent => {
                deleteEvent.target.insertAdjacentHTML("afterend", `<input id="cancel" type="button" value="Cancel"><input id="confirm" type="button" value="Confirm">`);
                deleteEvent.target.hidden = true;

                deleteEvent.target.parentElement.querySelector("#cancel").addEventListener("click", event => {
                    deleteEvent.target.hidden = false
                    event.target.parentElement.querySelector("#confirm").remove();
                    event.target.remove();
                });

                deleteEvent.target.parentElement.querySelector("#confirm").addEventListener("click", event => {
                    this.#deleteRow(rowID, event.target.parentElement.parentElement);
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
        this.#transactionIDs.splice(rowID,1);
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
        for (let colIdx = 0; colIdx < dataToAdd.length; colIdx++)
            rowElement.querySelectorAll("td")[colIdx].querySelector("*").value = dataToAdd[colIdx];
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
    }

    #makeEditableRow(rowElement) {
        let cells = rowElement.querySelectorAll("td");
        cells.forEach((cell, index) => {
            let inputElement = "";
            switch (index) {
                case 0:
                    inputElement = `<input type="date" class="rowInput">`;
                    break;
                case 1:
                    inputElement = `<input size=10 class="rowInput">`;
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
                    inputElement = `<input type="button" value="Save" disabled>\n<input type="button" value="Discard">`;
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
            }
        })

        //event listener for the discard button
        cells[cells.length - 1].lastChild.addEventListener("click", event => {
            if (this._rows[rowElement.rowIndex][0] != '')
                this._printRow(rowElement.rowIndex);
            else {
                this._rows.splice(rowElement.rowIndex, 1);
                this.#transactionIDs.splice(rowElement.rowIndex, 1);
                rowElement.remove();
            }
        })

        //event listener for the save button
        cells[cells.length - 1].firstChild.addEventListener("click", event => {
            this.#saveDataFromEditableRow(rowElement); //FIXME: should only save if database update goes well
            this.#submitRow(rowElement.rowIndex);
            this._printRow(rowElement.rowIndex);
        })

    }

    #validateRow(rowElement){
        let cells = rowElement.querySelectorAll("td");
        let valid = true;

        if(new Date(cells[0].lastChild.value + "T05:00:00.000Z") == "Invalid Date")
            valid = false;


        if(isNaN(cells[1].lastChild.value))
            valid = false;

        for (let dropdown = 1; dropdown < 3; dropdown++) 
            if(isNaN(cells[dropdown + 1].lastChild.value) || cells[dropdown + 1].lastChild.value == "")
                valid = false;

        if(valid)
            cells[6].firstChild.disabled = false;
        else
            cells[6].firstChild.disabled = true;
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
        <select class="rowInput">
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
    }
}

//Update the account balances in left bar
function updateAccountBalances(){
    fetch("/AccountBalanceJson").then(response => response.json())
    .then(accountJson => {drawAccountBalances(accountJson)});
}