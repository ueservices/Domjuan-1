# Dockerfile for Autonomous Domain Discovery Bot System
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    tini

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create data directory with proper permissions
RUN mkdir -p /app/data /app/logs && \
    chown -R nodejs:nodejs /app

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]