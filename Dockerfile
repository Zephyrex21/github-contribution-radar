FROM node:20-alpine

WORKDIR /app

# Copy only the server (backend) folder's package files first for better layer caching
COPY server/package*.json ./

RUN npm install --omit=dev

# Copy the rest of the server source code
COPY server/ ./

EXPOSE 5000

CMD ["node", "index.js"]
