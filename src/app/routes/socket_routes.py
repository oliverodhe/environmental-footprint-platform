from flask import Blueprint
from flask_socketio import emit
from app import socketio
import time
import numpy as np
from app.utils.thread_manager import start_threads, stop_threads, RUN, stop_event, OUTPUT
from app.utils import rpi_manager
from app.config import config
import random

socket_bp = Blueprint("socket_routes", __name__)

def get_power_measurement(): 
    global OUTPUT
    terminal_output = ""
    stdin, stdout, stderr = rpi_manager.run_script(
        ssh=config.SSH, remote_script_path="./power_wrapper2.sh ./" + config.REMOTE_SCRIPT_PATH)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            data = stdout.readline()
            if "power_consumption" in data:
                OUTPUT = data.replace("power_consumption=", "").replace("\n", "")
            else:
                terminal_output += data    
    print(terminal_output)
    OUTPUT = ""

@socketio.on("connect")
def handle_connect():
    print("Client connected")
