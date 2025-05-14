from threading import Event, Thread, Condition

# Global thread control
RUN = False  # Whether the power measurement should run

stop_event = Event()  # Controls stopping the threads

# Power measurement output
OUTPUT = 0.0

def start_threads(t1_target, t2_target):
    global stop_event
    stop_event.clear()
    thread1 = Thread(target=t1_target)
    thread2 = Thread(target=t2_target)
    thread1.start()
    thread2.start()

def start_thread(target):
    global stop_event
    stop_event.clear()
    thread = Thread(target=target)
    thread.start()

def stop_threads():
    global stop_event
    stop_event.set()