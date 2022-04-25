# frontend builder
FROM node:16.2.0-stretch AS builder

WORKDIR /srv
COPY frontend .

RUN npm install && \
    npm run build

# frontend
FROM nginx:1.21.3-alpine AS frontend

WORKDIR /usr/share/nginx/html
COPY --from=builder /srv/public .
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# backend
FROM node:gallium-bullseye-slim AS backend

WORKDIR /app
COPY backend .

RUN npm install

CMD ["node", "index.js"]
