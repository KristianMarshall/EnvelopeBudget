//Initialized data object to be filled after the fetch has returned
let transactionTable = "";


//This fetch grabs all of the data for the page. then draws the table with the information.
fetch("./transactionsJson")
    .then(response => response.json())
    .then(jsonData => {

        transactionTable = new TransactionTable(document.querySelector("table"), jsonData);

    });


class TransactionTable extends htmlTable { //TODO: should make rows and cells their own classes
    #transactionIDs = [];
    #notsurewhattocallit;
    colsToHide = 4;
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

        let editButton = document.querySelectorAll("tr")[rowID].querySelector(".edit");
        //if a new row is added it will be blank and imminently switched to an editable row so the buttons aren't needed
        if(editButton != null){
            editButton.addEventListener("click", event => {
                let tableRowElement = event.path[2];
                this.#makeEditableRow(tableRowElement);
                this.#addDataToEditableRow(tableRowElement);
            });
        }

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

    #saveDataFromEditableRow(rowElement){
        let cells = rowElement.querySelectorAll("td");
        cells.forEach((cell, index) => {
            let cellInput = cell.lastChild; //weird bug with first child but last does the same thing when there should only be one element
            
            switch (index) { //TODO: Flatten switch it is unneeded
                case 0:
                    this._rows[rowElement.rowIndex][index]  = new Date(cell.lastChild.value);
                    break;
                case 1:
                    this._rows[rowElement.rowIndex][index]  = Number(cell.lastChild.value);
                    break;
                case 2:
                case 3:
                case 4:
                    this._rows[rowElement.rowIndex][index] = cell.lastChild.selectedOptions[0].innerHTML; //TODO: error checking
                    this.#transactionIDs[rowElement.rowIndex][index-1] = Number(cell.lastChild.value);
                    break;
                case 5:
                    this._rows[rowElement.rowIndex][index]  = cell.lastChild.value;
                    break;
            }
        });

        //TODO: return it to a regular row
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
                    inputElement = `<input size=21>`;
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
            if(this._rows[rowElement.rowIndex][0] != '')
                this._printRow(rowElement.rowIndex);
            else{
                rowElement.remove();
                this._rows.splice(rowElement.rowIndex,1);
                this.#transactionIDs.splice(rowElement.rowIndex,1);
            }
        })

        //event listener for the save button
        cells[cells.length-1].firstChild.addEventListener("click", event => {
            this.#saveDataFromEditableRow(rowElement);
            this.#submitRow(rowElement); 
        })

    }

    //TODO: add a submit to database function
    #submitRow(rowID){
    //     let body = getRowData(rowID);

    // fetch("/transactionSubmitJson", {
    //     method: 'post',
    //     body: JSON.stringify(body),
    //     headers: { 'Content-Type': 'application/json' }
    // })
    //     .then(response => response.json())
    //     .then(result => {
    //         console.log(result); //TODO: error check
    //         setRow(rowID, body);
    //     });
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

    _addRow(rowData){
        super._addRow(rowData);

        let transactionIDs = [];
        for (let i = 0; i < this.#transactionIDs[0].length; i++)
            transactionIDs.push(null);

        this.#transactionIDs.push(transactionIDs);

        //TODO: PICKUp HERE: should add the buttons
    }
}