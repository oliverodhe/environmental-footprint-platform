// static/js/logs/updateLogs.js

import { collectData } from '../dataCollect/dataCollector.js';

export function initLogs(socket) {
    socket.on('new_data', (data) => {
        console.log('Received new data from backend:', data);
        collectData(data); 
    });
}
