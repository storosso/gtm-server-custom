FROM node:18-alpine

WORKDIR /app

# copy just the JS
COPY server.js ./

# we don't need apk, nginx, etc. — single Node process
EXPOSE 8080

CMD ["node", "server.js"]
