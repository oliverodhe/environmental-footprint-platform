# Environmental Footprint Platform

A platform for monitoring and analyzing the environmental impact of scripts running on a Raspberry Pi 5. Track real-time energy consumption and carbon emissions of your code execution.

## Features

- Real-time energy consumption monitoring
- Carbon emission calculations
- Electricity cost tracking
- Interactive dashboard with live data visualization
- Configurable measurement zones for accurate regional data

## Prerequisites

- Python 3.10 or higher
- Raspberry Pi 5
- Required API tokens (see Configuration section)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd environmental-footprint-platform
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your API tokens to `.env.local`:
     ```
     ELECTRICITY_API_TOKEN="your_electricity_api_token_here"
     CO2_API_TOKEN="your_co2_api_token_here"
     ```
     Note: If you don't want to use api – leave the tokens as empty strings and set `USE_API=false`.

5. Verify installation:
   ```bash
   pytest tests/
   ```
   Note: If you haven't made any code changes, only `test_config.py` is relevant.

## Usage

1. Start the application:
   ```bash
   python run.py
   ```
   The application will be available at `http://localhost:5000`

2. Connect to your Raspberry Pi:
   - Click the settings icon in the upper right corner
   - Enter your Raspberry Pi's hostname, username, and password
   - Click "Connect"
   - The application will automatically upload and configure the required measurement scripts

3. Configure measurement zones (optional):
   - In the settings tab, select appropriate metric zones for accurate regional data

4. Monitor script execution:
   - On your Raspberry Pi, run your script using:
     ```bash
     ./power_wrapper.sh 'name_of_your_script_and_args'
     ```
   - View real-time measurements of:
     - Energy consumption
     - Carbon emissions
     - Electricity costs

## Development

### Running Tests

Run all tests:
```bash
pytest tests/
```

Run specific test categories:
```bash
pytest tests/unit/        # Unit tests
pytest tests/integration/ # Integration tests
```

### Project Structure

```
environmental-footprint-platform/
├── src/
│   ├── app/
│   │   ├── api_clients/    # External API integrations
│   │   ├── routes/         # Flask routes
│   │   ├── templates/      # HTML templates
│   │   └── utils/          # Utility functions
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── .env.example           # Environment variables template
├── requirements.txt       # Python dependencies
└── run.py                # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
