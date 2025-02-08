import urllib.request
import json
import random
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGO_API_URL = os.getenv("MONGO_URL")
BACKEND_API_URL = "http://localhost:5000/api/projects/insertMany"

DEFAULT_WEBSITE = "https://www.ontario.ca/page/building-ontario"

def fetch_api_data(api_url):
    """Fetch data from the Ontario API."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())

            # Debugging: Print first few records to verify API response
            print(f"Raw API Response Sample: {json.dumps(data['result']['records'][:3], indent=2)}")

            limited_data = data["result"]["records"][:5000]
            processed_data = transform_data(limited_data)
            # Add the manually defined Eglinton Crosstown LRT project
            processed_data.append(add_manual_project())
            return processed_data
    except Exception as e:
        raise Exception(f"Failed to fetch data from {api_url}: {e}")

def transform_data(data):
    """Process fetched data and exclude invalid entries."""
    projects = []
    
    # GTA Boundary
    gta_bounds = {
        "min_lat": 43.29,  
        "max_lat": 44.52,  
        "min_lon": -80.16,  
        "max_lon": -78.32,  
    }

    for item in data:
        project_name = item.get("Project", "Unknown Project Name")
        category = item.get("Category", "Other")  
        description = item.get("Description", "No description available.")
        
        # Handle missing address & postal code
        address = item.get("Address", "Unknown Address")
        postal_code = item.get("Postal Code", "Unknown Postal Code")

        if address is None or address.strip() == "":
            address = "Unknown Address"

        if postal_code is None or postal_code.strip() == "":
            postal_code = "Unknown Postal Code"

        # **Ensure website is valid, otherwise set to DEFAULT_WEBSITE**
        website = item.get("Website", "").strip() if item.get("Website") else DEFAULT_WEBSITE

        # **Exclude projects with category "Child care" and "Health care"**
        if category.lower() in ["child care", "health care"]:
            print(f"Skipping Project: {project_name} (Category: {category})")
            continue
        
        # **Filter status to only include "Under construction" and "Planning"**
        status = item.get("Status", "").strip().lower()
        if status not in ["under construction", "planning"]:
            print(f"Skipping Project: {project_name} (Invalid status: {status})")
            continue

        print(f"Processing Project: {project_name}")
        
        longitude = item.get("Longitude")
        latitude = item.get("Latitude")
        original_budget = float(item.get("Estimated Total Budget ($)", 0))

        # Skip invalid projects
        if not longitude or not latitude or original_budget == 0:
            print(f"Skipping Project: {project_name} (Invalid criteria)")
            continue

        try:
            longitude = float(longitude)
            latitude = float(latitude)
        except (ValueError, TypeError):
            continue

        # Exclude projects outside GTA
        if not (
            gta_bounds["min_lon"] <= longitude <= gta_bounds["max_lon"]
            and gta_bounds["min_lat"] <= latitude <= gta_bounds["max_lat"]
        ):
            continue
        
        original_completion_date_str = item.get("Target Completion Date") or None

        # Parse original_completion_date
        try:
            if original_completion_date_str:
                original_completion_date = datetime.strptime(original_completion_date_str, "%d-%b")
                original_completion_date = original_completion_date.replace(year=datetime.now().year)
            else:
                original_completion_date = None
        except (ValueError, TypeError):
            original_completion_date = None

        # Generate dates
        if original_completion_date:
            planning_start_date = original_completion_date - timedelta(days=random.randint(730, 1095))
            planning_complete_date = planning_start_date + timedelta(days=random.randint(60, 180))
            construction_start_date = planning_complete_date + timedelta(days=random.randint(30, 120))
            months_to_add = random.randint(1, 12)
            current_completion_date = original_completion_date + timedelta(days=30 * months_to_add)
        else:
            planning_start_date = planning_complete_date = construction_start_date = current_completion_date = None

        # **Skip projects if any required date is missing**
        if not all([original_completion_date, current_completion_date, planning_start_date, planning_complete_date, construction_start_date]):
            print(f"Skipping Project: {project_name} (Missing date fields)")
            continue

        # **Calculate Efficiency and Performance**
        delay = (current_completion_date - original_completion_date).days // 30  # Convert to months

        if delay > 8:
            efficiency = "Declining"
            performance_metric = 60
        elif delay < 3:
            efficiency = "Improving"
            performance_metric = 90
        else:
            efficiency = "Moderate"
            performance_metric = 75

        # Generate current budget
        current_budget = original_budget + random.randint(10000, 50000)

        project = {
            "project_name": project_name,
            "description": description,
            "location": {"type": "Point", "coordinates": [longitude, latitude]},
            "original_completion_date": original_completion_date.strftime("%Y-%m-%d"),
            "current_completion_date": current_completion_date.strftime("%Y-%m-%d"),
            "planning_start_date": planning_start_date.strftime("%Y-%m-%d"),
            "planning_complete_date": planning_complete_date.strftime("%Y-%m-%d"),
            "construction_start_date": construction_start_date.strftime("%Y-%m-%d"),
            "status": item.get("Status", "Planning"),
            "original_budget": original_budget,
            "current_budget": current_budget,
            "category": category,
            "result": item.get("Result", "No result available."),
            "area": item.get("Area", "Unknown Area"),
            "region": item.get("Region", "Unknown Region"),
            "address": address,
            "postal_code": postal_code,
            "municipal_funding": item.get("Municipal Funding", "No") == "Yes",
            "provincial_funding": item.get("Provincial Funding", "No") == "Yes",
            "federal_funding": item.get("Federal Funding", "No") == "Yes",
            "other_funding": item.get("Other Funding", "No") == "Yes",
            "website": website,  # **Updated website handling**
            "efficiency": efficiency,
            "performance_metric": performance_metric
        }
        projects.append(project)
    return projects


def add_manual_project():
    """Create the Eglinton Crosstown LRT Project manually"""
    return {
        "project_name": "Eglinton Crosstown LRT Project",
        "description": "A new light rail transit (LRT) system along Eglinton Avenue to improve connectivity in Toronto.",
        "location": {"type": "Point", "coordinates": [-79.39861127113538, 43.70542969100466]},
        "original_completion_date": "2022-12-31",
        "current_completion_date": "2025-12-31",
        "planning_start_date": "2011-06-01",
        "planning_complete_date": "2013-12-31",
        "construction_start_date": "2015-06-01",
        "status": "Under construction",
        "original_budget": 5600000000.0,
        "current_budget": 6800000000.0,
        "category": "Transit",
        "result": "Improved transit access across Toronto's East & West ends.",
        "area": "Toronto",
        "region": "Central",
        "address": "Eglinton Avenue, Toronto, ON",
        "postal_code": "M4S2B8",
        "municipal_funding": False,
        "provincial_funding": True,
        "federal_funding": True,
        "other_funding": False,
        "website": "https://www.metrolinx.com/en/projects-and-programs/eglinton-crosstown-lrt",
        "efficiency": "Declining",
        "performance_metric": 60
    }

def push_to_backend(projects):
    """Send projects to backend."""
    try:
        response = requests.post(
            BACKEND_API_URL,
            json=projects,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code == 200:
            print("Projects successfully pushed to backend.")
        else:
            print(f"Failed to push projects. Status code: {response.status_code}, Message: {response.text}")
    except Exception as e:
        print(f"Error occurred while pushing projects to backend: {e}")

def remove_duplicates(projects):
    """Remove duplicate projects based on project_name."""
    seen = set()
    unique_projects = []
    for project in projects:
        if project["project_name"] not in seen:
            seen.add(project["project_name"])
            unique_projects.append(project)
    return unique_projects

if __name__ == "__main__":
    api_url = "https://data.ontario.ca/api/3/action/datastore_search?resource_id=35dc5416-2b86-4a79-b3e6-acbfe004c81a&limit=5000"
    fetched_data = fetch_api_data(api_url)
    print(f"Total projects fetched: {len(fetched_data)}")

    unique_projects = remove_duplicates(fetched_data)
    projects_to_push = unique_projects[:100]
    print(f"Pushing {len(projects_to_push)} projects to backend.")
    push_to_backend(projects_to_push)

    with open("fetched_data.json", "w") as json_file:
        json.dump(unique_projects, json_file, indent=4)

    print("\nData saved to fetched_data.json")
