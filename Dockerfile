# Stage 1: Build stage
FROM node:23-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY --chown=node:node . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Final stage
FROM node:23-slim

# Set the working directory inside the container
WORKDIR /app

# Copy built files from the previous stage
COPY --from=build /app /app

# Set permissions for the /app directory
RUN chown -R node:node /app && chmod -R 755 /app

# Expose port 4000 to the outside world
EXPOSE 4000

# Create a new user and switch to that user
USER node

# Command to run the application
CMD ["node", "dist/src/index.js"]
