import json
from pymongo import MongoClient
from config.settings import MONGO_URL

def populate_mongo(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)
        client = MongoClient(MONGO_URL)
        db = client["city_dashboard"]
        collection = db["projects"]
        collection.insert_many(data)
        print("Manual data populated in MongoDB")

if __name__ == "__main__":
    populate_mongo("../manual_data/projects_data.json")
