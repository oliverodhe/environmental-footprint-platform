import { initTerminal } from '../terminal/interactiveTerminal.js';

export let rpiConnectMessage;

export function initConnectRpiForm(socket) {
    const loadingIndicator = document.getElementById("loading-indicator");
    const resultMessageElement = document.getElementById("result-message");
    const form = document.getElementById("connect-rpi-form");

    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission
    
        // Show the loading indicator and clear any previous messages
        loadingIndicator.style.display = "block";
        resultMessageElement.innerHTML = "";
    
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log(formData);
        console.log(data);
    
        fetch(form.action, {
            method: form.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log("Form submitted successfully:", result);
            rpiConnectMessage = result.command;
            console.log(rpiConnectMessage);
            initTerminal(rpiConnectMessage, socket);
            loadingIndicator.style.display = "none";
            if (result.message === "Connection successful") {
                resultMessageElement.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            } else {
                resultMessageElement.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
            }
        })
        .catch(error => {
            console.error("Error submitting form:", error);
    
            loadingIndicator.style.display = "none";
            resultMessageElement.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
        });
    });
}
