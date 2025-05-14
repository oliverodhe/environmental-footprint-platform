import { initConnectRpiForm } from './forms/connectRpiForm.js';
import { initSaveTable } from './forms/saveTable.js';
import { initPowerChart } from './charts/powerChart.js';
import { initCarbonChart } from './charts/carbonChart.js';
import { initZones } from './zones/zoneSelection.js';
import { initDarkMode } from './themes/darkMode.js';
import { initResizing } from './terminal/resizing.js';
import { initFilterChart } from './charts/filterChart.js';

document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    initConnectRpiForm(socket);
    initSaveTable();
    initZones();
    initPowerChart(socket);
    initCarbonChart(socket);
    initDarkMode();
    initResizing();
    initFilterChart();

});