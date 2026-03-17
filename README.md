# Blooming - Telegram Mini App Workout Tracker

A Telegram mini app for tracking, planning, and analyzing strength & cardio workouts with AI-powered recommendations.

## Features

- **Workout Logging**: Track strength training (sets/reps/weight) and cardio (duration/distance/RPE)
- **AI Workout Planner**: Daily workout recommendations based on your goals and progress
- **Analytics Dashboard**: Progress charts, streaks, weekly summaries, personal records
- **Telegram Integration**: Seamless login via Telegram WebApp
- **Data Export**: Export workouts to CSV/PDF formats
- **Light Theme UI**: Clean, engaging design

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend/Database: Supabase (PostgreSQL)
- Authentication: Telegram WebApp Auth
- Styling: CSS with light theme
- AI Integration: Custom workout planning logic

## Project Structure

```
Blooming/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Main app pages
│   ├── services/        # API and database services
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── supabase/            # Database schema and migrations
└── public/              # Static assets
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Telegram Bot token (from @BotFather)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Initialize Supabase database (run migrations in `supabase/`)
5. Start development server: `npm run dev`

## Environment Variables

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Tasks

- [ ] Scaffold Telegram Mini App project structure
- [ ] Set up Supabase database schema for workouts, plans, and user data
- [ ] Implement Telegram authentication integration
- [ ] Build workout logging interface (strength & cardio)
- [ ] Create AI-powered workout planner with daily recommendations
- [ ] Implement analytics dashboard (progress, streaks, PRs)
- [ ] Add data export functionality (CSV/PDF)
- [ ] Style with light theme and engaging UI

## API Endpoints

### Workouts
- `POST /api/workouts` - Log a new workout
- `GET /api/workouts` - Get user's workout history
- `GET /api/workouts/:id` - Get specific workout details

### Plans
- `GET /api/plans/today` - Get today's AI-recommended workout
- `POST /api/plans/generate` - Generate new workout plan

### Analytics
- `GET /api/analytics/streaks` - Get streak data
- `GET /api/analytics/progress` - Get progress charts
- `GET /api/analytics/prs` - Get personal records

## Future Enhancements

- Multi-user support with accounts
- Custom workout templates
- Social features (share progress, challenges)
- Push notifications for scheduled workouts
- Equipment-based exercise suggestions
