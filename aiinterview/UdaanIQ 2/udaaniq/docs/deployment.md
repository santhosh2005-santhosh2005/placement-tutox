# Deployment Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd udaaniq
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Backend Setup

```bash
cd ../backend
npm install
```

### 4. Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run in Development Mode

Start the backend server:
```bash
cd backend
npm run dev
```

In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

## Production Deployment

### Frontend Deployment (Vercel)

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

### Backend Deployment (Railway)

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login to Railway:
   ```bash
   railway login
   ```
4. Initialize project:
   ```bash
   cd backend
   railway init
   ```
5. Deploy:
   ```bash
   railway up
   ```

### Environment Variables for Production

Set the following environment variables in your deployment platform:

```env
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=your_production_openai_api_key
```

## Docker Deployment (Optional)

### Dockerfile for Backend

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Dockerfile for Frontend

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production
      - OPENAI_API_KEY=your_openai_api_key_here
```

Run with:
```bash
docker-compose up -d
```

## Monitoring and Logging

### Backend Logging

The backend uses console logging by default. For production, consider integrating with:

- Winston for structured logging
- Sentry for error tracking
- Loggly or Papertrail for log aggregation

### Frontend Monitoring

Consider integrating:

- Sentry for frontend error tracking
- Google Analytics or Plausible for usage analytics
- Lighthouse CI for performance monitoring

## Scaling Considerations

### Horizontal Scaling

- Use a load balancer for multiple backend instances
- Implement Redis for session storage
- Use a CDN for static assets

### Database Scaling

- Implement connection pooling
- Use read replicas for read-heavy operations
- Consider database sharding for large datasets

### Caching

- Implement Redis caching for frequently accessed data
- Use browser caching for static assets
- Implement API response caching where appropriate

## Security Considerations

### Backend Security

- Implement rate limiting
- Use helmet.js for HTTP headers security
- Validate and sanitize all inputs
- Implement proper authentication and authorization
- Use environment variables for secrets

### Frontend Security

- Implement Content Security Policy (CSP)
- Sanitize user inputs before displaying
- Use HTTPS in production
- Implement proper error handling to avoid information leakage

## Backup and Recovery

### Database Backup

- Implement regular automated backups
- Store backups in secure, geographically distributed locations
- Test restore procedures regularly

### Disaster Recovery

- Document recovery procedures
- Implement monitoring and alerting
- Regularly test disaster recovery plans

## Maintenance

### Regular Updates

- Keep dependencies up to date
- Monitor for security vulnerabilities
- Apply security patches promptly

### Performance Monitoring

- Monitor application performance
- Set up alerts for performance degradation
- Regularly review and optimize database queries

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check if backend server is running
   - Verify environment variables
   - Check firewall settings

2. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Check available disk space

3. **Performance Issues**
   - Monitor resource usage
   - Check for memory leaks
   - Optimize database queries

### Logs and Debugging

- Check application logs for error messages
- Use debugging tools appropriate for your deployment platform
- Implement structured logging for easier debugging