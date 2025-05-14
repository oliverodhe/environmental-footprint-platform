import { latestMetrics, logs } from '../dataCollect/dataCollector.js';

console.log("saveTable.js loaded");

export function initSaveTable() {
    console.log("Initializing SaveTable");

    const withLogsBtn = document.getElementById("download-with-logs");
    const withoutLogsBtn = document.getElementById("download-without-logs");

    if (!withLogsBtn || !withoutLogsBtn) {
        console.error("Download options not found in DOM");
        return;
    }

    withLogsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Download clicked: Including Output Logs");
        saveTableToServer(true);
    });

    withoutLogsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Download clicked: Excluding Output Logs");
        saveTableToServer(false);
    });
}

function saveTableToServer(includeLogs) {
    console.log("saveTableToServer called | includeLogs =", includeLogs);

    // Prepare tableData only if logs are included
    let tableData = [];
    if (includeLogs) {
        if (logs.length === 0) {
            console.error("No logs received yet! logs =", logs);
            setButtonStatus("error");
            return;
        }
        tableData = logs.map((data, index) => [
            index + 1,
            new Date().toLocaleDateString(),
            new Date(data.x * 1000).toLocaleTimeString(),
            data.y,
            "Script"
        ]);
        console.log("Prepared tableData:", tableData);
    } else {
        console.log("Logs will be excluded");
    }

    // Prepare metrics (always included)
    if (!latestMetrics || Object.keys(latestMetrics).length === 0) {
        console.error("No backend metrics received yet! latestMetrics =", latestMetrics);
        setButtonStatus("error");
        return;
    }

    const metrics = {
        Price: latestMetrics.total_cost ?? "N/A",
        Intensity: latestMetrics.carbonIntensity ?? "N/A",
        emission: latestMetrics.emission ?? "N/A",
        "Average Consumption": latestMetrics.averagePower ?? "N/A",
        "Time Elapsed": latestMetrics.time ?? "N/A",
        "Total Consumption": latestMetrics.totalConsumption ?? "N/A"
    };

    // Send data to Flask
    fetch("/save-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableData, metrics })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log("Backend responded OK, starting download...");
            downloadLogFromServer();
        } else {
            console.error("Error returned by backend:", data.error);
            setButtonStatus("error");
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
        setButtonStatus("error");
    });
}

function downloadLogFromServer() {
    console.log("Starting file download...");

    fetch("/download-log")
        .then(response => {
            console.log("Download response status:", response.status);
            if (!response.ok) {
                throw new Error(`Download failed! HTTP status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "log_data.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("File download triggered");
            setButtonStatus("success");
        })
        .catch(error => {
            console.error("Download error:", error);
            setButtonStatus("error");
        });
}

function setButtonStatus(status) {
    const button = document.getElementById("download-btn");
    if (!button) {
        console.error("Download button not found when setting status");
        return;
    }

    console.log("Setting button status:", status);

    if (status === "success") {
        button.style.backgroundColor = "green";
        button.innerText = "Download Successful ✔";
    } else if (status === "error") {
        button.style.backgroundColor = "red";
        button.innerText = "Download Failed ✖";
    }

    setTimeout(() => {
        button.style.backgroundColor = "";
        button.innerText = "Download CSV";
    }, 3000);
    }
    