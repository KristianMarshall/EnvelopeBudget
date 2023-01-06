let categorySettingsTable;

document.querySelector("a.nav-link.px-3").classList.add("active");

document.querySelector("#budgetButton").addEventListener("click", event =>{
    fetch("/settingsJson", {
        method: 'post',
        body: JSON.stringify({
            database: document.querySelector("#budgetDatabase").value
        }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if(result.serverStatus == 2)
                alert('Budget database changed successfully!', 'success');
            else
                alert(`Budget database failed: ${result.code}`, 'danger');
        });
});

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const alert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>', //TODO: maybe make this non dismissible
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)
}

function updateTable(){
    fetch("/SettingsJson")
    .then(res => res.json())
    .then(results => {
        categorySettingsTable = new settingsTable(
            document.querySelector("#settingsTable"),
            results[0],
            results[1],
            {
                catGroupID: {
                    hidden: true
                },
                categoryID: {
                    hidden: true
                },
                timeOpID: {
                    hidden: true
                },
                catGroupName: {
                    hidden: true
                },
                categoryHidden:{
                    dataType: "checkbox"
                },
                categoryBudget:{
                    dataType: "dollars"
                }
            });
    });
}

updateTable();

class newHtmlTable {
    _table;
    _rows = [];
    _colSettings = {};
    constructor(tableElement, tableData, colSettings) {
        this._table = tableElement;
        this._colSettings = colSettings;
        this._addRowData(tableData);
    }

    _getFormattedData(rowID, colName){
        let data = this._rows[rowID][colName];

        if(data === null)
            data = "";

        return data;
    }

    _addRowData(tableData){
        tableData.forEach(rowObject => {
            this._rows.push(rowObject);
        });
    }

    _printRow(rowID){
        let tableBody = this._table.tBodies[0];
        let rowHTML = "";
        rowHTML += `<tr>`;

        for (const colName in this._rows[rowID]){
            if(!(this._colSettings[colName] !== undefined && this._colSettings[colName].hidden))
                rowHTML += `<td>${this._getFormattedData(rowID, colName)}</td>`;
        }

        rowHTML += "</tr>";


        tableBody.innerHTML += rowHTML; //calls to innerHTML overwrite the whole tbody including event listeners

    }

    _printHeaders(){
        let headers = Object.keys(this._rows[0]);

        for (const colSetting in this._colSettings) {
            if(this._colSettings[colSetting].hidden)
                headers.splice(headers.indexOf(colSetting), 1);
        }

        let tableHeading = this._table.querySelector("thead");
        let headingHTML = "<tr>";

        headers.forEach(heading => {
            headingHTML += `<th>${heading}</th>`;
        });

        headingHTML += "</tr>";

        tableHeading.innerHTML = headingHTML;
    }

    printTable(){
        this._printHeaders();

        for(let rowID = 0; rowID < this._rows.length; rowID++)
            this._printRow(rowID);
        

    }
}


class settingsTable extends newHtmlTable {
    #tableGroups;
    constructor(tableElement, tableData, tableGroups, colSettings){
        super(tableElement, tableData, colSettings);
        this.#tableGroups = tableGroups;
        this.printTable();
    }

    _getFormattedData(rowID, colName){
        let data = this._rows[rowID][colName];
        if(this._colSettings[colName] !== undefined){
            switch(this._colSettings[colName].dataType){
                case "checkbox":
                    data = `<input class="form-check-input" type="checkbox" value="" ${data ? "checked" : ""}>`;
                    break;
                case "dollars":
                    data = data === null ? "$0.00" : data.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });
                    data = `<input type="text" class="form-control-plaintext p-0 b-0" value="${data}">`
                    break;
                case undefined:
                    break;
            }
        }
        else if(data === null)
            data = `<input type="text" class="form-control-plaintext p-0 b-0" value="">`;
        else
            data = `<input type="text" class="form-control-plaintext p-0 b-0" value="${data}">`;

        return data;
    }

    _printRow(rowID){
        let tableBody = this._table.tBodies[0];
        let rowHTML = "";
        rowHTML += `<tr>`;

        for (const colName in this._rows[rowID]){
            if(!(this._colSettings[colName] !== undefined && this._colSettings[colName].hidden))
                rowHTML += `<td>${this._getFormattedData(rowID, colName)}</td>`;
        }

        rowHTML += "</tr>";


        tableBody.innerHTML += rowHTML; //calls to innerHTML overwrite the whole tbody including event listeners

    }

    #printCategoryGroup(catGroupID){
        let tableBody = this._table.tBodies[0];
        let rowHTML =  `
        <tr class="table-secondary">
            <td><input type="text" class="form-control-plaintext p-0 b-0 fw-bold" value="${this.#tableGroups[catGroupID-1].catGroupName}"></td>
            <td></td><td></td><td></td><td></td>
        </tr>`;

        tableBody.innerHTML += rowHTML;
    }

    printTable(){
        this._printHeaders();
        let currCategory = 0;
        for(let rowID = 2; rowID < this._rows.length; rowID++){

            if(currCategory != this._rows[rowID]["catGroupID"]){
                currCategory = this._rows[rowID]["catGroupID"];
                this.#printCategoryGroup(currCategory);
            }

            this._printRow(rowID);
        }

    }

}