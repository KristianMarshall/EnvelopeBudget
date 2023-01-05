'use strict'
fetch(`/AccountReportJson`).then(response => response.json())
  .then(reportData => {

    let chartData = {
      netIncome: [],
      income: [],
      expenses: [],
      labels: []
    }

    let startMonth = Number(reportData[0][0]["@fromDate"].split("-")[1]) - 1;
    for (let month = 0; month < 12; month++) {
      if (startMonth > 11)
        startMonth = 0;

      chartData.income.push(reportData[1][startMonth].Income);
      chartData.expenses.push(reportData[1][startMonth].Expenses);
      let netIncome = reportData[1][startMonth].Income + reportData[1][startMonth].Expenses;
      chartData.netIncome.push(netIncome == 0 ? null : netIncome);
      chartData.labels.push(months[startMonth]);

      startMonth++;
    }

    drawChart(chartData);
  });

function drawChart(chartData) {
  // Graphs
  const ctx = document.getElementById('myChart')

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Net Income',
        data: chartData.netIncome,

        type: 'line',
        fill: false,
        backgroundColor: '#cbbf34',
        borderColor: '#fff044'
      }, {
        label: 'Income',
        data: chartData.income,
        backgroundColor: '#38d37d'
      }, {
        label: 'Expenses',
        data: chartData.expenses,
        backgroundColor: '#e11a1e'
      }]
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }
            label += tooltipItem.yLabel.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });
            return label;
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function (value, index, values) {
              return value.toLocaleString("en-CA", { style: 'currency', currency: 'CAD' });
            }
          }
        }],
        xAxes: [{
          stacked: true
        }]
      }
    }
  });
}
