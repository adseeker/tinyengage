# TinyEngagement Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free tier works)
- Database provider (Vercel Postgres recommended)

### 2. Repository Setup
```bash
git init
git add .
git commit -m "Initial TinyEngage MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tinyengage.git
git push -u origin main
```

### 3. Vercel Deployment
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project" and select your `tinyengage` repository
3. Vercel will auto-detect Next.js settings
4. Click "Deploy"

### 4. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. In your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. This automatically sets `DATABASE_URL` environment variable

#### Option B: External Database
- **Neon**: neon.tech (free tier: 0.5GB)
- **PlanetScale**: planetscale.com (free tier: 5GB)
- **Railway**: railway.app (free tier with limits)

### 5. Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```bash
# Authentication (generate strong 32+ character secrets)
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters_long
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_at_least_32_characters_long  
HMAC_SECRET=your_hmac_secret_for_signed_tokens_here_at_least_32_characters_long

# Database (auto-provided if using Vercel Postgres)
DATABASE_URL=postgresql://username:password@host:5432/database

# Optional monitoring
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

### 6. Generate Secure Secrets
```bash
# Run locally to generate secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"  
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Database Migration (If needed)
If you have existing SQLite data to migrate:

```bash
# Export from SQLite
npm run export-data

# Import to production database
npm run import-data
```

### 8. Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `tinyengage.com`)
3. Configure DNS as instructed

### 9. Post-Deployment Testing
1. Visit your deployed URL
2. Create test account: `test@tinyengage.com` / `password123`
3. Create a survey and test the response collection
4. Check analytics dashboard

## 📊 Monitoring & Maintenance

### Performance Monitoring
- **Vercel Analytics**: Automatic page views and performance metrics
- **Sentry** (optional): Error tracking and performance monitoring

### Usage Tracking
Monitor your limits:
- **Vercel Free**: 100GB bandwidth/month, 6000 minutes serverless functions
- **Database**: Check your provider's limits

### Scaling Considerations
When you need to upgrade:
- **Vercel Pro** ($20/month): More bandwidth, functions, storage
- **Database scaling**: Upgrade your database plan as data grows
- **CDN**: Consider Cloudflare for global performance

## 🔒 Security Checklist

- ✅ Strong JWT secrets (32+ characters)
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Database connection encrypted
- ✅ User data isolation implemented
- ✅ Bot detection enabled
- ✅ Rate limiting on response endpoints
- ✅ Input validation on all forms

## 🚨 Troubleshooting

### Common Issues:
1. **Database connection fails**: Check `DATABASE_URL` format
2. **JWT errors**: Ensure secrets are properly set in environment variables
3. **CORS issues**: Check your base URL settings
4. **Email rendering**: Test with actual email clients

### Support Resources:
- Vercel Documentation: vercel.com/docs
- Next.js Documentation: nextjs.org/docs
- GitHub Issues: Create issues in your repository

## 💰 Cost Estimation (Monthly)

### Minimal Setup (Free Tier):
- **Vercel**: $0 (free tier)
- **Vercel Postgres**: $0 (0.5GB included)
- **Total**: $0/month

### Production Setup:
- **Vercel Pro**: $20/month
- **Database**: $5-15/month (depending on usage)
- **Monitoring**: $0-10/month (Sentry free tier available)
- **Total**: $25-45/month

Ready to deploy! 🚀