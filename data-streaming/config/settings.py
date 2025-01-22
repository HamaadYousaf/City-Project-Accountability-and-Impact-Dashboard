import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB Connection URL
MONGO_URL = os.getenv("MONGO_URL")

# RabbitMQ URL
RABBITMQ_URL = os.getenv("RABBITMQ_URL")

# Application Port
PORT = os.getenv("PORT", 5000)

print("Settings loaded successfully.")