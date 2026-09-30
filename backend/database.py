from pymongo import MongoClient
import os
import logging
from dotenv import load_dotenv

# Explicitly load the .env file in case uvicorn/python doesn't auto-load it
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

try:
    client.admin.command('ping')
    logging.info("MongoDB cluster connected successfully!")
except Exception as e:
    logging.warning(f"Failed to connect to MongoDB cluster at {MONGO_URI}. History saving and Auth will not work until Database is provided. Error: {e}")

db = client.biodex_db

users_collection = db["users"]
history_collection = db["history"]
