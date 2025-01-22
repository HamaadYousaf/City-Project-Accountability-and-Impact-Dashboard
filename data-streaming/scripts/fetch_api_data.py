import urllib.request
from config.settings import MONGO_URL
import json

def fetch_api_data(api_url):
    try:
        # Fetch data from the API
        with urllib.request.urlopen(api_url) as response:
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
        project = {
            "project_name": item.get("Project Name"),
            "description": item.get("Project Description"),
            "location": {
                "type": "Point",
                "coordinates": [
                    float(item.get("Longitude", 0)),
                    float(item.get("Latitude", 0))
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
    print("Fetched and processed data:", fetched_data)