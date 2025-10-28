#!/bin/bash

# Create MongoDB data directory
mkdir -p /tmp/mongodb/data
mkdir -p /tmp/mongodb/logs

# Start MongoDB
mongod --dbpath /tmp/mongodb/data --logpath /tmp/mongodb/logs/mongodb.log --port 27017 --bind_ip localhost --fork

echo "MongoDB started on localhost:27017"
