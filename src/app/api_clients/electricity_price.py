from bs4 import BeautifulSoup
import requests
import pandas as pd
from datetime import datetime, timedelta
import os
import dotenv

dotenv.load_dotenv('.env.local')

api_token = os.getenv("ELECTRICITY_API_TOKEN")


def get_period_times():
    current_time = datetime.now().replace(second=0, microsecond=0)
    period_start = (current_time).replace(hour=0, minute=0).strftime('%Y%m%d%H%M')
    period_end = current_time.strftime('%Y%m%d%H%M')
    return period_start, period_end, current_time

def fetch_electricity_price(zone):
    URL = "https://web-api.tp.entsoe.eu/api"
    PARAMS = {
        "documentType": "A44",
        "processType": "A16",
        "periodStart": get_period_times()[0],
        "periodEnd": get_period_times()[1],
        "in_Domain": zone,
        "out_Domain": zone,
        "securityToken": api_token
        }

    response = requests.get(URL, params=PARAMS)
    soup = BeautifulSoup(response.content, 'xml')
    return soup


def get_electricity_price_data(zone):    
    timeseries = fetch_electricity_price(zone).find_all('TimeSeries')

    df_EIC = pd.read_csv("app/api_clients/Y_eicCodes.csv", delimiter=";")
    eic_dict = dict(zip(df_EIC['EicCode'], df_EIC['EicLongName']))


    closest_time = {}

    for i in timeseries:
        mRID = i.find('mRID').text
        in_domain = i.find('in_Domain.mRID').text
        start_time = datetime.strptime(i.find('start').text, "%Y-%m-%dT%H:%MZ")
        resolution = i.find('resolution').text

        region = eic_dict.get(in_domain, "Unknown Region")

        for point in i.find_all('Point'):
            position = int(point.find('position').text)
            price = float(point.find('price.amount').text)

            if resolution == "PT60M":
                actual_time = start_time + timedelta(hours=position-1)
            elif resolution == "PT15M":
                actual_time = start_time + timedelta(minutes=15*(position-1))
            else:
                raise ValueError("Unexpected resolution format")

            if actual_time < (get_period_times()[2] - timedelta(hours=1)):
                if mRID not in closest_time or abs(actual_time - get_period_times()[2]) < abs(closest_time[mRID]['actual_time'] - get_period_times()[2]):
                    closest_time[mRID] = {
                        'zone': region,
                        'price': price,
                        'actual_time': actual_time,
                        'mRID': mRID,
                    }

    df = pd.DataFrame(closest_time.values())
    return df


def get_eic_code(zone):
    df_EIC = pd.read_csv("app/api_clients/Y_eicCodes.csv", delimiter=";")
    eic_code = df_EIC[df_EIC["EicDisplayName"] == zone]["EicCode"].iloc[0]
    return eic_code

