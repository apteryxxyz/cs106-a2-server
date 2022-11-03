# The build runner
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Build the app
COPY . .
RUN npm run build

# Run the app
CMD ["npm", "run", "start"]