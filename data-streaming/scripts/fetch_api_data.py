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
            limited_data = data['result']['records'][:40]
            processed_data = transform_data(limited_data)
            return processed_data
    except Exception as e:
        raise Exception(f"Failed to fetch data from {api_url}: {e}")

def transform_data(data):
    projects = []
    for item in data:
        longitude = item.get("Longitude")
        latitude = item.get("Latitude")

        # Skip projects with missing or invalid longitude and latitude
        if not longitude or not latitude:
            continue

        try:
            longitude = float(longitude)
            latitude = float(latitude)
        except (ValueError, TypeError):
            continue

        project_name = item.get("Project") or "Unknown Project Name"
        description = item.get("Description") or "No description available."
        address = item.get("Address", "Unknown Address")
        postal_code = item.get("Postal Code", "Unknown Postal Code")
        target_completion_date = item.get("Target Completion Date") or "Unknown"
        estimated_budget = float(item.get("Estimated Total Budget ($)", 0))

        project = {
            "project_name": project_name,
            "description": description,
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude],
            },
            "target_completion_date": target_completion_date,
            "status": item.get("Status", "Planning"),
            "estimated_budget": estimated_budget,
            "category": item.get("Category", "Other"),
            "result": item.get("Result", "No result available."),
            "area": item.get("Area", "Unknown Area"),
            "region": item.get("Region", "Unknown Region"),
            "address": address,
            "postal_code": postal_code,
            "municipal_funding": item.get("Municipal Funding", "No") == "Yes",
            "provincial_funding": item.get("Provincial Funding", "No") == "Yes",
            "federal_funding": item.get("Federal Funding", "No") == "Yes",
            "other_funding": item.get("Other Funding", "No") == "Yes",
            "website": item.get("Website", "Unknown Website")
        }
        projects.append(project)
    return projects

if __name__ == "__main__":
    api_url = "https://data.ontario.ca/api/3/action/datastore_search?resource_id=35dc5416-2b86-4a79-b3e6-acbfe004c81a&limit=40"
    fetched_data = fetch_api_data(api_url)

    # Save the data to a JSON file
    with open("fetched_data.json", "w") as json_file:
        json.dump(fetched_data, json_file, indent=4)

    print("\nData saved to fetched_data.json")