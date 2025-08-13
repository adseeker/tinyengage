# TinyEngage - Email Survey SaaS MVP

A micro SaaS platform for collecting feedback directly in emails with one-click responses.

## ✨ Features

### Core MVP Features
- ✅ **Survey Builder** - Create emoji, rating, and binary choice surveys
- ✅ **Email Template Generator** - Mobile-optimized HTML email templates
- ✅ **One-Click Responses** - Signed URLs for instant feedback collection
- ✅ **Bot Detection** - Multi-signal scoring to filter out automated responses
- ✅ **Analytics Dashboard** - Real-time response tracking and visualization
- ✅ **User Authentication** - JWT-based auth with refresh tokens
- ✅ **Thank You Pages** - Personalized confirmation pages

### Security & Privacy
- ✅ HMAC-signed response tokens prevent tampering
- ✅ Opaque recipient IDs protect user privacy
- ✅ Bot detection with configurable thresholds
- ✅ Secure password hashing with bcrypt

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your secrets (keep defaults for development)
   ```

3. **Initialize the database:**
   ```bash
   node scripts/init-db.js
   ```

4. **Create a test user (optional):**
   ```bash
   node scripts/test-setup.js
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the MVP

### Test User Credentials
- **Email:** test@tinyengage.com
- **Password:** password123

### Test Flow
1. Register/Login at `/auth/register` or `/auth/login`
2. Create a new survey at `/dashboard/surveys/new`
3. Choose a template (emoji satisfaction, NPS, thumbs up/down)
4. Preview the email template from the survey details page
5. Test response collection by clicking buttons in the preview

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── surveys/      # Survey CRUD operations
│   ├── auth/             # Login/register pages
│   ├── dashboard/        # Protected dashboard area
│   ├── r/                # Response collection endpoint
│   └── thank-you/        # Confirmation pages
├── components/ui/         # shadcn/ui components
├── hooks/                 # React hooks (Zustand store)
├── lib/                   # Core utilities
│   ├── auth.ts           # JWT authentication
│   ├── crypto.ts         # Token signing/verification
│   ├── db.ts             # SQLite database setup
│   ├── bot-detection.ts  # Anti-bot algorithms
│   └── email-templates.ts # HTML email generation
└── types/                 # TypeScript interfaces
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **SQLite** (better-sqlite3) - Database (MVP)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **HMAC-SHA256** - Token signing

### Key Libraries
- **zod** - Runtime type validation
- **jsonwebtoken** - JWT handling
- **lucide-react** - Icons

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
HMAC_SECRET=your-hmac-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Bot Detection Thresholds
Configure in `src/lib/constants.ts`:
- User Agent patterns: 20 points
- Fast response (< 30s): 15 points  
- Datacenter IP: 25 points
- HEAD request detected: 30 points
- Sequential patterns: 20 points
- **Bot threshold: 50+ points**

## 📊 Database Schema

### Core Tables
- `users` - User accounts and subscription tiers
- `surveys` - Survey definitions and settings
- `survey_options` - Response options with emojis/colors
- `responses` - Individual survey responses
- `bot_scores` - Anti-bot detection results

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Surveys
- `GET /api/surveys` - List user's surveys
- `POST /api/surveys` - Create new survey
- `GET /api/surveys/[id]/analytics` - Survey analytics
- `GET /api/surveys/[id]/template` - Generate email template

### Response Collection
- `GET /r?tok=[signed-token]` - Record survey response

## 📈 Analytics Features

### Metrics
- Total responses (human vs bot)
- Response rate percentages
- Real-time response tracking
- Response distribution by option

### Visualizations
- Bar charts for option popularity
- Pie charts for response distribution
- Time-series charts for response trends
- Recent responses feed

## 🧪 Manual Testing

### Email Template Testing
1. Create a survey in the dashboard
2. Click "Preview Email" to see HTML template
3. Copy the response URLs to test in different browsers
4. Verify bot detection works with automated tools

### Response Flow Testing
1. Generate email template with recipient ID
2. Click response buttons to test `/r` endpoint
3. Verify thank you pages show correct feedback
4. Check analytics dashboard updates in real-time

## 🎯 Production Deployment

### Database Migration
- Move from SQLite to PostgreSQL
- Update `DATABASE_URL` environment variable
- Run migrations for production schema

### Security Checklist
- [ ] Change all default secrets in production
- [ ] Set up proper CORS policies  
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS for all endpoints

## 📝 Next Steps

### Phase 2 Features
- [ ] Advanced survey templates
- [ ] CSV/JSON export functionality
- [ ] Webhook integrations
- [ ] Email service provider integrations
- [ ] White-label customization

### Phase 3 Features
- [ ] AMP for Email support
- [ ] Advanced bot detection
- [ ] Multi-question survey chains
- [ ] Team collaboration
- [ ] API rate limiting

## 🤝 Contributing

This is an MVP demo. To extend functionality:

1. Add new survey types in `src/lib/constants.ts`
2. Create new email templates in `src/lib/email-templates.ts`
3. Extend analytics in dashboard components
4. Add new API endpoints following existing patterns

## 📄 License

MIT License - see LICENSE file for details.# Trigger deployment
