import pandas as pd

from src.app.api_clients.carbon_intensity import get_zones

import os
from src.app.config import config



def get_eic_codes():
    output_dir = os.path.join(os.getcwd(), "src", "app", "api_clients")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "filtered_eic.csv")
    df_eic = pd.read_csv("src/app/api_clients/Y_eicCodes.csv", delimiter=";")
    filtered_eic = df_eic[df_eic["EicTypeFunctionList"].str.contains("Bidding Zone|Member State", na=False)]  #"Bidding Zone|Member State"
    df_filtered = filtered_eic[filtered_eic["EicCode"].str.startswith("10Y", na=False)]
    df_filtered.to_csv(output_file, index=False)
    return df_filtered

def combined_data():
    bidding_zones = []
    zones_dict = get_zones()
    eic_codes = get_eic_codes()
    for index, row in eic_codes.iterrows():
        display_name = row["EicDisplayName"]
        type_list = row["EicTypeFunctionList"]
        if "Member State" in type_list and "Bidding Zone" in type_list:
            country_code = display_name
            for key in zones_dict:
                if country_code == zones_dict[key]["defaultValue"]:
                    if zones_dict[key].get("electrictyZones") is None:
                        zones_dict[key]["electrictyZones"] = []
                    zones_dict[key]["electrictyZones"].append(display_name)
        elif "Member State" in type_list:
            continue
        else:
            bidding_zones.append(display_name)

    for zone in bidding_zones:
        sZone = zone[:2]
        if len(zone) > 2:
            s = zone[2]
        else:
            s = "-"
        for key in zones_dict:
            if sZone == zones_dict[key]["defaultValue"] and s in "-_0123456789":
                if zones_dict[key].get("electrictyZones") == None:
                    zones_dict[key]["electrictyZones"] = []
                zones_dict[key]["electrictyZones"].append(zone)
    return zones_dict


def european_data():
    zones_dict = combined_data()
    unwanted = []
    for key in zones_dict:
        if zones_dict[key].get("electrictyZones") == None:
            unwanted.append(key)
    for key in unwanted:
        zones_dict.pop(key)
    return zones_dict

if __name__ == "__main__":
    data = european_data()
    for country, info in data.items():
        print(country, info)