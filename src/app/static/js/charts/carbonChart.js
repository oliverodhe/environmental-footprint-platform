import { startEvent } from '../observerEvents.js';

import { handleRunButtonClick, shiftMaxDataPoints, createBackupDataset, resetingToBackupDataset } from './chartLogic.js';


var backupDataset;

export function initCarbonChart(socket) {
    const ctx = document.getElementById('carbonChart').getContext('2d');
    const chart = fetchCarbonChart(ctx);
    
    window.carbonChart = chart;
    startEvent.subscribe((data) => handleRunButtonClick(data, chart, backupDataset));

    socket.on('new_data', (data) => {
        //console.log("new other data received");
        updateCarbonChart(chart, data);

        document.getElementById("emission").innerHTML =  data.emission + " μg CO2"; 
      });

}

function fetchCarbonChart(ctx) {
    // Create any gradients or configuration specific for this chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(255, 99, 132, 0.4)");
    gradient.addColorStop(1, "rgba(255, 99, 132, 0.05)");
  
    const chart = new Chart(ctx, {
      type: 'line', // or change to line, pie, etc. depending on your requirements
      data: {
        labels: [], // initialize labels
        datasets: [{
          label: 'Current Emission (μg/s)',
          data: [],
          backgroundColor: gradient,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: "y"
        },
        {
            label: 'Total Emissions (μg)',
            data: [],
            borderColor: 'rgb(5, 101, 16)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maxDataPoints: null,
        animation: {
            duration: 500,
        },
        interaction: {
        mode: "index",
        intersect: false,
        legend: {
            display: true,
            }
        },
        scales: {
          x: {
            type: "time",
            time: {
                unit: "second",
                tooltipFormat: "mm:ss.SS",
                displayFormats: {
                  second: "mm:ss",
                  },
                },
                title: {
                  display: true,
                  text: "Time",
                },
                grid: {
                    display: true,
                    color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                    maxRotation: 0,
                },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
                display: true,
                text: "Current Emission (μg/s)",
            },
            grid: {
                color: "rgba(0, 0, 0, 0.05)",
            },
            beginAtZero: true,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Emissions (μg)'
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        }
      }
    });
    
    backupDataset = createBackupDataset(chart);

    return chart;
}

function updateCarbonChart(chart, data) {
  //Pushing to the chart:
  const timestamp = data.x * 1000;
  chart.data.labels.push(timestamp);
  const timeStep = 1 / data.frequency;
  const energy_kWh = data.y * timeStep / 3_600_000;
  const mikrogramOfCarbon = energy_kWh * data.carbonIntensity * 1_000_000;
  chart.data.datasets[0].data.push({ x: timestamp, y: mikrogramOfCarbon});
  chart.data.datasets[1].data.push({ x: timestamp, y: data.emission});

  //Pushing to the backup dataset:
  backupDataset.labels.push(timestamp);
  backupDataset.datasets[0].data.push({ x: timestamp, y: mikrogramOfCarbon});
  backupDataset.datasets[1].data.push({ x: timestamp, y: data.emission});

  if (chart.options.maxDataPoints !== null) {
    shiftMaxDataPoints(chart);
  }
  else if (chart.options.maxDataPoints == null && chart.data.labels.length !== backupDataset.labels.length) {
    resetingToBackupDataset(chart, backupDataset);
    console.log("Carbon chart data reset to backup dataset.");
  }

  chart.update("none");
}