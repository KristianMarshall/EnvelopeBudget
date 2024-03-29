let catTransTable = "";
let page = 0;
let take = calcTableScreenRows();

function updateTable(page, take){
    fetch(`./categoryTransfersJson?page=${page}&take=${take}`)
    .then(response => response.json())
    .then(data => {
        let table = document.querySelector("table");
        catTransTable = new CatTransTable(table, data);
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
    catTransTable.submitAllClick();
});

document.querySelector("#addRow").addEventListener("click", event =>{
    catTransTable.addRowClick();
});

class CatTransTable extends htmlTable {
    #tableIds = [];
    #categories;
    #actionButtons = `
        <div class="btn-group" role="group">
            <input type="button" value="Edit" class="edit btn btn-sm btn-outline-secondary">
            <input type="button" value="Delete" class="delete btn btn-sm btn-outline-secondary">
        </div>
        `;
    constructor(tableElement, jsonData) {
        let tableData = jsonData[0];
        let headings = Object.keys(tableData[0]).slice(3);
        headings.push("Actions");

        tableData = tableData.map(t => Object.entries(t).map(d => d[1]).slice(3)); //Really ugly but it converts an array of objects into an array of arrays and cuts off te first 3 values
        tableData.map(row => row[0] = new Date(row[0])); //Sets all the date rows as a date object
        
        let actionButtons = `
        <div class="btn-group" role="group">
            <input type="button" value="Edit" class="edit btn btn-sm btn-outline-secondary">
            <input type="button" value="Delete" class="delete btn btn-sm btn-outline-secondary">
        </div>
        `;
        tableData.map(row => row.push(actionButtons));

        tableData.unshift(headings);

        super(tableElement, tableData);

        this.#categories = jsonData[1];
        this.#categories.splice(1,1); //remove account transfer

        let idHeadings = Object.keys(jsonData[0][0]).slice(0, 3);
        this.#tableIds =  jsonData[0].map(t => Object.entries(t).map(d => d[1]).slice(0, 3)); //Same thing as above but grabs the other part of the array
        this.#tableIds.unshift(idHeadings);

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

    _printRow(rowID) {
        let tableBody = this._table.querySelector("tbody");
        let rowHTML = "";
        rowHTML += `<tr>`;

        this._rows[rowID == 0 ? 1 : rowID].forEach(data => {

            //Formatting checks
            if (data == null)
                data = "";
            else if (typeof data == "number") //Switch all the number values to currency.
                data = data.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });
            else if (data.constructor === Date)
                data = data.toDateString();

            rowHTML += `<td>${data}</td>`;
        });

        rowHTML += "</tr>";

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
                document.querySelector("#submitAll").disabled = true;
                let tableRowElement = event.composedPath()[3];
                this.#makeEditableRow(tableRowElement);
                this.#addDataToEditableRow(tableRowElement);
            });

            deleteButton.addEventListener("click", deleteEvent => {
                deleteEvent.target.insertAdjacentHTML("afterend", `
                <input id="cancel" type="button" value="Cancel" class="btn btn-sm btn-outline-secondary">
                <input id="confirm" type="button" value="Confirm" class="btn btn-sm btn-danger">`);
                deleteEvent.target.hidden = true;

                deleteEvent.composedPath()[3].classList.add('table-danger');

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
        fetch("/catTranDeleteJson", {
            method: 'post',
            body: JSON.stringify({
                id: this.#tableIds[rowID][0]
            }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        });
        this.#tableIds.splice(rowID,1); //TODO: ERROR check. dont remove the row unless the sql comes back positive
        this._rows.splice(rowID,1);
        rowElement.remove();
    }



    #addDataToEditableRow(rowElement) {
        let rowID = rowElement.rowIndex;
       
        let dataToAdd = [
            this._rows[rowID][0].toLocaleDateString("en-CA"),  //date
            this._rows[rowID][1],                              //amount
            this.#tableIds[rowID][1],                          //category
            this.#tableIds[rowID][2],                          //account
            this._rows[rowID][4]                               //memo
        ]
        for (let colIdx = 0; colIdx < dataToAdd.length; colIdx++)
            rowElement.querySelectorAll("td")[colIdx].querySelector("*").value = dataToAdd[colIdx];
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
                    inputElement = this.#createDropdown(Object.values(this.#categories), "Category");
                    break;
                case 4:
                    inputElement = `<input size=21 class="rowInput">`;
                    break;
                case 5:
                    inputElement = `
                    <div class="btn-group" role="group">
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

        //event listener for the discard button
        cells[cells.length - 1].lastChild.children[1].addEventListener("click", event => {
            if (this._rows[rowElement.rowIndex][0] != '')
                this._printRow(rowElement.rowIndex);
            else {
                this._rows.splice(rowElement.rowIndex, 1);
                this.#tableIds.splice(rowElement.rowIndex, 1);
                
                let rowToReAdd = this._table.rows.length-1;
                
                rowElement.remove();
                
                this._printRow(rowToReAdd); //reprints the row that fell off the bottom of the table when the new row was added then removed
            }
        })

        //event listener for the save button
        cells[cells.length - 1].lastChild.children[0].addEventListener("click", event => {
            this.#saveButtonClick(rowElement);
        })
    }

    #saveButtonClick(rowElement){
        this.#saveDataFromEditableRow(rowElement); 
        this.#submitRow(rowElement.rowIndex); //FIXME: should only save if database update goes well
        this._printRow(rowElement.rowIndex);
    }

    #validateRow(rowElement){
        let cells = rowElement.querySelectorAll("td");
        let valid = true;

        if(new Date(cells[0].lastChild.value + "T05:00:00.000Z") == "Invalid Date")
            valid = false;

        //amount should be a number and above 0
        if(isNaN(cells[1].lastChild.value) || Number(cells[1].lastChild.value) <= 0) //TODO: Still need to verify input precision
            valid = false;

        //not valid if to and from category haven't not been selected
        for (let dropdown = 1; dropdown < 3; dropdown++) 
            if(isNaN(cells[dropdown + 1].lastChild.value) || cells[dropdown + 1].lastChild.value == "")
                valid = false;

        //not valid if to and from category are the same
        if(cells[2].lastChild.value == cells[3].lastChild.value )
            valid = false;
        
        //enable the button if all the data is valid
        cells[5].lastChild.children[0].disabled = !valid;

        //enable the submit all button if all the save buttons are clickable
        let allSaveButtons = true;

        document.querySelectorAll(".saveButton").forEach(saveButton => {
            if(saveButton.disabled)
                allSaveButtons = false;
        });

        document.querySelector("#submitAll").disabled = !allSaveButtons;
    }

    #createDropdown(typeObj, name) {
        let dropdownHtml = `
        <select class="rowInput form-select form-select-sm">
            <option selected disabled value=""> -- Select a ${name} -- </option>`;

        typeObj.forEach(object => {
            dropdownHtml += `<option value="${object.id}">${object.name}</option>`;
        });

        dropdownHtml += "</select>";
        return dropdownHtml;
    }

    #saveDataFromEditableRow(rowElement) {
        let cells = rowElement.querySelectorAll("td");

        this._rows[rowElement.rowIndex][0] = new Date(cells[0].lastChild.value + "T05:00:00.000Z");
        this._rows[rowElement.rowIndex][1] = Number(cells[1].lastChild.value); //Amount

        //This pulls the data in from Category and Account
        for (let dropdown = 1; dropdown < 3; dropdown++) {
            let id = Number(cells[dropdown + 1].lastChild.value)
            this.#tableIds[rowElement.rowIndex][dropdown] = id == 0 ? null : id;

            let name = cells[dropdown + 1].lastChild.selectedOptions[0].innerHTML;
            this._rows[rowElement.rowIndex][dropdown + 1] = id == 0 ? null : name;
        }

        let memo = cells[4].lastChild.value;
        this._rows[rowElement.rowIndex][4] = memo == "" ? null : memo;
    }

    #submitRow(rowID) {
        let rowData = this._rows[rowID].slice(0, 5);
        rowData[0] = rowData[0].toLocaleString("en-CA", { timeZone: "America/Toronto" }).split(",")[0];
        fetch("/catTransSubmitJson", {
            method: 'post',
            body: JSON.stringify({
                catTranIDs: this.#tableIds[rowID],
                rowData: rowData
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(result => {
                console.log(result); //TODO: error check and highlight row green if successful
                if(this.#tableIds[rowID][0] === null) 
                    this.#tableIds[rowID][0] = result.insertId;
            });
    }

    _addRow(rowData) {
        if(rowData === undefined){
            rowData = [];
            for (let i = 0; i < this._rows[0].length-1; i++)
                rowData.push(''); //TODO: should probably switch to null
            rowData.push(this.#actionButtons);
        }

        this._rows.splice(1, 0, rowData);
        this._printRow(0);

        let tableIds = [];
        for (let i = 0; i < this.#tableIds[0].length; i++)
            tableIds.push(null);

            this.#tableIds.splice(1, 0, tableIds);

        if(this._table.rows.length-1 > take)
            this._table.querySelector("tbody").lastChild.remove(); //removes the last row to keep the table height the same
    }
}