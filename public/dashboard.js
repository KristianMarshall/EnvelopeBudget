let monthDelta = 0;

function updateTable() {
    let colsToHide = 2;
    let dashboardJson = fetch(`/DashboardJson?month=${monthDelta}`).then(response => response.json());
    let accountBalanceJson = fetch("/AccountBalanceJson").then(response => response.json());

    Promise.all([dashboardJson, accountBalanceJson]).then(allData => {
        //Handling data from the dashboard json
        let data = allData[0][1];
        let headings = Object.keys(data[0]);
        let tableHTML = "";

        tableHTML += "<tr>\n";
        for (let i = colsToHide; i < headings.length; i++) {
            tableHTML += `<th scope="col">${headings[i]}</th>\n`;
        }
        tableHTML += "</tr>\n";

        let currentGroup = 1;

        for (let i = 0; i < data.length; i++) {
            //If we are at a new group print a heading for it
            if(currentGroup != data[i]["catGroupID"]){
                currentGroup = data[i]["catGroupID"];
                tableHTML += `
                <tr class="table-secondary">
                    <th>${allData[0][2][currentGroup-1].catGroupName}</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
                `;
            }

            tableHTML += "<tr>\n";
            for (let j = colsToHide; j < headings.length; j++) {
                rowData = data[i][headings[j]];
                let classes = "";
                if (rowData == null)
                    rowData = "$0.00";
                else if (typeof rowData == "number"){  
                    if(j == colsToHide+1 && rowData != 0){
                        classes = "fw-semibold ";
                        if(rowData > 0)
                            classes += "text-success";
                        else
                            classes += "text-danger";
                    }
                    rowData = rowData.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });   
                }

                tableHTML += `<td class="${classes}">${rowData}</td>\n`;
            }
            tableHTML += "</tr>\n";
        }
        document.querySelector("#dashboard").innerHTML = tableHTML;
        let selectedDate = new Date(allData[0][0][0]["End Date"]); //this comes in with weird timezone stuff so it actually thinks its the day before
        
        let currMonthText = document.querySelector("#curMonth");
        currMonthText.innerHTML = `   ${months[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}   `;
        currMonthText.classList.remove("placeholder");
        currMonthText.classList.remove("col-2");

        drawAccountBalances(allData[1]);
    });
}
updateTable();

document.querySelector("#prevMonth").addEventListener("click", event => {
    monthDelta++;
    updateTable();

});
document.querySelector("#nextMonth").addEventListener("click", event => {
    monthDelta--;
    updateTable();
});

document.querySelector("#thisMonth").addEventListener("click", event => {
    monthDelta = 0;
    updateTable();
});
