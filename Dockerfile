# Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine
WORKDIR /app

# Copy dependencies and build files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy the .env file
COPY .env .env

# Expose port (default for NestJS is 3000)
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/src/main"]
