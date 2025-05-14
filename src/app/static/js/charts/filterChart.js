import { startEvent } from '../observerEvents.js';

export function initFilterChart() {
    const interpolationCheck = document.getElementById("interpolation");
    const dataPointSelect = document.getElementById("dataPointSelect");
    const fixedWidthCheck = document.getElementById("fixedChartWidth");
    const frequencySelect = document.getElementById("frequencySetting");

    const savedFrequency = localStorage.getItem("selectedFrequency");

    if (savedFrequency) {
        frequencySelect.value = savedFrequency;
        updateFrequency(savedFrequency); // Apply it immediately
    }


    updateInterpolation(window.powerChart, interpolationCheck.checked);

    interpolationCheck.addEventListener("change", () => {
        updateInterpolation(window.powerChart, interpolationCheck.checked);
        updateInterpolation(window.carbonChart, interpolationCheck.checked);
    });

    dataPointSelect.addEventListener("change", () => {
        const maxDataPoints = parseInt(dataPointSelect.value) || null;
        updateMaxDataPoints(window.powerChart, maxDataPoints);
        updateMaxDataPoints(window.carbonChart, maxDataPoints);
    });

    fixedWidthCheck.addEventListener("change", () => {
        console.log("tect");
        updateFixedWidth(window.powerChart, fixedWidthCheck.checked);
        updateFixedWidth(window.carbonChart, fixedWidthCheck.checked);
    });

    frequencySelect.addEventListener("change", () => {
        updateFrequency(frequencySelect.value);

        localStorage.setItem("selectedFrequency", frequencySelect.value);
    });

    frequencySelect.addEventListener('input', function () {
        const value = parseInt(this.value, 10);
        const min = parseInt(this.min, 10);
        const max = parseInt(this.max, 10);

        if (value < min) this.value = min;
        if (value > max) this.value = max;
    });

    startEvent.subscribe((data) => disableFrequency(data));
}

function disableFrequency(isMonitoring) {
    const frequencySelect = document.getElementById("frequencySetting");
    if (isMonitoring) {
        frequencySelect.disabled = true;
    } else {
        frequencySelect.disabled = false;
    }
}

function updateFrequency(value) {
    fetch("/set_frequency", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ frequency: value })
    })
    .then(response => response.text())
    .then(data => console.log(data));
}

function updateInterpolation(chart, enableInterpolation) {
    // Update the tension property for all datasets
    chart.data.datasets.forEach(dataset => {
        dataset.tension = enableInterpolation ? 0.4 : 0; // 0.4 for interpolation, 0 for no interpolation
    });

    // Update the chart to reflect the changes
    chart.update();
}

function updateMaxDataPoints(chart, maxDataPoints) {
    chart.options.maxDataPoints = maxDataPoints;
}

function updateFixedWidth(chart, enableFixedWidth) {

    const expandDatasetIndex = chart.data.datasets.findIndex(dataset => dataset.label === " ");

    if (enableFixedWidth) {
        // If enabled and the dataset doesn't exist, add it
        if (expandDatasetIndex === -1) {
            chart.data.datasets.push({
                label: " ",
                data: [{ x: 15 * 1000, y: 0 }], // Example fixed-width data point
                borderWidth: 0,
                pointRadius: 0,
                backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
                borderColor: "rgba(0, 0, 0, 0)", // Transparent border
            });
        }
    } else {
        // If disabled and the dataset exists, remove it
        if (expandDatasetIndex !== -1) {
            chart.data.datasets.splice(expandDatasetIndex, 1);
        }
    }

    chart.update();
}