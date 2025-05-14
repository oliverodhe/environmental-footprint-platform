import pytest
from src.app import create_app

def test_app_creation():
    """Test that the Flask application can be created without errors."""
    try:
        app = create_app()
        assert app is not None
    except Exception as e:
        pytest.fail(f"Failed to create Flask application: {str(e)}") 