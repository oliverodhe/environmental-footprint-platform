export function initDarkMode(socket) {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const dashboardIcon = document.getElementById('dashboard-icon');

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.setAttribute('data-bs-theme', 'dark');
        darkModeToggle.checked = true;
        updateChartColors(window.powerChart, true);
        updateChartColors(window.carbonChart, true);
        dashboardIcon.classList.remove('text-primary');
        dashboardIcon.style.color = '#ffa500';
    } else {
        document.body.setAttribute('data-bs-theme', 'light'); // Default to light mode
        darkModeToggle.checked = false;
        updateChartColors(window.powerChart, false);
        updateChartColors(window.carbonChart, false);
        dashboardIcon.classList.add('text-primary');
        dashboardIcon.style.color = ''; // Reset to default
    }

    darkModeToggle.addEventListener('change', () => {
        let darkMode;

        if (darkModeToggle.checked) {
            document.body.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('darkMode', 'enabled');
            darkMode = true;
            dashboardIcon.classList.remove('text-primary');
            dashboardIcon.style.color = '#ffa500';
        } else {
            document.body.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('darkMode', 'disabled');
            darkMode = false;
            dashboardIcon.classList.add('text-primary');
            dashboardIcon.style.color = '';
        }

        updateChartColors(window.powerChart, darkMode); 
        updateChartColors(window.carbonChart, darkMode);
    });
}

function updateChartColors(chart, darkMode) {
    const powerGradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
    if (darkMode) {
        powerGradient.addColorStop(0, "rgba(255, 165, 0, 0.4)"); // Orange gradient for dark mode
        powerGradient.addColorStop(1, "rgba(255, 165, 0, 0.05)");
    } else {
        powerGradient.addColorStop(0, "rgba(13, 110, 253, 0.4)"); // Blue gradient for light mode
        powerGradient.addColorStop(1, "rgba(13, 110, 253, 0.05)");
    }

    const powerBorderColor = darkMode ? "rgba(255, 165, 0, 1)" : "rgba(13, 110, 253, 1)";
    const consumptionBorderColor = darkMode ? "rgba(0, 255, 255, 1)" : "rgba(40, 167, 69, 1)";
    const textColor = darkMode ? "#ffffff" : "#000000"; // White for dark mode, black for light mode

    // Update dataset colors
    chart.data.datasets[0].backgroundColor = powerGradient;
    chart.data.datasets[0].borderColor = powerBorderColor;
    chart.data.datasets[0].pointHoverBackgroundColor = powerBorderColor;

    chart.data.datasets[1].borderColor = consumptionBorderColor;

    chart.options.scales.x.ticks.color = textColor; // X-axis tick labels
    chart.options.scales.x.title.color = textColor; // X-axis title
    chart.options.scales.y.ticks.color = textColor; // Y-axis tick labels
    chart.options.scales.y.title.color = textColor; // Y-axis title
    chart.options.scales.y1.ticks.color = textColor; // Y1-axis tick labels
    chart.options.scales.y1.title.color = textColor; // Y1-axis title

    chart.options.plugins.legend.labels.color = textColor; // Legend text
    //chart.options.plugins.tooltip.bodyColor = textColor; // Tooltip text
    //chart.options.plugins.tooltip.titleColor = textColor; // Tooltip title

    // Update the chart
    chart.update();
}