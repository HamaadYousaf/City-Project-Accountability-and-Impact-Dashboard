import json
from pymongo import MongoClient
from config.settings import MONGO_URL

client = MongoClient(MONGO_URL)
db = client['city_dashboard']
manual_collection = db['projects']

def process_manual_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
        manual_collection.insert_many(data)
        print(f"Inserted {len(data)} records from {file_path} into MongoDB")

if __name__ == "__main__":
    file_path = '../manual_data/projects_data.json'
    process_manual_json(file_path)
