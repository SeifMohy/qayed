# Railway Deployment Guide

## 🚀 Deploying to Railway

### Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account created
- Git repository accessible

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Create New Project
```bash
railway new
```

### Step 4: Deploy from this Directory
```bash
# Navigate to server directory
cd server

# Initialize Railway project
railway init

# Deploy
railway up
```

## 🐳 Docker Deployment

### Building the Docker Image
The Docker image should be built from the **root directory** of the project, not from the server directory:

```bash
# From the root directory of the project
docker build -f server/Dockerfile -t qayed-backend .
```

### Running the Docker Container
```bash
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_api_key_here \
  qayed-backend
```

### Docker Compose (Optional)
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=your_api_key_here
```

### Step 5: Configure Environment Variables
Set these environment variables in your Railway project:

#### Required Variables:
- `NODE_ENV=production`
- `PORT=${{PORT}}` (Railway auto-assigns this)
- `GEMINI_API_KEY=your_gemini_api_key_here`

#### Optional Variables:
- `FRONTEND_URL=https://your-frontend-domain.com`
- `MAX_PAGES_PER_CHUNK=5`
- `PROCESSING_DELAY=1000`
- `MAX_RETRIES=3`

### Step 6: Update Frontend Configuration
After deployment, update your frontend `.env.local`:

```bash
# Update with your Railway deployment URL
NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
```

## 🔧 Railway Configuration

### Custom Build Command
Railway will automatically detect the Node.js project and use:
- **Build Command**: `npm install --production=false && npm run build`
- **Start Command**: `npm start`

### Health Check
- **Health Check Path**: `/health`
- **Health Check Timeout**: 300 seconds

### Auto-Scaling
Railway will automatically scale your application based on demand.

## 📝 Deployment Commands

### Initial Deployment
```bash
railway up --detach
```

### Redeploy
```bash
railway up --detach
```

### View Logs
```bash
railway logs
```

### Open in Browser
```bash
railway open
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain
1. Go to your Railway project dashboard
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## 🔍 Monitoring

### View Application Metrics
```bash
railway status
```

### View Real-time Logs
```bash
railway logs --follow
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json

2. **Port Issues**
   - Ensure your app listens on `process.env.PORT`
   - Railway automatically assigns ports

3. **Environment Variables**
   - Verify all required environment variables are set
   - Check variable names match exactly

4. **CORS Issues**
   - Update CORS configuration with your actual frontend domain
   - Check Railway deployment URL is added to CORS allowlist

### Debug Commands:
```bash
# View environment variables
railway variables

# View project info
railway status

# View deployment logs
railway logs --tail 100
```

## 🎯 Testing Deployment

### Test Health Endpoint
```bash
curl https://your-railway-app.railway.app/health
```

### Test PDF Parsing Endpoint
```bash
curl https://your-railway-app.railway.app/api/bank-statements/health
```

## 📊 Performance Optimization

### Recommended Settings:
- Enable railway's auto-scaling
- Set appropriate memory limits
- Configure health checks
- Enable log streaming for debugging

### Production Optimizations:
- Use environment-specific configurations
- Enable error tracking
- Set up monitoring alerts
- Configure backup strategies

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Integration:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
    paths: [ 'server/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🎉 Success!

Once deployed, your Express backend will be available at:
- **URL**: `https://your-railway-app.railway.app`
- **Health Check**: `https://your-railway-app.railway.app/health`
- **PDF Parsing**: `https://your-railway-app.railway.app/api/bank-statements/parse`

Update your frontend configuration to use the Railway URL and you're ready to go! 