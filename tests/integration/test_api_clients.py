import pytest
from unittest.mock import patch, Mock, mock_open
from src.app.api_clients.carbon_intensity import fetch_carbon_intensity, get_zones
from src.app.api_clients.electricity_price import get_electricity_price_data, get_eic_code, get_period_times
from src.app.api_clients.Zone_data import european_data
from datetime import datetime
import pandas as pd

# Mock data for testing
MOCK_CARBON_INTENSITY_RESPONSE = {
    "zone": "SE",
    "carbonIntensity": 50.5,
    "updatedAt": "2024-02-20T12:00:00Z"
}

MOCK_ZONES_RESPONSE = {
    "SE": {
        "countryName": "Sweden",
        "zoneName": "Sweden",
        "subZoneName": "SE"
    },
    "DE": {
        "countryName": "Germany",
        "zoneName": "Germany",
        "subZoneName": "DE"
    }
}

MOCK_ELECTRICITY_PRICE_RESPONSE = """
<?xml version="1.0" encoding="UTF-8"?>
<Publication_MarketDocument>
    <TimeSeries>
        <mRID>1</mRID>
        <in_Domain.mRID>10Y1001A1001A44P</in_Domain.mRID>
        <start>2024-02-20T00:00Z</start>
        <resolution>PT60M</resolution>
        <Point>
            <position>1</position>
            <price.amount>100.50</price.amount>
        </Point>
    </TimeSeries>
</Publication_MarketDocument>
"""

# Mock CSV data for EIC codes
MOCK_EIC_CSV = """EicCode;EicDisplayName;EicLongName
10Y1001A1001A44P;SE;Sweden
10Y1001A1001A45P;NO;Norway"""

def test_fetch_carbon_intensity():
    with patch('requests.get') as mock_get:
        # Configure the mock
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "carbonIntensity": 50.5,
            "updatedAt": "2024-02-20T12:00:00Z"
        }
        mock_get.return_value = mock_response

        # Call the function
        result = fetch_carbon_intensity("SE")

        # Assertions
        assert result == MOCK_CARBON_INTENSITY_RESPONSE
        mock_get.assert_called_once()

def test_get_zones():
    with patch('requests.get') as mock_get:
        # Configure the mock
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = MOCK_ZONES_RESPONSE
        mock_get.return_value = mock_response

        # Call the function
        result = get_zones()

        # Assertions
        assert result is not None
        assert "Sweden" in result
        assert "Germany" in result
        mock_get.assert_called_once()

def test_get_period_times():
    # Create a fixed datetime
    fixed_datetime = datetime(2024, 2, 20, 15, 30)
    
    # Mock datetime.now() to return our fixed datetime
    with patch('src.app.api_clients.electricity_price.datetime') as mock_datetime:
        mock_datetime.now.return_value = fixed_datetime
        mock_datetime.replace = datetime.replace
        
        start, end, current = get_period_times()
        
        assert start == "202402200000"  # Start of day
        assert end == "202402201530"    # Current time
        assert current == fixed_datetime

def test_get_eic_code():
    with patch('builtins.open', mock_open(read_data=MOCK_EIC_CSV)):
        with patch('pandas.read_csv') as mock_read_csv:
            # Mock pandas read_csv to return our test data
            mock_read_csv.return_value = pd.DataFrame([
                {'EicCode': '10Y1001A1001A44P', 'EicDisplayName': 'SE', 'EicLongName': 'Sweden'},
                {'EicCode': '10Y1001A1001A45P', 'EicDisplayName': 'NO', 'EicLongName': 'Norway'}
            ])
            
            result = get_eic_code('SE')
            assert result == '10Y1001A1001A44P'

def test_get_electricity_price_data():
    with patch('requests.get') as mock_get:
        # Mock the API response
        mock_response = Mock()
        mock_response.content = MOCK_ELECTRICITY_PRICE_RESPONSE.encode()
        mock_get.return_value = mock_response

        # Mock the CSV reading
        with patch('pandas.read_csv') as mock_read_csv:
            mock_read_csv.return_value = pd.DataFrame([
                {'EicCode': '10Y1001A1001A44P', 'EicDisplayName': 'SE', 'EicLongName': 'Sweden'}
            ])

            # Mock datetime for consistent testing
            with patch('datetime.datetime') as mock_datetime:
                mock_now = datetime(2024, 2, 20, 15, 30)
                mock_datetime.now.return_value = mock_now

                # Call the function
                result = get_electricity_price_data('10Y1001A1001A44P')

                # Assertions
                assert isinstance(result, pd.DataFrame)
                assert not result.empty
                assert 'price' in result.columns
                assert 'zone' in result.columns
                assert 'actual_time' in result.columns
                assert 'mRID' in result.columns

                # Verify the API was called with correct parameters
                mock_get.assert_called_once()
                call_args = mock_get.call_args[1]['params']
                assert call_args['documentType'] == 'A44'
                assert call_args['processType'] == 'A16'
                assert call_args['in_Domain'] == '10Y1001A1001A44P'
                assert call_args['out_Domain'] == '10Y1001A1001A44P' 