import threading, paramiko, time
from src.app import socketio
from .thread_manager import OUTPUT, stop_event, stop_threads
from src.app.config import config
import numpy as np


strdata=''
fulldata=''

class ssh:
    shell = None
    client = None
    transport = None

    def __init__(self, address, username, password):
        print("Connecting to server on ip", str(address) + ".")
        self.client = paramiko.client.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.client.AutoAddPolicy())
        self.client.connect(address, username=username, password=password, look_for_keys=False)
        self.transport = paramiko.Transport((address, 22))
        self.transport.connect(username=username, password=password)

        thread = threading.Thread(target=self.process)
        thread.daemon = True
        thread.start()

    def close_connection(self):
        if(self.client != None):
            self.client.close()
            self.transport.close()

    def open_shell(self):
        print("Opening shell")
        self.shell = self.client.invoke_shell()

    def send_shell(self, command):
        if(self.shell):
            self.shell.send(command + "\n")
        else:
            print("Shell not opened.")

    def process(self):
        global strdata, fulldata
        while True:
            # Print data when available
            if self.shell is not None and self.shell.recv_ready():
                alldata = self.shell.recv(1024)
                while self.shell.recv_ready():
                    # print(self.shell.recv(1024).decode("utf-8"))
                    alldata += self.shell.recv(1024)
                strdata = strdata + alldata.decode("utf-8")
                fulldata = fulldata + alldata.decode("utf-8")

                strdata = self.print_lines(strdata) # print all received data except last line

    def print_lines(self, data):
        global OUTPUT
        last_line = data
        if '\n' in data:
            lines = data.splitlines()
            for i in range(0, len(lines)-1):
                print(lines[i])
                line = lines[i]
                if "power_consumption=" in line:
                    OUTPUT = float(line.replace("power_consumption=", "").replace("\x1b[?2004l", ""))
                elif line != '':
                    socketio.emit('terminal_data', {'line_data': line})
                if "Energy consumed" in last_line:
                    stop_threads()
            last_line = lines[len(lines) - 1]
            if data.endswith('\n'):
                print(last_line)
                if "power_consumption=" in last_line:
                    OUTPUT = float(last_line.replace("power_consumption=", "").replace("\x1b[?2004l", ""))
                else:
                    socketio.emit('terminal_data', {'line_data': last_line})
                if "Energy consumed" in last_line:
                    stop_threads()
                last_line = ''
        return last_line


def send_live_power_data():
    global OUTPUT
    data_x = []
    data_y = []
    start_time = time.time()
    if config.USE_API:
        carbon_intensity = config.CARBON_INTENSITY
        electricity_price = config.ELECTRICITY_PRICE
    else:
        carbon_intensity = None
        electricity_price = None
    total_consumption = 0
    while not stop_event.is_set():
        elapsed_time = np.round(time.time()-start_time,1)
        data_x.append(elapsed_time)
        data_y.append(OUTPUT)
        current_consumption = data_y[-1]/(config.FREQUENCY*3600) 
        total_consumption += current_consumption
        average_power = total_consumption*3600/elapsed_time
        emission = np.round(carbon_intensity * total_consumption * 1000, 2) if carbon_intensity is not None else "N/A" 
        total_cost = electricity_price * total_consumption / 1_000_000 if electricity_price is not None else "N/A"
        socketio.emit('new_data', {'x': data_x[-1], 'y': data_y[-1], 
                                   "averagePower": average_power, 
                                   "time":elapsed_time, 
                                    "totalConsumption": np.round(total_consumption, 4), 
                                    "emission":  emission, 
                                    "total_cost": total_cost, 
                                    "carbonIntensity": carbon_intensity, 
                                    "frequency": config.FREQUENCY})
        time.sleep(1/config.FREQUENCY)


def calculate_total_power(data_y, frequency):
    time_step = 1 / frequency
    total_energy_wh = sum(power * time_step / 3600 for power in data_y)
    return total_energy_wh
