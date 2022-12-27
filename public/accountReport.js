'use strict'

// Graphs
const ctx = document.getElementById('myChart')

const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Income',
        data: [1200, 750, 1100, 687, 1645, 1354],
        backgroundColor: '#38d37d'
      },{
        label: 'Expense',
        data: [-1325, -925, -874, -982, -1123, -1213],
        backgroundColor: '#e11a1e'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value, index, values) {
              return '$' + value;
            }
          }
        }],
        xAxes: [{
          stacked: true
        }]
      }
    }
  });
