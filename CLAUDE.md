# CLAUDE.md - Project Context for AI-Assisted Development

## Project Overview
**Project Name:** PillTime (Medication Reminder PWA)  
**Type:** Progressive Web Application  
**Purpose:** Help users track and receive reminders for their daily medications

## Tech Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Date Handling:** date-fns
- **PWA Tools:** Workbox for Service Worker

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** SQLite3 with better-sqlite3
- **Scheduling:** node-cron
- **Push Notifications:** web-push (VAPID)
- **Environment:** dotenv

## Project Architecture

### Frontend Structure
```
client/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service Worker for offline & push
│   └── icons/                 # App icons (192x192, 512x512)
├── src/
│   ├── components/            # React components
│   │   ├── MedicationForm.jsx
│   │   ├── MedicationList.jsx
│   │   ├── DailyTracker.jsx
│   │   ├── History.jsx
│   │   └── Settings.jsx
│   ├── services/              # API and service layer
│   │   ├── api.js
│   │   ├── notifications.js
│   │   └── serviceWorkerRegistration.js
│   ├── hooks/                 # Custom React hooks
│   │   ├── useMedications.js
│   │   └── useNotifications.js
│   ├── utils/
│   │   └── dateHelpers.js
│   ├── App.jsx
│   └── main.jsx
```

### Backend Structure
```
server/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── medicationController.js
│   │   └── logController.js
│   ├── routes/                # API routes
│   │   ├── medications.js
│   │   └── logs.js
│   ├── services/              # Business logic
│   │   ├── notificationService.js
│   │   └── schedulerService.js
│   ├── db/
│   │   ├── database.js        # SQLite connection
│   │   └── schema.sql         # Database schema
│   └── server.js              # Entry point
```

## Database Schema

### Tables
1. **medications** - Store medication details and schedules
2. **medication_logs** - Track when medications were taken
3. **push_subscriptions** - Store push notification endpoints
4. **settings** - Application settings

See DEVELOPMENT_PLAN.md for complete schema.

## Core Features

### Phase 1: Medication Management
- Add/Edit/Delete medications
- Set multiple daily reminder times
- Specify dosage and notes

### Phase 2: Daily Tracking
- View today's scheduled medications
- Mark medications as taken (with timestamp)
- Track missed medications
- View medication history

### Phase 3: PWA Features
- Installable to home screen
- App-like experience

### Phase 4: Push Notifications
- Scheduled reminders at medication times
- Browser push notifications
- Notification permission handling
- Background notification delivery

### Phase 5: Analytics & History
- Medication compliance tracking
- Streak counter
- History calendar view
- Export data

### Phase 6: Analytics & History
- Offline functionality


## API Endpoints

### Medications
- `POST /api/medications` - Create medication
- `GET /api/medications` - Get all medications
- `GET /api/medications/:id` - Get single medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Logs
- `POST /api/logs` - Mark medication as taken
- `GET /api/logs` - Get all logs (filterable)
- `GET /api/logs/today` - Get today's logs
- `GET /api/logs/history` - Get history with statistics

### Push Notifications
- `POST /api/push/subscribe` - Subscribe to notifications
- `POST /api/push/unsubscribe` - Unsubscribe
- `POST /api/push/test` - Test notification

## Key Technical Concepts

### PWA Requirements
- HTTPS (required for Service Workers)
- manifest.json with proper icons
- Service Worker for offline support
- Responsive design

### Push Notification Flow
1. Frontend requests notification permission
2. Service Worker subscribes to push service
3. Subscription sent to backend
4. Backend stores subscription in database
5. Cron job checks for due medications
6. Backend sends push to subscribed clients
7. Service Worker receives and displays notification

### Offline Strategy
- Cache static assets (HTML, CSS, JS)
- Cache API responses with stale-while-revalidate
- Queue failed requests for retry when online
- Store data locally in IndexedDB as fallback

## Development Priorities

1. **User Experience First** - Simple, intuitive interface
2. **Reliability** - Notifications must work consistently
3. **Privacy** - All data stored locally or on user's chosen server
4. **Accessibility** - Keyboard navigation, screen reader support
5. **Performance** - Fast load times, smooth animations

## Code Style Guidelines

### React/TypeScript
- Use functional components with hooks
- TypeScript for type safety
- Descriptive component and variable names
- Extract reusable logic into custom hooks
- Keep components under 200 lines

### Node.js/Express
- Async/await over callbacks
- Proper error handling with try-catch
- Middleware for common functionality
- Separation of concerns (routes/controllers/services)

### General
- ESLint + Prettier for formatting
- Meaningful commit messages
- Comments for complex logic
- Unit tests for critical paths

## Testing Strategy

### Frontend
- Unit tests: React Testing Library
- E2E tests: Playwright or Cypress
- PWA audit: Lighthouse

### Backend
- Unit tests: Jest or Vitest
- API tests: Supertest
- Database tests: In-memory SQLite

## Deployment Considerations

### Frontend
- Build with `npm run build`
- Serve from CDN or static hosting (Vercel, Netlify)
- Requires HTTPS for PWA features

### Backend
- Can run on VPS, cloud platform, or locally
- Requires persistent SQLite file storage
- Environment variables for configuration
- Keep-alive for cron jobs

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_public_key
```

### Backend (.env)
```
PORT=3000
DATABASE_PATH=./database.sqlite
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

## Current Status
- **Phase:** Planning
- **Next Steps:** Set up project structure and initialize repositories

## Important Notes for AI Development

1. **Always validate user input** - Medication times, dosages, dates
2. **Handle timezone correctly** - Store in UTC, display in user's timezone
3. **Notification permission is crucial** - Guide user through permission flow
4. **Service Worker registration** - Must happen on HTTPS or localhost
5. **Database migrations** - Plan for schema changes
6. **Error boundaries** - Catch React errors gracefully
7. **Loading states** - Show feedback for async operations
8. **Accessibility** - ARIA labels, keyboard navigation
9. **Mobile-first design** - Primary use case is on phones
10. **Battery efficiency** - Optimize notification scheduling

## References & Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [React PWA Guide](https://create-react-app.dev/docs/making-a-progressive-web-app/)
- [Web Push Library](https://github.com/web-push-libs/web-push)

## Questions to Ask During Development

- Should we support multiple users or single user?
- Should data sync across devices (requires backend storage)?
- What should happen to missed medications (carry over vs expire)?
- Should we support medication interactions or allergies?
- Do we need authentication if self-hosted?
- Should notifications be dismissible or require action?

---

**Last Updated:** 2026-01-13  
**Developer:** Full Stack Developer (React + Node.js)  
**Development Approach:** Vibrecode with Claude
