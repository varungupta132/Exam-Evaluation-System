# 🚀 Deployment Guide - AI Exam Evaluation System

## 📱 Live Demo

**🔗 Live Demo URL**: https://varungupta132.github.io/Exam-Evaluation-System/

*This is a frontend-only demo with sample evaluation results.*

## 🌐 Deployment Options

### Option 1: GitHub Pages (Frontend Only - Demo)
✅ **Already Deployed!**
- **URL**: https://varungupta132.github.io/Exam-Evaluation-System/
- **Features**: Demo with sample results
- **Setup**: Automatic via GitHub Pages

### Option 2: Full Stack Deployment

#### Frontend Deployment
Choose any static hosting:

**Netlify:**
1. Connect GitHub repo
2. Deploy from main branch
3. Auto-deploys on push

**Vercel:**
1. Import GitHub project
2. Deploy automatically
3. Custom domain support

**GitHub Pages:**
- Already configured and live!

#### Backend Deployment Options

**1. Heroku (Recommended)**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create exam-evaluation-backend

# Add Python buildpack
heroku buildpacks:set heroku/python

# Set environment variables
heroku config:set GOOGLE_APPLICATION_CREDENTIALS=<base64-encoded-json>

# Deploy
git push heroku main
```

**2. Google Cloud Run**
```bash
# Build and deploy
gcloud run deploy exam-evaluation \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**3. AWS Lambda + API Gateway**
```bash
# Use serverless framework
npm install -g serverless
serverless deploy
```

**4. Railway**
```bash
# Connect GitHub repo
# Auto-deploy on push
# Add environment variables in dashboard
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file:
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

### Frontend Configuration

Update `script.js` backend URL:
```javascript
// For production
this.backendURL = 'https://your-backend-url.herokuapp.com';
```

## 🔧 Production Setup Steps

### 1. Google Cloud Setup
```bash
# Create project
gcloud projects create exam-evaluation-system

# Enable Vision API
gcloud services enable vision.googleapis.com

# Create service account
gcloud iam service-accounts create exam-evaluator

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account exam-evaluator@exam-evaluation-system.iam.gserviceaccount.com
```

### 2. Backend Deployment (Heroku)
```bash
# Create app
heroku create your-app-name

# Set config vars
heroku config:set GOOGLE_APPLICATION_CREDENTIALS="$(cat key.json | base64)"

# Deploy
git push heroku main
```

### 3. Frontend Update
```bash
# Update backend URL in script.js
# Commit and push to GitHub
git add .
git commit -m "Update backend URL for production"
git push origin main
```

## 📊 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend Demo | ✅ Live | https://varungupta132.github.io/Exam-Evaluation-System/ |
| Backend | 🔄 Pending | Deploy to Heroku/GCP |
| Google Vision API | ⚙️ Setup Needed | Configure credentials |

## 🔍 Testing Deployment

### Demo Version (Current)
1. Visit: https://varungupta132.github.io/Exam-Evaluation-System/
2. Upload any two image files
3. Click "Start Demo Evaluation"
4. See sample evaluation results

### Full Version (After Backend Deploy)
1. Deploy backend with Google Vision API
2. Update frontend script.js with backend URL
3. Test real OCR and evaluation

## 🚀 Scaling Options

### Performance
- Use CDN for frontend assets
- Enable gzip compression
- Optimize image processing
- Add Redis caching

### Features
- User authentication
- Database for history
- Batch processing
- Analytics dashboard
- Multi-language support

## 💡 Cost Optimization

### Google Cloud Vision API
- **Free Tier**: 1,000 requests/month
- **Paid**: $1.50 per 1,000 requests
- **Optimization**: Cache results, batch processing

### Hosting Costs
- **Frontend**: Free (GitHub Pages, Netlify, Vercel)
- **Backend**: 
  - Heroku: $7/month (hobby)
  - Google Cloud Run: Pay per request
  - Railway: $5/month

## 🔒 Security Considerations

### Production Checklist
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Validate file uploads
- [ ] Rate limiting
- [ ] API key security
- [ ] Error handling
- [ ] Input sanitization

## 📞 Support

For deployment help:
- Check logs: `heroku logs --tail`
- GitHub Issues: Create issue for bugs
- Documentation: Read setup_instructions.md

---

**🎯 Quick Start**: The demo is already live! For full functionality, deploy the backend with Google Vision API.