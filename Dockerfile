# frontend builder
FROM node:20.11-bullseye AS builder

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
FROM node:22 AS backend

WORKDIR /app
COPY backend .

RUN npm install

CMD ["node", "index.js"]
