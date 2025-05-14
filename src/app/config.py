# Stores configuration settings (e.g., database, APIs, secret keys).
import os
import dotenv

dotenv.load_dotenv('.env.local')

class Config:
    USE_API = os.getenv("USE_API")

    # API tokens
    ELECTRICITY_API_TOKEN = os.getenv("ELECTRICITY_API_TOKEN")
    CO2_API_TOKEN = os.getenv("CO2_API_TOKEN")
    
    FREQUENCY = 10

    REMOTE_SCRIPT_PATH = "device_scripts/matrix.sh"

    # Paths and file handling
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DOWNLOAD_FOLDER = os.path.join(BASE_DIR, "downloads")
    CSV_FILE = os.path.join(DOWNLOAD_FOLDER, "log_data.csv")

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

    if not os.path.exists(DOWNLOAD_FOLDER):
        os.makedirs(DOWNLOAD_FOLDER)

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    CURRENT_CO2_ZONE = None
    CURRENT_PRICE_ZONE = None

    CARBON_INTENSITY = None
    ELECTRICITY_PRICE = None

config = Config()
