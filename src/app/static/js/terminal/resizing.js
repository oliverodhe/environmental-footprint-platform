export function initResizing() {
    const terminalPanel = document.getElementById('terminal-panel');
    const resizeHandle = document.getElementById('terminal-resize-handle');
    const minimizeBtn = document.getElementById('minimizeTerminalBtn');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    let isMinimized = false;
    let startY, startHeight;
    let fitTimeout;

    // Minimize/maximize terminal
    minimizeBtn.addEventListener('click', function() {
        isMinimized = !isMinimized;
        terminalPanel.classList.toggle('terminal-minimized', isMinimized);
        mainContentWrapper.classList.toggle('terminal-minimized', isMinimized);
        minimizeBtn.innerHTML = isMinimized ? 
            '<i class="bi bi-chevron-up"></i>' : 
            '<i class="bi bi-chevron-down"></i>';
        
        // Remove inline height style when toggling
        terminalPanel.style.height = '';
        
        // Resize terminal if maximizing
        if (!isMinimized && window.fitAddon) {
            setTimeout(() => window.fitAddon.fit(), 300);
        }
    });

    // Resize terminal
    resizeHandle.addEventListener('mousedown', function(e) {
        // Don't allow resizing if terminal is minimized
        if (isMinimized) {
            return;
        }

        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(terminalPanel).height, 10);
        document.documentElement.style.cursor = 'ns-resize';
        
        // Disable transitions during resize
        terminalPanel.style.transition = 'none';
        mainContentWrapper.style.transition = 'none';
        
        document.addEventListener('mousemove', resizeTerminal);
        document.addEventListener('mouseup', stopResize);
        
        // Prevent text selection during resize
        e.preventDefault();
    });
 
    function resizeTerminal(e) {
        const newHeight = startHeight - (e.clientY - startY);
        if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
            terminalPanel.style.height = newHeight + 'px';
            mainContentWrapper.style.paddingBottom = newHeight + 'px';
            
            // Debounce the fitAddon.fit() call
            clearTimeout(fitTimeout);
            if (window.fitAddon) {
                fitTimeout = setTimeout(() => window.fitAddon.fit(), 50);
            }
        }
    }
    
    function stopResize() {
        document.documentElement.style.cursor = '';
        document.removeEventListener('mousemove', resizeTerminal);
        document.removeEventListener('mouseup', stopResize);
        
        // Re-enable transitions
        terminalPanel.style.transition = '';
        mainContentWrapper.style.transition = '';
    }
}