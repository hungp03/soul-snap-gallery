# Stage 1: Build
FROM node:20-alpine AS builder

# Set workdir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build project
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only package.json to install production deps
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy dist from builder
COPY --from=builder /app/dist ./dist

# Copy config
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/src ./src

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
