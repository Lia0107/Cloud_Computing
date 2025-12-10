# Build stage
FROM node:18-alpine as build
WORKDIR /app

# 1) Copy package files
COPY package*.json ./

# 2) Install deps
RUN npm install --legacy-peer-deps

# 3) Copy the rest of the app (so /src and /public are available)
COPY . .

# 4) Pass API URL from build arg
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 5) Build React
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

