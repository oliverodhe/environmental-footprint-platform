# Initializes Flask app and extensions.

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from src.app.config import Config

socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    socketio.init_app(app)

    # Register Blueprints (Modular Routes)
    from src.app.routes import register_routes
    register_routes(app)

    return app