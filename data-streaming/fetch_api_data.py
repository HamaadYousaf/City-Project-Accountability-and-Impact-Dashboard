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

# Cost constants
ECONOMIC_COST_PER_DAY = 1000  # $1000/day
HUMAN_COST_PER_DAY = 500      # $2000/day
#OPPORTUNITY_COST_RATE = 0.0006   # 0.06% of original budget per delay day
OPPORTUNITY_COST_PER_DAY = 6000  # Lost growth, revenue, etc.

def fetch_api_data(api_url, target_statuses):
    """Fetch and filter data from the Ontario API based on target statuses."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())

            # Debugging: Print first few records to verify API response
            print(f"Raw API Response Sample: {json.dumps(data['result']['records'][:3], indent=2)}")

            limited_data = data["result"]["records"][:5190]  # Limit to 5190 records
            processed_data = transform_data(limited_data, target_statuses)
            return processed_data
    except Exception as e:
        raise Exception(f"Failed to fetch data from {api_url}: {e}")

def transform_data(data, target_statuses):
    """Process fetched data and filter based on target statuses, adding cost estimation."""
    projects = []

    gta_bounds = {
        "min_lat": 43.29,
        "max_lat": 44.52,
        "min_lon": -80.16,
        "max_lon": -78.32,
    }

    today = datetime.today()

    for item in data:
        status = item.get("Status", "").strip().lower()
        if status not in target_statuses:
            continue

        category = item.get("Category", "Other").lower()
        if category in ["child care", "health care"]:
            continue

        project_name = item.get("Project", "Unknown Project Name")
        description = item.get("Description", "No description available.")
        address = item.get("Address", "Unknown Address") or "Unknown Address"
        postal_code = item.get("Postal Code", "Unknown Postal Code") or "Unknown Postal Code"
        website = item.get("Website", "").strip() if item.get("Website") else DEFAULT_WEBSITE

        longitude = item.get("Longitude")
        latitude = item.get("Latitude")
        original_budget = float(item.get("Estimated Total Budget ($)", 0))

        if not longitude or not latitude or original_budget == 0:
            continue

        try:
            longitude = float(longitude)
            latitude = float(latitude)
        except (ValueError, TypeError):
            continue

        if not (gta_bounds["min_lon"] <= longitude <= gta_bounds["max_lon"] and gta_bounds["min_lat"] <= latitude <= gta_bounds["max_lat"]):
            continue

        original_completion_date_str = item.get("Target Completion Date") or None
        if not original_completion_date_str:
            continue

        try:
            original_completion_date = datetime.strptime(original_completion_date_str[:10], "%Y-%m-%d")
        except ValueError:
            try:
                original_completion_date = datetime.strptime(original_completion_date_str, "%d-%b")
                original_completion_date = original_completion_date.replace(year=today.year)
            except ValueError:
                continue

        # Adjust dates
        if status == "complete":
            if original_completion_date > today:
                original_completion_date = today - timedelta(days=random.randint(365, 1095))
            current_completion_date = original_completion_date
        else:
            months_to_add = random.randint(1, 12)
            current_completion_date = original_completion_date + timedelta(days=30 * months_to_add)

        # Planning dates
        planning_start_date = original_completion_date - timedelta(days=random.randint(730, 1095))
        planning_complete_date = planning_start_date + timedelta(days=random.randint(60, 180))
        construction_start_date = planning_complete_date + timedelta(days=random.randint(30, 120))

        # Efficiency
        delay_days = max((current_completion_date - original_completion_date).days, 0)
        delay_months = delay_days // 30
        efficiency = "Declining" if delay_months > 8 else "Improving" if delay_months < 3 else "Moderate"
        performance_metric = 60 if delay_months > 8 else 90 if delay_months < 3 else 75
        current_budget = original_budget + random.randint(10000, 50000)

        # Dynamic Cost Estimation:
        economic_cost = delay_days * ECONOMIC_COST_PER_DAY
        #opportunity_cost = delay_days * OPPORTUNITY_COST_RATE * original_budget
        opportunity_cost = delay_days * OPPORTUNITY_COST_PER_DAY
        human_cost = delay_days * HUMAN_COST_PER_DAY
        total_cost = economic_cost + opportunity_cost + human_cost

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
            "website": website,
            "efficiency": efficiency,
            "performance_metric": performance_metric,
            "delay_days": delay_days,
            "economic_cost": economic_cost,
            "opportunity_cost": opportunity_cost,
            "human_cost": human_cost,
            "total_cost": total_cost
        }

        projects.append(project)

    return projects

from datetime import datetime

def create_manual_project(
    project_name,
    description,
    longitude,
    latitude,
    original_completion_date_str,
    current_completion_date_str,
    planning_start_date,
    planning_complete_date,
    construction_start_date,
    status,
    original_budget,
    current_budget,
    category,
    result,
    area,
    region,
    address,
    postal_code,
    municipal_funding,
    provincial_funding,
    federal_funding,
    other_funding,
    website,
    efficiency,
    performance_metric
):
    # Constants for Dynamic Cost Estimator (DCE)
    ECONOMIC_COST_PER_DAY = 1000  # $1000/day
    HUMAN_COST_PER_DAY = 2000      # $2000/day
    #OPPORTUNITY_COST_RATE = 0.0006   # 0.06% of original budget per delay day
    OPPORTUNITY_COST_PER_DAY = 6000  # Lost growth, revenue, etc.

    # Parse dates
    original_date = datetime.strptime(original_completion_date_str, "%Y-%m-%d")
    current_date = datetime.strptime(current_completion_date_str, "%Y-%m-%d")

    # Calculate delay in days
    delay_days = max((current_date - original_date).days, 0)

    # Cost calculations
    economic_cost = delay_days * ECONOMIC_COST_PER_DAY
    #opportunity_cost = delay_days * OPPORTUNITY_COST_RATE * original_budget
    opportunity_cost = delay_days * OPPORTUNITY_COST_PER_DAY
    human_cost = delay_days * HUMAN_COST_PER_DAY
    total_cost = economic_cost + opportunity_cost + human_cost

    # Return project dict with costs
    return {
        "project_name": project_name,
        "description": description,
        "location": {"type": "Point", "coordinates": [longitude, latitude]},
        "original_completion_date": original_completion_date_str,
        "current_completion_date": current_completion_date_str,
        "planning_start_date": planning_start_date,
        "planning_complete_date": planning_complete_date,
        "construction_start_date": construction_start_date,
        "status": status,
        "original_budget": original_budget,
        "current_budget": current_budget,
        "category": category,
        "result": result,
        "area": area,
        "region": region,
        "address": address,
        "postal_code": postal_code,
        "municipal_funding": municipal_funding,
        "provincial_funding": provincial_funding,
        "federal_funding": federal_funding,
        "other_funding": other_funding,
        "website": website,
        "efficiency": efficiency,
        "performance_metric": performance_metric,
        # --- Cost Estimation Fields ---
        "delay_days": delay_days,
        "economic_cost": economic_cost,
        "opportunity_cost": opportunity_cost,
        "human_cost": human_cost,
        "total_cost": total_cost
    }
manual_projects = [
    create_manual_project(
        "Eglinton Crosstown LRT Project",
        "A new light rail transit (LRT) system along Eglinton Avenue to improve connectivity in Toronto.",
        -79.39861127113538, 43.70542969100466,
        "2022-12-31", "2025-12-31",
        "2011-06-01", "2013-12-31", "2015-06-01",
        "Under construction",
        5300000000.0, 12800000000.0,
        "Transit",
        "Improved transit across Toronto's East & West ends.",
        "Toronto", "Central",
        "Eglinton Avenue, Toronto, ON", "M4S2B8",
        False, True, True, False,
        "https://www.metrolinx.com/en/projects-and-programs/eglinton-crosstown-lrt",
        "Declining", 60
    ),
    create_manual_project(
        "Ontario Line Subway",
        "A new subway line that will provide faster and more reliable transit in Toronto.",
        -79.3729, 43.65107,
        "2027-12-31", "2030-12-31",
        "2019-01-01", "2021-12-31", "2022-06-01",
        "Under construction",
        10900000000.0, 12000000000.0,
        "Transit",
        "Increase public transport accessibility and reduce congestion.",
        "Toronto", "Central",
        "Ontario Line Route, Toronto, ON", "M5A1A1",
        False, True, True, False,
        "https://www.metrolinx.com/en/projects-and-programs/ontario-line",
        "Moderate", 75
    ),
    create_manual_project(
        "Don Valley Parkway Bridge Rehabilitation",
        "Rehabilitation of key bridge segments along the DVP to improve traffic safety and structural integrity.",
        -79.351, 43.720,
        "2023-09-01", "2024-11-01",
        "2021-01-01", "2022-06-01", "2022-09-01",
        "Under construction",
        8500000.0, 8900000.0,
        "Roads and bridges",
        "Reduced traffic delays and improved bridge lifespan.",
        "Toronto", "Central",
        "Don Valley Parkway, Toronto, ON", "M4B1B3",
        True, True, False, False,
        "https://www.toronto.ca/dvp-bridge-rehab",
        "Moderate", 75
    ),
   
    create_manual_project(
        "Lawrence Heights Community Centre",
        "New community centre including gym, pool, and classrooms for local residents.",
        -79.444, 43.719,
        "2024-03-01", "2025-03-01",
        "2022-01-01", "2022-10-01", "2023-01-01",
        "Under construction",
        29000000.0, 30500000.0,
        "Communities",
        "Enhanced access to local recreational and social spaces.",
        "Toronto", "North York",
        "Lawrence Avenue W, Toronto, ON", "M6A1A1",
        True, True, False, False,
        "https://www.toronto.ca/lawrence-heights-cc",
        "Improving", 90
    ),
    create_manual_project(
        "Gardiner Expressway Phase 3 Repairs",
        "Ongoing structural maintenance to extend the Gardiner’s lifespan and ensure public safety.",
        -79.387, 43.640,
        "2025-01-01", "2026-06-01",
        "2022-06-01", "2023-01-01", "2023-05-01",
        "Planning",
        9800000.0, 10400000.0,
        "Roads and bridges",
        "Improved structural stability and reduced future maintenance.",
        "Toronto", "Central",
        "Gardiner Expressway, Toronto, ON", "M5J2N1",
        True, True, False, False,
        "https://www.toronto.ca/gardiner-repairs",
        "Moderate", 75
    ),
  
    create_manual_project(
        "Yonge Street Sidewalk Widening",
        "Pedestrian safety enhancement via sidewalk expansion and updated intersections.",
        -79.383, 43.652,
        "2023-11-01", "2024-08-01",
        "2021-11-01", "2022-08-01", "2023-01-01",
        "Under construction",
        5200000.0, 5450000.0,
        "Roads and bridges",
        "Better accessibility and improved street safety.",
        "Toronto", "Downtown",
        "Yonge Street, Toronto, ON", "M5B1N8",
        True, True, False, False,
        "https://www.toronto.ca/yonge-sidewalk-project",
        "Improving", 90
    ),
  
    create_manual_project(
        "Wellesley Watermain Replacement",
        "Replacement of aging watermain infrastructure to improve water service reliability.",
        -79.379, 43.666,
        "2023-06-01", "2024-04-01",
        "2021-04-01", "2021-10-01", "2022-01-01",
        "Under construction",
        4800000.0, 5100000.0,
        "Roads and bridges",
        "Better water service and road durability.",
        "Toronto", "Downtown",
        "Wellesley Street, Toronto, ON", "M4Y1G7",
        True, True, False, False,
        "https://www.toronto.ca/wellesley-watermain",
        "Moderate", 75
    ),
    create_manual_project(
        "King Street Transit Priority Expansion",
        "Expanding and modernizing King Street's dedicated streetcar corridor.",
        -79.3832, 43.6487,
        "2024-08-01", "2025-06-01",
        "2022-01-01", "2022-12-31", "2023-03-01",
        "Under construction",
        14500000.0, 16000000.0,
        "Transit",
        "Improved commute times and reduced congestion on King Street.",
        "Toronto", "Central",
        "King Street W, Toronto, ON", "M5V1K1",
        False, True, False, False,
        "https://www.toronto.ca/services-payments/streets-parking-transportation/king-street-pilot/",
        "Improving", 90
    ),
 
 
    create_manual_project(
        "Bloor Street Bridge Strengthening",
        "Reinforcement and seismic upgrade to the Bloor Street Viaduct.",
        -79.3583, 43.6772,
        "2023-12-01", "2025-06-01",
        "2021-01-01", "2022-08-01", "2022-12-01",
        "Under construction",
        33000000.0, 35000000.0,
        "Roads and bridges",
        "Increased structural resilience and reduced risk of failure.",
        "Toronto", "Central",
        "Bloor St E, Toronto, ON", "M4W3Y4",
        False, True, True, False,
        "https://www.toronto.ca/bloorviaductupgrade",
        "Declining", 60
    ),
    create_manual_project(
        "East York Community Centre Renovation",
        "Energy-efficient upgrades and accessibility improvements to the center.",
        -79.3335, 43.6914,
        "2024-03-01", "2025-02-01",
        "2022-05-01", "2022-10-01", "2023-01-01",
        "Under construction",
        9200000.0, 9800000.0,
        "Communities",
        "Improved accessibility and services for residents of East York.",
        "Toronto", "East",
        "1081 ½ Pape Ave, Toronto, ON", "M4K3W4",
        True, True, False, False,
        "https://www.toronto.ca/eastyorkcc",
        "Improving", 90
    ),
 
  
]

def push_to_backend(projects):
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
        print(f"Error while pushing projects: {e}")

def remove_duplicates(projects):
    seen, unique = set(), []
    for p in projects:
        if p['project_name'] not in seen:
            seen.add(p['project_name'])
            unique.append(p)
    return unique

if __name__ == "__main__":
    api_url = "https://data.ontario.ca/api/3/action/datastore_search?resource_id=35dc5416-2b86-4a79-b3e6-acbfe004c81a&limit=5190"

    active_projects = fetch_api_data(api_url, ["under construction", "planning"])
    completed_projects = fetch_api_data(api_url, ["complete"])[:20]
    all_projects = remove_duplicates(active_projects + completed_projects + manual_projects)

    print(f"Pushing {len(all_projects)} projects to backend.")
    push_to_backend(all_projects)

    with open("fetched_data.json", "w") as file:
        json.dump(all_projects, file, indent=4)
        print("Data saved to fetched_data.json\n")