let categorySettingsTable;

(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          console.log("not valid");
        } else {
          console.log("valid");
        }
        event.preventDefault()
        event.stopPropagation()
        form.classList.add('was-validated')
      }, false)
    })
  })()

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
            if(result)
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
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
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
            results[2],
            {
                catGroupID: {
                    hidden: true
                },
                categoryID: {
                    hidden: true
                },
                timeOpName: {
                    hidden: true
                },
                catGroupName: {
                    hidden: true
                },
                Hidden:{
                    dataType: "checkbox"
                },
                Budget:{
                    dataType: "dollars"
                },
                "Bill Date":{
                    dataType: "date"
                },
                "Frequency":{
                    dataType: "frequency"
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
    #timeOptions;
    constructor(tableElement, tableData, tableGroups, timeOptions, colSettings){
        super(tableElement, tableData, colSettings);
        this.#tableGroups = tableGroups;
        this.#timeOptions = timeOptions;
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
                    data = `<input type="number" step="0.01" class="form-control fw-semibold py-1" placeholder="${data}">`
                    break;
                case "date":
                    data = data === null ? "" : (new Date(data)).toLocaleDateString("en-CA");
                    data = `<input type="date" class="form-control-plaintext p-0 b-0" value="${data}" style="width: 110px;" >`;
                    break;
                case "frequency":
                    data = this.#createDropdown(this.#timeOptions, "Frequency", data);
                    break;
                case undefined:
                    break;
            }
        }
        else
            data = `<input type="text" class="form-control-plaintext p-0 b-0" value="${data === null ? "" : data}">`;

        return data;
    }

    _printRow(rowID){
        let tableBody = this._table.tBodies[0];
        let rowElement = document.createElement("tr");

        for (const colName in this._rows[rowID]){
            if(!(this._colSettings[colName] !== undefined && this._colSettings[colName].hidden))
                rowElement.innerHTML += `<td>${this._getFormattedData(rowID, colName)}</td>`;
        }

        tableBody.appendChild(rowElement);
    }

    #createDropdown(typeObj, name, selected) {
        let dropdownHtml = `
        <select class="rowInput form-select w-auto py-1" required>
            <option selected disabled value=""> -- Select a ${name} -- </option>`;

        typeObj.forEach(object => {
            dropdownHtml += `<option value="${object.id}" ${selected === object.id ? "selected" : ""}>${object.name}</option>`;
        });

        dropdownHtml += "</select>";
        return dropdownHtml;
    }

    #printCategoryGroup(catGroupID){
        let tableBody = this._table.tBodies[0];
        let rowElement =  document.createElement("tr");
        rowElement.classList.add("table-secondary");

        rowElement.innerHTML = `
        <td><input type="text" class="form-control-plaintext p-0 b-0 fw-bold" value="${this.#tableGroups[catGroupID-1].catGroupName}"></td>
        <td></td><td></td><td></td>
        <td class="d-flex justify-content-end">
            <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex justify-content-center align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle align-text-bottom" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </button>
        </td>`;

        tableBody.appendChild(rowElement);
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

        //TODO: add a change event listener to validate and show the apply button
    }

}