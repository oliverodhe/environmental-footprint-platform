import { startEvent } from '../observerEvents.js';

import { collectData } from '../dataCollect/dataCollector.js';

import { handleRunButtonClick, shiftMaxDataPoints, createBackupDataset, resetingToBackupDataset } from './chartLogic.js';



var backupDataset;

export function initPowerChart(socket) {
  const ctx = document.getElementById('myChart').getContext('2d');
  const chart = fetchChart(ctx);

  window.powerChart = chart;
  startEvent.subscribe((data) => handleRunButtonClick(data, chart, backupDataset));

  socket.on('new_data', (data) => {
    updateChart(chart, data);
    collectData(data);

    document.getElementById("totalCost").innerHTML = data.total_cost + " €";
    //document.getElementById("emission").innerHTML = data.emission + " mg";
    document.getElementById("avgPower").innerHTML = data.averagePower + " W";
    document.getElementById("timeElapsed").innerHTML = data.time + " s";
    document.getElementById("totCon").innerHTML = data.totalConsumption + " Wh";
    document.getElementById("co2Intensity").innerHTML = data.carbonIntensity + " gCO2/kWh";

  });
}

function fetchChart(ctx) {
  const powerGradient = ctx.createLinearGradient(0, 0, 0, 400)
  powerGradient.addColorStop(0, "rgba(13, 110, 253, 0.4)")
  powerGradient.addColorStop(1, "rgba(13, 110, 253, 0.05)")

  const chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: [],
          datasets: [{
              label: "Power (W)",
              data: [],
              borderColor: "rgba(13, 110, 253, 1)",
              backgroundColor: powerGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(13, 110, 253, 1)",
              yAxisID: "y",
          },
          {
              label: 'Consumption (Wh)',
              data: [],
              borderColor: '997#20c',
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
                    text: "Power (W)",
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
                    text: 'Consumption (Wh)'
                  },
                  grid: {
                    drawOnChartArea: false,
                  }
                }
          }
      },
  });

  backupDataset = createBackupDataset(chart);
  console.log("Backup dataset initialized: ", backupDataset);

  return chart;
}



function updateChart(chart, data) {
  const timestamp = data.x * 1000;
  chart.data.labels.push(timestamp);
  chart.data.datasets[0].data.push({ x: timestamp, y: data.y});
  chart.data.datasets[1].data.push({ x: timestamp, y: data.totalConsumption });

  pushingToBackupDataset(data, timestamp);
  
  if (chart.options.maxDataPoints !== null) {
    // Shift logic
    shiftMaxDataPoints(chart);
  } 
  else if (chart.options.maxDataPoints == null && chart.data.labels.length !== backupDataset.labels.length) {
    resetingToBackupDataset(chart, backupDataset);
    console.log("Power Chart data reset to backup dataset.");
  }

  chart.update("none");
}

function pushingToBackupDataset(data, timestamp) {
  backupDataset.labels.push(timestamp);
  backupDataset.datasets[0].data.push({ x: timestamp, y: data.y});
  backupDataset.datasets[1].data.push({ x: timestamp, y: data.totalConsumption });
}
