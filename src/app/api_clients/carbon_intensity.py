import requests
import pandas as pd
import os
import dotenv

dotenv.load_dotenv('.env.local')

api_token = os.getenv("CO2_API_TOKEN")

URL = "https://api.electricitymap.org/v3/carbon-intensity/latest"
ZONES = ["SE", 'SE-SE1', 'SE-SE2', 'SE-SE3', 'SE-SE4', "DE", "FR",
         "NO", "NO-NO1", "NO-NO2", "NO-NO3", "NO-NO4", "NO-NO5", 'ES']
HEADERS = {"auth-token": api_token}

def fetch_carbon_intensity(zone):
    response = requests.get(URL, params={"zone": zone}, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        return {
            "zone": zone,
            "carbonIntensity": data.get("carbonIntensity", None),
            "updatedAt": data.get("updatedAt", None)
        }
    else:
        print(f"Error {response.status_code} for {zone}: {response.text}")
        return None


def get_carbon_intensity_data(selected_zone):
    data_list = [fetch_carbon_intensity(zone) for zone in selected_zone]
    df = pd.DataFrame(data_list)
    return df


def get_zones():
    response = requests.get(
    "https://api.electricitymap.org/v3/zones",
    #headers={
    #    "auth-token": api_token
    #    }
    )
    if response.status_code == 200:
        data = response.json()
        #print(data)
        country_zones = {}
        for zone, info in data.items():
            #print(zone, info)
            #print(len(info))
            country = info.get('countryName', info.get('zoneName'))
            if country not in country_zones:
                country_zones[country] = {}
                country_zones[country]['defaultValue'] = zone
                country_zones[country]['zones'] = []
            country_zones[country]['zones'].append(zone)
        return country_zones
    else:
        print(f"Error {response.status_code}")
        return None


'''
zones_dict = get_zones()
for country, info in zones_dict.items():
    print(country, info)
'''
    

# Convert to DataFrame
#zones_df = pd.DataFrame([(country, zone) for country, zones in zones_dict.items() for zone in zones], columns=['Country', 'Zone'])
#print(zones_df)


#print(fetch_carbon_intensity('SE-SE4'))
