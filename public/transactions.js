let table = document.querySelector("tbody");
let addedRows = 0;
let totalRows = 0;
//Initialized data object to be filled after the fetch has returned
let data = "";


//This fetch grabs all of the data for the page. then draws the table with the information.
fetch("./transactionsJson")
.then(response => response.json())
.then(jsonData => {
    
    data = jsonData; //Pass queried data back to the rest of the page
    let displayColumnsStartIdx = 4; //query has all the id's in the front but i don't want to display them
    let headings = Object.keys(jsonData.transactions[0]);
    let tableHTML = "";

    tableHTML += "<tr>\n";
    for(let i = displayColumnsStartIdx; i < headings.length; i++) {
        tableHTML += `<th>${headings[i]}</th>\n`;
    }
    tableHTML += `<th>Actions</th>\n`;
    tableHTML += "</tr>\n";

    document.querySelector("thead").innerHTML = tableHTML;
    tableHTML = "";

    for(let i = 0; i < jsonData.transactions.length; i++) {
        totalRows++;
        tableHTML += `<tr class="row" id="row_${jsonData.transactions[i].transactionID}">\n`; //TODO: PICKUP HERE: maybe turn this into a method so i can use it again later. then when submitting a row it will update nicely and it fixes duplicate code with the setRow()
        for(let j = displayColumnsStartIdx; j < headings.length; j++) {
            rowData = jsonData.transactions[i][headings[j]];

            if(typeof rowData == "number") //Switch all the number values to currency.
                rowData = rowData.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
            else if(headings[j] == "transactionDate") //Modify the date value to remove the time 
                rowData = rowData.substr(0,10); //TODO: switch to date object.
            else if(rowData == null)
                rowData = "";

                tableHTML += `<td>${rowData}</td>\n`;
        }
        
        tableHTML += `
            <td><input type="button" value="Edit" class="edit" onclick="editRow(${jsonData.transactions[i].transactionID})"></td>
            </tr>\n`;
    }

    table.innerHTML = tableHTML;
});

//Add row click event. Using the json data from the database it populates all the dropdowns.
function addRow() {
    totalRows++;
    table.querySelector("tr").insertAdjacentHTML("beforebegin", drawTableRow(totalRows)); //FIXME: adds the wrong rowID to the row. going by transaction id might fix it? or actually just reverse the row id's from top to bottom
}

function drawTableRow(rowID){
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

function vendorSwapInput(rowID){
    let vendorSelect = document.querySelector(`#row_${rowID} .vendor`)
    if(vendorSelect.value == "new"){
        vendorSelect.insertAdjacentHTML("afterend", `<input class="vendor">`);
        vendorSelect.remove();
    }
}

function editRow(rowID){
    //add new row after the current one. then delete the current one
    let currentRow = document.querySelector("#row_"+ rowID);
    currentRow.insertAdjacentHTML("afterend", drawTableRow(rowID));
    currentRow.remove();

    //reselect the new row
    currentRow = document.querySelector("#row_"+ rowID);
    let transIndex = 0;
    for(transIndex = 0; transIndex < data.transactions.length; transIndex++) //Find the index of this transaction in the array
        if(data.transactions[transIndex].transactionID == rowID)
            break;
    
    //Add all table date into the fields
    currentRow.querySelector(".date").value = data.transactions[transIndex].transactionDate.substr(0,10); //FIXME: after editing row and submitting this now pulls the wrong info
    currentRow.querySelector(".amt").value = data.transactions[transIndex].transactionAmt;
    currentRow.querySelector(".category").value = data.transactions[transIndex].categoryID;
    currentRow.querySelector(".account").value = data.transactions[transIndex].accountID;

    let vendorID = data.transactions[transIndex].vendorID
    currentRow.querySelector(".vendor").value = vendorID == null ? "NULL" : vendorID; //This fixes the dropdown selecting a blank value

    currentRow.querySelector(".memo").value = data.transactions[transIndex].transactionMemo;
    
}

function setRow(rowID, rowData){
    let currentRow = document.querySelector(`#row_${rowID}`)


    let newRow = `<tr class="row" id="row_${rowID}">\n`;
    delete rowData.transactionID;
    Object.values(rowData).forEach(field =>{ //FIXME: pulls the ID's not the names
        newRow += `<td>${field}</td>\n`;
    });

    newRow += `<td><input type="button" value="Edit" class="edit" onclick="editRow(${rowID})"></td>
               </tr>\n`

    currentRow.insertAdjacentHTML("afterend", newRow);
    currentRow.remove();
}

function getRowData(rowID){
    currentRow = document.querySelector("#row_"+ rowID);

    let rowData = {
        transactionID:      rowID > (totalRows-addedRows) ? null : rowID, //FIXME: maybe broken with the new rowID system.
        transactionDate:    currentRow.querySelector(".date").value,
        transactionAmt:     currentRow.querySelector(".amt").value,
        categoryID:         currentRow.querySelector(".category").value,
        accountID:          currentRow.querySelector(".account").value,
        vendorID:           currentRow.querySelector(".vendor").value, //TODO: need to add a way to check if its a new vendor and make the appropriate changes first
        transactionMemo:    currentRow.querySelector(".memo").value
    }
    
    return rowData;
}

function submitRow(rowID){
    let body = getRowData(rowID);

    fetch("/transactionSubmitJson", {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(result =>{
        console.log(result); //TODO: error check
        setRow(rowID, body);
    });
}

function submitAll(){
    console.log("submit all button works");
}

//TODO: need a submit all button. refresh the whole table when clicked