from flask import Blueprint, request, jsonify
from app.config import config

config_bp = Blueprint("config_routes", __name__)

@config_bp.route('/set_frequency', methods=['POST'])
def set_frequency():
    data = request.json
    frequency = data.get("frequency")
    
    if frequency is None:
        return jsonify({"error": "No frequency provided"}), 400
    
    try:
        frequency = int(frequency)
        if frequency <= 0:
            raise ValueError("Frequency must be positive")

    except ValueError:
        return jsonify({"error": "Invalid frequency value"}), 400
    
    config.FREQUENCY = frequency
    return jsonify({"message": f"Frequency set to {frequency} Hz"}), 200