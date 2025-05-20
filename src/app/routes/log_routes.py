from flask import Blueprint, request, jsonify, send_file
import pandas as pd
from src.app.config import config
import os

log_bp = Blueprint("log_routes", __name__)

@log_bp.route('/save-log', methods=['POST'])
def save_log():
    try:
        json_data = request.get_json()
        table_data = json_data.get("tableData", [])  # Get log data
        metrics = json_data.get("metrics", {})  # Get metrics data

        if not metrics:
            return jsonify({"error": "No metrics provided"}), 400

        # Convert log data into DataFrame
        df_logs = pd.DataFrame(table_data, columns=["#", "Date", "Relative Time", "Electricity Consumed", "Script"])

        # Convert metrics data into DataFrame (single-row table)
        df_metrics = pd.DataFrame([metrics])
        df_metrics.insert(0, "#", "METRICS")  # Label it as METRICS row

        # Save everything to CSV
        with open(config.CSV_FILE, "w", newline="") as file:
            file.write("=== OUTPUT LOGS ===\n")
            df_logs.to_csv(file, index=False)
            file.write("\n=== METRICS ===\n")
            df_metrics.to_csv(file, index=False)

        return jsonify({"message": "Log data and metrics saved successfully", "file_path": config.CSV_FILE})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@log_bp.route('/download-log')
def download_log():
    try:
        if not os.path.isfile(config.CSV_FILE):
            return jsonify({"error": "Log file not found"}), 404

        return send_file(config.CSV_FILE, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
