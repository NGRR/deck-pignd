FROM nginx:1.27-alpine

# Serve the static UI kit from Nginx default web root.
COPY . /usr/share/nginx/html

EXPOSE 80
