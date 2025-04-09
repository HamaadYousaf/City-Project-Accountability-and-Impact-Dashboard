# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Expo CLI globally
RUN npm install -g expo-cli

# Copy the rest of the application
COPY . .

# Set environment variables - update this to your host machine's IP
ENV DEV_API_URL=http://host.docker.internal:5000

# Expose the port Expo runs on
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start the application
CMD ["npx", "expo", "start", "--tunnel"] 