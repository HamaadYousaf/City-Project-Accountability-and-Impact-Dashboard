import urllib.request
import json


def fetch_api_data(api_url):
    try:
        # Set up a request with a User-Agent header
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        req = urllib.request.Request(api_url, headers=headers)

        # Fetch data from the API
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            # Limit to the first 10 records
            limited_data = data['result']['records'][:10]
            processed_data = transform_data(limited_data)
            return processed_data
    except Exception as e:
        raise Exception(f"Failed to fetch data from {api_url}: {e}")


def transform_data(data):
    projects = []
    for item in data:
        longitude = item.get("Longitude")
        latitude = item.get("Latitude")

        # Ensure longitude and latitude are valid before conversion
        if longitude is None or latitude is None:
            longitude = 0.0
            latitude = 0.0

        project = {
            "project_name": item.get("Project Name"),
            "description": item.get("Project Description"),
            "location": {
                "type": "Point",
                "coordinates": [
                    float(longitude),
                    float(latitude)
                ],
            },
            "original_completion_date": item.get("Original Completion Date"),
            "current_completion_date": item.get("Current Completion Date"),
            "status": item.get("Status", "Planning"),
            "original_budget": float(item.get("Original Budget", 0)),
            "current_budget": float(item.get("Current Budget", 0)),
            "category": item.get("Category", "Other"),
            "result": item.get("Result"),
            "area": item.get("Area"),
            "region": item.get("Region"),
            "address": item.get("Address"),
            "postal_code": item.get("Postal Code"),
            "municipal_funding": bool(item.get("Municipal Funding", False)),
            "provincial_funding": bool(item.get("Provincial Funding", False)),
            "federal_funding": bool(item.get("Federal Funding", False)),
            "other_funding": bool(item.get("Other Funding", False)),
            "performance_metric": float(item.get("Performance Metric", 50)),
            "efficiency": item.get("Efficiency", "Moderate"),
        }
        projects.append(project)
    return projects


if __name__ == "__main__":
    api_url = "https://data.ontario.ca/api/3/action/datastore_search?resource_id=35dc5416-2b86-4a79-b3e6-acbfe004c81a&limit=10"
    fetched_data = fetch_api_data(api_url)

    # Save the data to a JSON file
    with open("fetched_data.json", "w") as json_file:
        json.dump(fetched_data, json_file, indent=4)

    print("\nData saved to fetched_data.json")
