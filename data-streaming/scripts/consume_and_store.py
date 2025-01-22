import pika
import json
from pymongo import MongoClient
from config.settings import MONGO_URL

client = MongoClient(MONGO_URL)
db = client['city_dashboard']
projects_collection = db['projects']

def callback(ch, method, properties, body):
    data = json.loads(body)
    projects_collection.insert_one(data)
    print("Data saved to MongoDB:", data)

def consume_from_queue(queue_name):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name)
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    print('Waiting for messages...')
    channel.start_consuming()

if __name__ == "__main__":
    consume_from_queue('project_queue')
