#!/bin/bash

# Start NGINX in background
nginx

# Start GTM server (this must be node-compatible)
node server.js "$CONTAINER_CONFIG" &

# Wait for both to finish (keep container alive)
wait -n
