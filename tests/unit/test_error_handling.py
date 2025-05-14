import pytest
from unittest.mock import patch, Mock
from src.app.routes.rpi_routes import submit_rpi_form
from src.app import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    return app

def test_rpi_connection_failure(app):
    """Test handling of RPI connection failure"""
    with app.test_client() as client:
        # Mock the SSH connection to raise an exception
        with patch('src.app.utils.rpi_manager.ssh') as mock_ssh:
            # Configure the mock to raise an exception
            mock_ssh.side_effect = Exception("Connection refused")
            
            # Make the request with test data
            response = client.post('/submit-rpi-form', 
                                 json={
                                     'hostname': 'test.host',
                                     'username': 'test_user',
                                     'password': 'test_pass'
                                 })
            
            # Check the response
            assert response.status_code == 200
            data = response.get_json()
            assert data['message'] == "Connection failed"
            