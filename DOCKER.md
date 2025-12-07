# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.x+

## Quick Start

### Production Deployment

```bash
# Build and start the container
npm run docker:build
npm run docker:up

# Check logs
npm run docker:logs

# Stop container
npm run docker:down
```

The service will be available at `http://localhost:3000`

### Development Mode (with hot reload)

```bash
# Start dev container with live reload
npm run docker:up-dev

# Logs will stream automatically
# Press Ctrl+C to stop
```

## Manual Docker Commands

### Build Production Image

```bash
docker build -t infinity-index:latest .
```

### Build Development Image

```bash
docker build -f Dockerfile.dev -t infinity-index:dev .
```

### Run Production Container

```bash
docker run -d \
  --name infinity-index \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config:ro \
  -v $(pwd)/schemas:/app/schemas:ro \
  infinity-index:latest
```

### Run Development Container

```bash
docker run -it \
  --name infinity-index-dev \
  -p 3000:3000 \
  -v $(pwd)/src:/app/src:ro \
  -v $(pwd)/config:/app/config:ro \
  -v $(pwd)/schemas:/app/schemas:ro \
  infinity-index:dev
```

## Docker Compose

### Production

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Development

```bash
# Start with live reload
docker-compose -f docker-compose.dev.yml up

# Stop (Ctrl+C or in another terminal)
docker-compose -f docker-compose.dev.yml down
```

## Health Checks

The container includes automatic health checks:

- **Endpoint**: `GET /health`
- **Interval**: Every 30 seconds
- **Timeout**: 3 seconds
- **Start Period**: 5 seconds
- **Retries**: 3 attempts before marking unhealthy

Check container health:

```bash
docker ps
# Look for "healthy" status

# Or detailed health check
docker inspect infinity-index --format='{{.State.Health.Status}}'
```

## Environment Variables

Configure via `docker-compose.yml` or `-e` flags:

- `NODE_ENV` - Set to `production` or `development`
- `PORT` - Server port (default: 3000)

## Volumes

Production container mounts:

- `./config:/app/config:ro` - Configuration files (read-only)
- `./schemas:/app/schemas:ro` - JSON schemas (read-only)

Development adds:

- `./src:/app/src:ro` - Source code for hot reload

## Networking

All containers join the `infinity-network` bridge network, allowing service-to-service communication.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs infinity-index

# Check if port 3000 is already in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # macOS/Linux
```

### Health check failing

```bash
# Check health status
docker inspect infinity-index --format='{{json .State.Health}}'

# Test endpoint manually
curl http://localhost:3000/health
```

### Changes not reflected (dev mode)

```bash
# Restart dev container
docker-compose -f docker-compose.dev.yml restart

# Or rebuild if Dockerfile changed
docker-compose -f docker-compose.dev.yml up --build
```

## Production Deployment

For production deployment (e.g., AWS ECS, Kubernetes):

1. **Push to Registry**:

   ```bash
   docker tag infinity-index:latest your-registry/infinity-index:latest
   docker push your-registry/infinity-index:latest
   ```

2. **Use Health Checks**: Container includes built-in health checks for orchestrators

3. **Resource Limits**: Set appropriate CPU/memory limits in your orchestrator

4. **Scaling**: Service is stateless and can be horizontally scaled

## API Testing

Once running, test endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get all repos
curl http://localhost:3000/repos

# Get specific repo
curl http://localhost:3000/repos/index

# Get all actions
curl http://localhost:3000/actions

# Get OpenAPI spec
curl http://localhost:3000/actions/openapi

# Get service graph
curl http://localhost:3000/graph/services

# Validate configs
curl http://localhost:3000/validate
```
