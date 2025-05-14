export function initTerminal(rpiConnectMessage, socket) {
    const terminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#1e1e1e',
            foreground: '#f8f8f8'
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        scrollback: 1000
    });


    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    
    terminal.open(document.getElementById('terminal'));
    
    // Ensure the terminal fits its container
    setTimeout(() => fitAddon.fit(), 100);
    
    // Welcome message
    terminal.write(rpiConnectMessage);
    // terminal.writeln('Type "help" for available commands');
    socket.on('terminal_data', (data) => {
        console.log("DATA received:" + data.line_data);
        terminal.writeln('' + data.line_data);
     });
    // Handle terminal input
    let command = '';
    terminal.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        
        if (domEvent.keyCode === 13) { // Enter key
            terminal.writeln('');
            processCommand(terminal, command);
            command = '';
            terminal.write('$ ');
        } else if (domEvent.keyCode === 8) { // Backspace
            if (command.length > 0) {
                command = command.substring(0, command.length - 1);
                terminal.write('\b \b');
            }
        } else if (printable) {
            command += key;
            terminal.write(key);
        }
    });
    
    // Store terminal instance for later use
    window.terminal = terminal;
    window.fitAddon = fitAddon;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        fitAddon.fit();
    });

}

function processCommand(terminal, command) {
    console.log("Sending command:", command);
    fetch('/send-command-to-rpi/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ command: command }) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log("Sent succesfully", result);
        // terminal.write(result.command);
    })
    .catch(error => {
        console.error("Error sending command:", error);
    });
}
