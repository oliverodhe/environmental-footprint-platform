from flask import Blueprint

# Import each blueprint
from src.app.routes.dashboard import dashboard_bp
from src.app.routes.socket_routes import socket_bp
from src.app.routes.rpi_routes import rpi_bp
from src.app.routes.zone_routes import zone_bp
from src.app.routes.log_routes import log_bp
from src.app.routes.config_routes import config_bp

def register_routes(app):
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(socket_bp)
    app.register_blueprint(rpi_bp)
    app.register_blueprint(zone_bp)
    app.register_blueprint(log_bp)
    app.register_blueprint(config_bp)