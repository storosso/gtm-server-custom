FROM node:18-slim

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y nginx curl && apt-get clean

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
