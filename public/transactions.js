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
        tableHTML += `<tr class="row" id="row_${jsonData.transactions[i].transactionID}">\n`; //TODO: change from total row count as the index to the transaction id as the index
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
            <td><input type="button" value="Edit" class="edit" id="edit_${jsonData.transactions[i].transactionID}"></td>
            </tr>\n`;
    }

    table.innerHTML = tableHTML;

    //adds the event listeners for the edit buttons
    addAllEventListeners();
});

//Add row click event. Using the json data from the database it populates all the dropdowns.
document.querySelector("input").addEventListener("click", event => {
    
    totalRows++;
    table.querySelector("tr").insertAdjacentHTML("beforebegin", drawTableRow(totalRows)); //FIXME: adds the wrong rowID to the row. going by transaction id might fix it? or actually just reverse the row id's from top to bottom

    //Adding the new buttons event listen here seems to fix the issue will the all event listener function
    document.querySelector(`#done_${totalRows}`).addEventListener("click", event => {
            submitRow(event.currentTarget.id.split('_')[1]);
            console.log("done button " +event.currentTarget.id.split('_')[1] + " clicked");
    });

    //when a vendor dropdown switches to add new then replace the dropdown with a textbox. //FIXME: not sure if this should be here. but commenting out the add event listeners broke the add new vendor.
    document.querySelector(`#vendor_${totalRows}`).addEventListener("change", event => {
        if(event.currentTarget.value == "new"){
            event.currentTarget.insertAdjacentHTML("afterend", `<input class="vendor">`);
            event.currentTarget.remove();
        }
    });

    //readds the event listeners for the done buttons and the vendor selector.
    //only adding one new button i dont think this needs to be called 
    //addAllEventListeners(); //TODO: remove?

});

//FIXME: i think this isnt right. but i think i fixed it. it starts to slow down the page as more listeners are added. buttons call functions multiple times //TODO: check where this is called and if the problem is fixed
function addAllEventListeners(){
    //add event listener to each vendor dropdown. the event listeners oddly erase every time a new one is added so they all have to be re-added every time.
    document.querySelectorAll(`.vendor`).forEach(venInput =>{
        
        //when a vendor dropdown switches to add new then replace the dropdown with a textbox.
        venInput.addEventListener("change", event => {
            if(event.currentTarget.value == "new"){
                event.currentTarget.insertAdjacentHTML("afterend", `<input class="vendor">`);
                event.currentTarget.remove();
            }
        });
    });

    //same deal as above
    document.querySelectorAll(`.done`).forEach(doneInput =>{
        
        doneInput.addEventListener("click", event => {
            submitRow(event.currentTarget.id.split('_')[1]);
            console.log("done button " +event.currentTarget.id.split('_')[1] + " clicked");
        });
    });

    document.querySelectorAll(".edit").forEach(editButton =>{
        editButton.addEventListener("click", event => {
            editRow(event.currentTarget.id.split('_')[1]); //Grabs the rowID by splitting it off of the clicked buttons id.
        });
    });

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
                <select class="vendor" name="vendor">
                    <option value="NULL"> -- Select a vendor -- </option>
                    <option value="new">* Add New *</option>`;
    data.vendors.forEach(vendor => {
        newTableRowHtml += `<option value="${vendor.vendorID}">${vendor.vendorName}</option>`;
    });
    newTableRowHtml += `
                </select>
            </td>
            <td><input class="memo"></td>
            <td><input class="done" id="done_${rowID}" type="button" value="Done"></td>
        </tr>`;
    return newTableRowHtml;
}

function editRow(rowID){
    //add new row after the current one. then delete the current one
    let currentRow = document.querySelector("#row_"+ rowID);
    currentRow.insertAdjacentHTML("afterend", drawTableRow(rowID));
    currentRow.remove();

    //Adding the new buttons event listen here seems to fix the issue will the all event listener function
    document.querySelector(`#done_${rowID}`).addEventListener("click", event => {
            submitRow(event.currentTarget.id.split('_')[1]);
            console.log("done button " +event.currentTarget.id.split('_')[1] + " clicked");
    });

    //reselect the new row
    currentRow = document.querySelector("#row_"+ rowID);
    let transIndex = 0;
    for(transIndex = 0; transIndex < data.transactions.length; transIndex++) //Find the index of this transaction in the array
        if(data.transactions[transIndex].transactionID == rowID)
            break;
    
    //Add all table date into the fields
    currentRow.querySelector(".date").value = data.transactions[transIndex].transactionDate.substr(0,10);
    currentRow.querySelector(".amt").value = data.transactions[transIndex].transactionAmt;
    currentRow.querySelector(".category").value = data.transactions[transIndex].categoryID;
    currentRow.querySelector(".account").value = data.transactions[transIndex].accountID;

    let vendorID = data.transactions[transIndex].vendorID
    currentRow.querySelector(".vendor").value = vendorID == null ? "NULL" : vendorID; //This fixes the dropdown selecting a blank value

    currentRow.querySelector(".memo").value = data.transactions[transIndex].transactionMemo;
    
    //shouldnt call this here if we are only updating the one button
    //addAllEventListeners(); //TODO: remove?
}

function getRowData(rowID){
    currentRow = document.querySelector("#row_"+ rowID);

    let rowData = {
        transactionID:      rowID > (totalRows-addedRows) ? null : rowID, //FIXME: maybe broken with the new rowID system.
        transactionDate:    currentRow.querySelector(".date").value,
        transactionAmt:     currentRow.querySelector(".amt").value,
        categoryID:         currentRow.querySelector(".category").value,
        accountID:          currentRow.querySelector(".account").value,
        vendorID:           currentRow.querySelector(".vendor").value,
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
    });
}

//TODO: need a submit all button