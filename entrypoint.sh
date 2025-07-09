
#!/bin/bash

# Start NGINX in the background
nginx

# Forward requests to Google Tag Manager server container
exec node server.js "$CONTAINER_CONFIG"
