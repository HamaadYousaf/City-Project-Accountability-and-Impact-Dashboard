import urllib.request
import json
import random
from datetime import datetime, timedelta

def fetch_api_data(api_url):
    try:
        # Set up a request with a User-Agent header
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        req = urllib.request.Request(api_url, headers=headers)

        # Fetch data from the API
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            # Limit to the first 100 records
            limited_data = data['result']['records'][:100]
            processed_data = transform_data(limited_data)
            return processed_data
    except Exception as e:
        raise Exception(f"Failed to fetch data from {api_url}: {e}")

def transform_data(data):
    projects = []

    # Define bounding box for Greater Toronto Area (approximate coordinates)
    gta_bounds = {
        "min_lat": 43.38, "max_lat": 44.10,
        "min_lon": -80.00, "max_lon": -78.90
    }

    for item in data:
        longitude = item.get("Longitude")
        latitude = item.get("Latitude")
        original_budget = float(item.get("Estimated Total Budget ($)", 0))

        # Skip projects with missing or invalid longitude, latitude, or budget
        if not longitude or not latitude or original_budget == 0:
            continue

        try:
            longitude = float(longitude)
            latitude = float(latitude)
        except (ValueError, TypeError):
            continue

        # Exclude projects outside the GTA
        if not (gta_bounds["min_lon"] <= longitude <= gta_bounds["max_lon"] and
                gta_bounds["min_lat"] <= latitude <= gta_bounds["max_lat"]):
            continue

        project_name = item.get("Project") or "Unknown Project Name"
        description = item.get("Description") or "No description available."
        address = item.get("Address", "Unknown Address")
        postal_code = item.get("Postal Code", "Unknown Postal Code")
        original_completion_date_str = item.get("Target Completion Date") or "Unknown"

        # Parse original_completion_date
        try:
            original_completion_date = datetime.strptime(original_completion_date_str, "%d-%b")
            original_completion_date = original_completion_date.replace(year=datetime.now().year)
        except (ValueError, TypeError):
            original_completion_date = None

        # Generate current_completion_date and current_budget
        if original_completion_date:
            months_to_add = random.randint(1, 12)
            current_completion_date = original_completion_date + timedelta(days=30 * months_to_add)
        else:
            current_completion_date = None

        current_budget = original_budget + random.randint(10000, 50000)

        project = {
            "project_name": project_name,
            "description": description,
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude],
            },
            "original_completion_date": original_completion_date.strftime("%Y-%m-%d") if original_completion_date else "Unknown",
            "current_completion_date": current_completion_date.strftime("%Y-%m-%d") if current_completion_date else "Unknown",
            "status": item.get("Status", "Planning"),
            "original_budget": original_budget,
            "current_budget": current_budget,
            "category": item.get("Category", "Other"),
            "result": item.get("Result", "No result available."),
            "area": item.get("Area", "Unknown Area"),
            "region": item.get("Region", "Unknown Region"),
            "address": address,
            "postal_code": postal_code,
            "municipal_funding": item.get("Municipal Funding", "No") == "Yes",
            "provincial_funding": item.get("Provincial Funding", "No") == "Yes",
            "federal_funding": item.get("Federal Funding", "No") == "Yes",
            "other_funding": item.get("Other Funding", "No") == "Yes"
        }
        projects.append(project)
    return projects

if __name__ == "__main__":
    api_url = "https://data.ontario.ca/api/3/action/datastore_search?resource_id=35dc5416-2b86-4a79-b3e6-acbfe004c81a&limit=100"
    fetched_data = fetch_api_data(api_url)

    # Save the data to a JSON file
    with open("fetched_data.json", "w") as json_file:
        json.dump(fetched_data, json_file, indent=4)

    print("\nData saved to fetched_data.json")