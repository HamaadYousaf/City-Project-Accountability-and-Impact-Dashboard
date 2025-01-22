from jsonschema import validate, ValidationError
import json
from fetch_api_data import fetch_api_data

# Load the schema
schema = json.load(open('../json_schemas/project_schema.json'))

def validate_project_data(data):
    try:
        validate(instance=data, schema=schema)
        print("Validation successful!")
        return True
    except ValidationError as e:
        print(f"Validation error: {e}")
        return False

if __name__ == "__main__":
    # Fetch data from the API
    api_url = "https://api.themoviedb.org/3/discover/movie"
    extracted_data = fetch_api_data(api_url)

    # Validate each project in the extracted data
    for project in extracted_data:
        validate_project_data(project)