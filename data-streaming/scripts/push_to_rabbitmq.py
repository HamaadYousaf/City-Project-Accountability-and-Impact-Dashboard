import pika
import json

def push_to_queue(queue_name, message):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name)
    channel.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(message))
    connection.close()

if __name__ == "__main__":
    message = {
        "project_name": "Highway Expansion",
        "status": "Under Construction",
        "performance_metric": 75,
    }
    push_to_queue('project_queue', message)
