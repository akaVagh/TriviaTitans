# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set Node environment variable to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install app dependencies
# --production flag to avoid installing devDependencies
RUN npm install --production --legacy-peer-deps

# Bundle app source inside Docker image
COPY . .

# Make port 3000 available to the outside
# This is the port that the app listens on
EXPOSE 3000

# Define the command to run the app
# This uses the definition in package.json
CMD ["npm", "start"]