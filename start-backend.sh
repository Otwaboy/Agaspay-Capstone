#!/bin/bash

# Start MongoDB if not already running
if ! pgrep -x "mongod" > /dev/null; then
    mkdir -p /tmp/mongodb/data
    mkdir -p /tmp/mongodb/logs
    mongod --dbpath /tmp/mongodb/data --logpath /tmp/mongodb/logs/mongodb.log --port 27017 --bind_ip localhost --fork
    echo "MongoDB started on localhost:27017"
    sleep 2
fi

# Start the backend server
cd Backend && npm run dev
