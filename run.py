from src.app import create_app, socketio
from src.app.config import config

app = create_app()

if __name__ == "__main__":
    print(f"Starting Flask App")
    socketio.run(app, debug=True)