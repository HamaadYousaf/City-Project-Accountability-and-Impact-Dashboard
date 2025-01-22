import requests
from config.settings import MONGO_URL

def fetch_api_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        # Limit to the first 10 results
        limited_data = data['results'][:10]
        processed_data = transform_data(limited_data)
        # save_to_mongo(processed_data)  # Uncomment if saving to MongoDB
        return processed_data
    else:
        raise Exception(f"Failed to fetch data from {api_url}. Status code: {response.status_code}")

def transform_data(data):
    projects = []
    for item in data:
        project = {
            "project_name": item.get("title"),
            "description": item.get("overview"),
            "location": {
                "type": "Point",
                "coordinates": [item.get("longitude", 0), item.get("latitude", 0)],
            },
            "original_completion_date": item.get("original_completion_date"),
            "current_completion_date": item.get("current_completion_date"),
            "status": item.get("status", "Planning"),
            "original_budget": item.get("original_budget", 0),
            "current_budget": item.get("current_budget", 0),
            "category": item.get("category", "Other"),
            "result": item.get("result"),
            "area": item.get("area"),
            "region": item.get("region"),
            "address": item.get("address"),
            "postal_code": item.get("postal_code"),
            "municipal_funding": item.get("municipal_funding", False),
            "provincial_funding": item.get("provincial_funding", False),
            "federal_funding": item.get("federal_funding", False),
            "other_funding": item.get("other_funding", False),
            "performance_metric": item.get("performance_metric", 50),
            "efficiency": item.get("efficiency", "Moderate"),
        }
        projects.append(project)
    return projects

if __name__ == "__main__":
    api_url = "https://api.themoviedb.org/3/discover/movie?api_key=256da2d742d5a5979790e6833447e4b4"
    fetched_data = fetch_api_data(api_url)
    print("Fetched and processed data:", fetched_data)