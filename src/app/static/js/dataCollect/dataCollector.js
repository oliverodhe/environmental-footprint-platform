// static/js/dataCollect/dataCollector.js

export let latestMetrics = {};    // holds the latest data snapshot
export let logs = [];             // holds all received logs

export function collectData(data) {
    latestMetrics = data;
    logs.push(data);
}
