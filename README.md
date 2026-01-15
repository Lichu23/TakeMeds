# PillTime - Medication Reminder PWA

A Progressive Web Application for tracking and receiving reminders for daily medications.

## Project Structure

```
TakeMeds/
├── server/              # Backend (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── db/         # Database schema and connection
│   │   ├── routes/     # API routes
│   │   └── server.js   # Main server file
│   ├── .env            # Environment variables
│   └── package.json
│
├── client/             # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API and service layer
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript type definitions
│   │   ├── utils/      # Utility functions
│   │   ├── App.tsx     # Main app component
│   │   └── main.tsx    # Entry point
│   ├── .env            # Environment variables
│   └── package.json
│
├── CLAUDE.md           # AI development context
├── DEVELOPMENT_PLAN.md # Detailed development roadmap
└── README.md           # This file
```

## Tech Stack

### Backend
- Node.js & Express.js
- SQLite3 with better-sqlite3
- node-cron (scheduled tasks)
- web-push (push notifications)
- VAPID keys for web push

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router v6 (routing)
- Axios (HTTP client)
- date-fns (date handling)

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies (already done)
npm install

# Environment variables are already configured in .env
# The database will be created automatically on first run

# Start the server
npm run dev
```

The backend server will start at `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies (already done)
npm install

# Environment variables are already configured in .env

# Start the development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite
VAPID_PUBLIC_KEY=<generated>
VAPID_PRIVATE_KEY=<generated>
VAPID_SUBJECT=mailto:admin@pilltime.app
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=<generated>
```

VAPID keys have already been generated and configured.

## API Endpoints

### Medications
- `GET /api/medications` - Get all medications
- `GET /api/medications/:id` - Get single medication
- `POST /api/medications` - Create new medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Logs
- `GET /api/logs` - Get all logs (with filters)
- `GET /api/logs/today` - Get today's logs
- `GET /api/logs/history` - Get history with stats
- `POST /api/logs` - Create log (mark as taken)
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

### Push Notifications
- `GET /api/push/vapid-key` - Get VAPID public key
- `POST /api/push/subscribe` - Subscribe to notifications
- `POST /api/push/unsubscribe` - Unsubscribe
- `POST /api/push/test` - Send test notification

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update setting

## Development Scripts

### Backend
```bash
npm start       # Start server (production)
npm run dev     # Start server with nodemon (development)
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## Features

### Phase 1: Medication Management ✅
- Add/Edit/Delete medications
- Set multiple daily reminder times
- Specify dosage and notes

### Phase 2: Daily Tracking (Coming Soon)
- View today's scheduled medications
- Mark medications as taken
- Track missed medications
- View medication history

### Phase 3: PWA Features (Coming Soon)
- Installable to home screen
- Offline functionality
- App-like experience

### Phase 4: Push Notifications (Coming Soon)
- Scheduled reminders
- Browser push notifications
- Background delivery

### Phase 5: Analytics & History (Coming Soon)
- Compliance tracking
- Streak counter
- History calendar view
- Export data

## Database Schema

The SQLite database includes the following tables:
- `medications` - Store medication details and schedules
- `medication_logs` - Track when medications were taken
- `push_subscriptions` - Store push notification endpoints
- `settings` - Application settings

See `server/src/db/schema.sql` for the complete schema.

## Testing the Setup

1. Start the backend server:
   ```bash
   cd server && npm run dev
   ```

2. Start the frontend in a new terminal:
   ```bash
   cd client && npm run dev
   ```

3. Open your browser to `http://localhost:5173`

4. You should see the PillTime app with navigation to:
   - Dashboard
   - Medications
   - History
   - Settings

5. Test the API health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

## Next Steps

1. Implement medication CRUD operations in the frontend
2. Add daily tracking functionality
3. Set up PWA manifest and service worker
4. Implement push notification system
5. Add analytics and history views

## Documentation

- `CLAUDE.md` - AI development context and guidelines
- `DEVELOPMENT_PLAN.md` - Complete development roadmap
- `RULES.md` - Project rules and standards

## License

MIT

## Author

Full Stack Developer

---

**Status:** ✅ Setup Complete - Ready for Development

Last Updated: 2026-01-13
