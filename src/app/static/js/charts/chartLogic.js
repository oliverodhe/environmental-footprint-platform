export function handleRunButtonClick(isMonitoring, chart, backup) {
    if (isMonitoring) {
      console.log("Monitoring started.");
      clearChartData(chart, backup);
    } else {
      console.log("Monitoring stopped.");
    }
}
  
function clearChartData(chart, backup) {
    const hasData = chart.data.datasets.some(dataset => dataset.data.length > 0);

    if (hasData) {
        console.log("Clearing data...");

        chart.data.datasets.forEach(dataset => {
        dataset.data = []; // Clear the data array
        });

        chart.data.labels = [];

        chart.update();

        backup.datasets.forEach(dataset => {
          dataset.data = []; // Clear the data array
        });

        backup.labels = [];

    } else {
        console.log("Chart is already empty.");
    }
}


export function shiftMaxDataPoints(chart){
  const maxDataPoints = chart.options.maxDataPoints;
  if (chart.data.labels.length > maxDataPoints) {
    const excess = chart.data.labels.length - maxDataPoints;
    chart.data.labels.splice(0, excess);;
    chart.data.datasets.forEach((dataset) => {
      dataset.data.splice(0, excess);;
    });
  }
}

export function createBackupDataset(chart) {
  const backupDataset = {
    labels: [...chart.data.labels],
    datasets: chart.data.datasets.map(ds => ({
      // copy the styling props you need:
      label:           ds.label,
      borderColor:     ds.borderColor,
      backgroundColor: ds.backgroundColor,  // this will still point at your CanvasGradient
      borderWidth:     ds.borderWidth,
      fill:            ds.fill,
      tension:         ds.tension,
      pointRadius:     ds.pointRadius,
      pointHoverRadius:ds.pointHoverRadius,
      pointHoverBackgroundColor: ds.pointHoverBackgroundColor,
      yAxisID:         ds.yAxisID,
      // …and *most importantly* copy the data array itself:
      data:            [...ds.data]
    }))
  };
  return backupDataset;
}


export function resetingToBackupDataset(chart, backup) {
  chart.data.labels = [...backup.labels];
  chart.data.datasets.forEach((ds, i) => {
    ds.data = [...backup.datasets[i].data];
  });
}