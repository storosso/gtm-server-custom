#!/bin/bash

# Start NGINX
nginx

# Start GTM server and replace the shell so container stays alive
exec node server.js "$CONTAINER_CONFIG"
