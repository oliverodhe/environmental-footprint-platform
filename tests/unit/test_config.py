import os
from src.app.config import Config

def test_env_file_exists():
    """Test that .env.local file exists"""
    assert os.path.exists('.env.local'), ".env.local file not found"

def test_use_api_config():
    """Test that USE_API config is set correctly"""
    config = Config()
    assert config.USE_API != None, "USE_API is not set"
    assert config.USE_API == "true" or config.USE_API == "false", "USE_API is not set to true or false"
    
def test_required_env_variables():
    """Test that all required environment variables are present and valid"""
    # Create a Config instance
    config = Config()
    
    if config.USE_API == "true":
        # Test that API tokens are present
        assert config.ELECTRICITY_API_TOKEN is not None, "ELECTRICITY_API_TOKEN is not set"
        assert config.CO2_API_TOKEN is not None, "CO2_API_TOKEN is not set"
        assert config.ELECTRICITY_API_TOKEN != "", "ELECTRICITY_API_TOKEN is empty"
        assert config.CO2_API_TOKEN != "", "CO2_API_TOKEN is empty"
        assert config.ELECTRICITY_API_TOKEN != "your_electricity_api_token_here", "ELECTRICITY_API_TOKEN has example value"
        assert config.CO2_API_TOKEN != "your_co2_api_token_here", "CO2_API_TOKEN has example value"
        
