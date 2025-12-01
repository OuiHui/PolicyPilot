import os
from pymongo import MongoClient
import sys

# Connect to MongoDB
uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/policypilot")
print(f"Connecting to {uri}...")
client = MongoClient(uri)

# List databases
print("Databases:", client.list_database_names())

# Check policypilot db
db = client.policypilot
print("Collections in policypilot:", db.list_collection_names())

# Check for case
case_id = "1764467678791"
print(f"Looking for case {case_id}...")
case = db.cases.find_one({"id": case_id})

if case:
    print("✅ Case found!")
    print("Denial files:", len(case.get("denialFiles", [])))
else:
    print("❌ Case NOT found!")
    # List all cases
    print("Available cases:")
    for c in db.cases.find({}, {"id": 1}):
        print(c.get("id"))
