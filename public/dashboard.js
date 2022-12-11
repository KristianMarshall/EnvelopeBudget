let dashboardJson = fetch("/DashboardJson").then(response => response.json());
let accountBalanceJson = fetch("/AccountBalanceJson").then(response => response.json());

window.addEventListener("load", event => {
    Promise.all([dashboardJson, accountBalanceJson]).then(allData => {
        //Handling data from the dashboard json
        let data = allData[0];
        let headings = Object.keys(data[0]);
        let tableHTML = "";

        tableHTML += "<tr>\n";
        for (let i = 1; i < headings.length; i++) {
            tableHTML += `<th>${headings[i]}</th>\n`;
        }
        tableHTML += "</tr>\n";

        for (let i = 1; i < data.length; i++) {
            tableHTML += "<tr>\n";
            for (let j = 1; j < headings.length; j++) {
                rowData = data[i][headings[j]];

                if (typeof rowData == "number")
                    rowData = rowData.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

                tableHTML += `<td>${rowData}</td>\n`;
            }
            tableHTML += "</tr>\n";
        }
        document.querySelector("table").innerHTML = tableHTML;

        
        drawAccountBalances(allData[1]);
    });
});