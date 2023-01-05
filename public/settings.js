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
        categorySettingsTable = new newHtmlTable(
            document.querySelector("#settingsTable"),
            results[0],
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
        this._printTable();
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
                rowHTML += `<td>${this._rows[rowID][colName]}</td>`;
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

    _printTable(){
        this._printHeaders();

        for(let rowID = 0; rowID < this._rows.length; rowID++)
            this._printRow(rowID);
        

    }
}
