from flask import Blueprint, request, jsonify, render_template
from src.app.utils import rpi_manager, thread_manager
from src.app.config import config
import os
import time
from src.app import socketio
import numpy as np


rpi_bp = Blueprint("rpi_routes", __name__)

CONNECTION = None

@rpi_bp.route('/submit-rpi-form', methods=['POST'])
def submit_rpi_form():
    data = request.get_json()
    hostname = data.get('hostname')
    username = data.get('username')
    password = data.get('password')
    print(f"Hostname: {hostname}, Username: {username}, Password: {password}")

    global CONNECTION
    try:
        CONNECTION = rpi_manager.ssh(hostname, username, password)
    except Exception as e:
        print(f"Error connecting to RPI: {e}")
        return jsonify({"message": "Connection failed"})

    CONNECTION.open_shell()
    time.sleep(1)
    data = rpi_manager.fulldata
    rpi_manager.fulldata = ''
    return jsonify({"message": "Connection successful", "command": data})

@rpi_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'shellscript' not in request.files:
        return "No file part"
    file = request.files['shellscript']
    if file.filename == '':
        return "No selected file"
    if file and file.filename.endswith('.sh'):
        filepath = os.path.join(config.UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        return render_template("index.html", title="Dashboard")

    return "Invalid file type"

@rpi_bp.route('/send-command-to-rpi/', methods=['POST'])
def send_command_to_rpi():
    data = request.get_json().get("command")        
    wrapper_path = "/home/rasp"

    if not data:
        return jsonify({"error": "No command provided"}), 400

    print(data)
    if "bash ./power_wrapper2.sh" in data:
        print("start thread test")
        thread_manager.start_thread(target=rpi_manager.send_live_power_data)

    if data.startswith("CO2 "):
        data = data.replace("CO2", "bash " + wrapper_path + "/power_wrapper.sh")
        thread_manager.start_thread(target=rpi_manager.send_live_power_data)

    CONNECTION.send_shell(data)

    print(f"Received command: {rpi_manager.fulldata}")

    return jsonify({"message": "Command sent successfully", "command": rpi_manager.fulldata})