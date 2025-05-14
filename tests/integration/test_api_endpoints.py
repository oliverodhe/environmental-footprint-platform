import pytest
from src.app import create_app
from io import BytesIO

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_zones(client):
    response = client.get('/get-zones')
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert isinstance(data, (list, dict))  # Depending on what european_data() returns

def test_set_frequency(client):
    # Test with valid data
    response = client.post('/set_frequency', 
                          json={"frequency": 5})
    assert response.status_code == 200
    assert response.json["message"] == "Frequency set to 5 Hz"

    # Test with invalid data
    response = client.post('/set_frequency', 
                          json={"frequency": -1})
    assert response.status_code == 400

