import pytest
from src.app.config import Config

def test_api_tokens_not_in_code():
    """Test that API tokens are not hardcoded in the source code"""
    # List of files to check
    source_files = [
        'src/app/api_clients/carbon_intensity.py',
        'src/app/api_clients/electricity_price.py',
        'src/app/config.py'
    ]
    
    for file_path in source_files:
        with open(file_path, 'r') as file:
            content = file.read()
            assert 'your_electricity_api_token_here' not in content, f"Hardcoded token found in {file_path}"
            assert 'your_co2_api_token_here' not in content, f"Hardcoded token found in {file_path}"

def test_config_security():
    """Test security-related configuration settings"""
    config = Config()
    
    # Test that sensitive data is not exposed in debug messages
    assert 'ELECTRICITY_API_TOKEN' not in str(config), "API token exposed in config string representation"
    assert 'CO2_API_TOKEN' not in str(config), "API token exposed in config string representation" 