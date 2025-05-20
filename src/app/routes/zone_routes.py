from flask import Blueprint, request, jsonify
from src.app.api_clients.carbon_intensity import get_carbon_intensity_data, fetch_carbon_intensity
from src.app.api_clients.electricity_price import get_electricity_price_data
from src.app.api_clients.Zone_data import european_data
from src.app.api_clients.electricity_price import get_eic_code
from src.app.config import config

zone_bp = Blueprint("zone_routes", __name__)

@zone_bp.route('/get-zones', methods=['GET'])
def zone_info():
    zones = european_data()
    return jsonify(zones)

@zone_bp.route("/set_carbon_zone", methods=["POST"])
def set_carbon_zone():
    return set_zone_generic(
        zone_type="Carbon Intensity Zone",
        config_attribute="CARBON_INTENSITY",
        processing_function=get_carbon_data
    )


@zone_bp.route("/set_price_zone", methods=["POST"])
def set_price_zone():
    return set_zone_generic(
        zone_type="Electricity Price Zone",
        config_attribute="ELECTRICITY_PRICE",
        processing_function=refactor_electricity_price_data
    )


def set_zone_generic(zone_type, config_attribute, processing_function):
    data = request.json
    selected_zone = data.get("zone")

    if not selected_zone:
        return jsonify({"error": "No zone selected"}), 400

    if selected_zone is not None:
        setattr(config, config_attribute, processing_function(selected_zone))

    return jsonify({"message": f"{zone_type} set to {selected_zone}"}), 200

def get_carbon_data(zone):
    api_data = fetch_carbon_intensity(zone)
    print(api_data)
    value = api_data.get("carbonIntensity")
    return value

def refactor_electricity_price_data(zone):
    eic_code = get_eic_code(zone)
    print(get_electricity_price_data([eic_code]))
    return get_electricity_price_data(eic_code)["price"].iloc[0]