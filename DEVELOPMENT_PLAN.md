# PillTime - Development Plan

## Project Overview
**App Name:** PillTime  
**Type:** Progressive Web Application (PWA)  
**Purpose:** Medication reminder and tracking system  
**Timeline:** 2 weeks (MVP)

---

## Tech Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (faster than Create React App)
- **Styling:** TailwindCSS or Material-UI
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Date Management:** date-fns or Day.js
- **PWA Tools:** Workbox for Service Worker management

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** SQLite3 with better-sqlite3 (synchronous, faster)
- **Task Scheduling:** node-cron
- **Push Notifications:** web-push (VAPID keys)
- **Authentication:** JWT (optional for multi-user)
- **Environment:** dotenv

---

## Database Schema (SQLite)

### medications
```sql
CREATE TABLE medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dosage TEXT,                    -- e.g., "500mg", "2 pills"
    frequency TEXT NOT NULL,         -- 'daily', 'twice-daily', 'custom'
    times TEXT NOT NULL,             -- JSON array: ["09:00", "21:00"]
    start_date DATE NOT NULL,
    end_date DATE,                   -- NULL for ongoing
    active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### medication_logs
```sql
CREATE TABLE medication_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,  -- When it should be taken
    taken_time TIMESTAMP,                -- When it was actually taken
    status TEXT NOT NULL,                -- 'taken', 'missed', 'pending', 'skipped'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_logs_scheduled_time ON medication_logs(scheduled_time);
CREATE INDEX idx_logs_status ON medication_logs(status);
```

### push_subscriptions
```sql
CREATE TABLE push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE NOT NULL,
    keys TEXT NOT NULL,              -- JSON: {p256dh, auth}
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### settings
```sql
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value) VALUES 
    ('notifications_enabled', 'true'),
    ('reminder_advance_minutes', '0'),
    ('theme', 'light'),
    ('timezone', 'UTC');
```

---

## API Endpoints

### Medications API
```
POST   /api/medications
Body: {
    name: string,
    dosage: string,
    frequency: string,
    times: string[],  // ["09:00", "21:00"]
    start_date: string,
    end_date?: string,
    notes?: string
}
Response: { success: true, medication: {...} }

GET    /api/medications
Response: { medications: [...] }

GET    /api/medications/:id
Response: { medication: {...} }

PUT    /api/medications/:id
Body: { ...updated fields }
Response: { success: true, medication: {...} }

DELETE /api/medications/:id
Response: { success: true, message: "Medication deleted" }
```

### Logs API
```
POST   /api/logs
Body: {
    medication_id: number,
    taken_time?: string,  // Default: now
    status: 'taken' | 'skipped',
    notes?: string
}
Response: { success: true, log: {...} }

GET    /api/logs?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
Response: { logs: [...] }

GET    /api/logs/today
Response: { logs: [...], stats: { total, taken, missed, pending } }

GET    /api/logs/history?days=30
Response: { 
    logs: [...],
    stats: {
        totalDays: number,
        compliance_rate: number,
        streak: number,
        byMedication: {...}
    }
}

PUT    /api/logs/:id
Body: { status: string, notes?: string }
Response: { success: true, log: {...} }

DELETE /api/logs/:id
Response: { success: true }
```

### Push Notifications API
```
POST   /api/push/subscribe
Body: {
    endpoint: string,
    keys: {
        p256dh: string,
        auth: string
    }
}
Response: { success: true }

POST   /api/push/unsubscribe
Body: { endpoint: string }
Response: { success: true }

POST   /api/push/test
Response: { success: true, message: "Test notification sent" }

GET    /api/push/vapid-key
Response: { publicKey: string }
```

### Settings API
```
GET    /api/settings
Response: { settings: {...} }

PUT    /api/settings
Body: { key: string, value: string }
Response: { success: true, settings: {...} }
```

---

## Development Phases

### Phase 1: Project Setup ✅ COMPLETED

#### Backend Setup ✅
- [x] Initialize Node.js project
- [x] Create SQLite database and schema
- [x] Set up Express server with middleware
- [x] Configure CORS for frontend communication
- [x] Generate VAPID keys for push notifications
- [x] Create basic API structure with error handling
- [x] Implement all medication CRUD endpoints
- [x] Implement logs endpoints
- [x] Implement push notification endpoints
- [x] Implement settings endpoints

#### Frontend Setup ✅
- [x] Initialize React + Vite + TypeScript
- [x] Configure TailwindCSS v4 with @tailwindcss/postcss
- [x] Set up React Router
- [x] Create basic layout components
- [x] Configure Axios instance for API calls
- [x] Set up environment variables
- [x] Create TypeScript types
- [x] Create folder structure (components, services, hooks, utils, types)

**Completed:** 2026-01-13

---

### Phase 2: Medication Management ✅ COMPLETED

#### Backend ✅
- [x] Implement medication CRUD endpoints
- [x] Add validation middleware
- [x] Create medication controller
- [x] Test endpoints with Postman/Thunder Client

#### Frontend ✅
- [x] Create MedicationForm component
  - Input fields: name, dosage, frequency
  - Time picker for reminder times
  - Date pickers for start/end dates
  - Form validation
- [x] Create MedicationList component
  - Display all medications
  - Edit/delete actions
  - Active/inactive toggle
- [x] Implement medication state management
  - Custom hook: `useMedications`
  - API integration
- [x] Create MedicationCard component for display
- [x] Create MedicationsPage with full CRUD functionality

**Completed:** 2026-01-13

**Key Features:**
- Multiple reminder times per medication
- Recurring schedules (daily, twice-daily, custom)
- Medication activation/deactivation

---

### Phase 3: Daily Tracking System ✅ COMPLETED

#### Backend ✅
- [x] Implement log generation system
  - Cron job to generate daily logs at midnight
  - Auto-create pending logs for active medications
  - Mark missed logs every hour
- [x] Create log endpoints
- [x] Implement status updates (pending → taken/missed)
- [x] Calculate compliance statistics

#### Frontend ✅
- [x] Create DailyTracker component
  - Today's medication schedule
  - "Mark as Taken" button with timestamp
  - Visual indicators (pending/taken/missed)
  - Quick actions (skip)
- [x] Create useLogs custom hook for state management
- [x] Create Dashboard page with today's medications
- [x] Create History page
  - Date-grouped list view
  - Time period filters (7/30/90 days)
  - Statistics dashboard
- [x] Implement statistics
  - Compliance rate
  - Current streak
  - Total taken
  - Progress tracking

**Completed:** 2026-01-13

**Key Features:**
- Real-time status updates
- Late dose tracking (taken after scheduled time)
- Notes for each log entry
- Visual streak counter

---

### Phase 4: PWA Configuration ✅ COMPLETED

#### PWA Basics ✅
- [x] Create manifest.json
  ```json
  {
    "name": "PillTime - Medication Reminder",
    "short_name": "PillTime",
    "description": "Track and remember your daily medications",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4F46E5",
    "icons": [
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```
- [x] Generate app icons (Icon generator tool created)
- [x] Configure Vite for PWA
- [x] Create Service Worker
- [x] Link manifest in HTML
- [x] Add PWA meta tags

#### Installation ✅
- [x] Add "Install App" prompt component
- [x] Detect if app is already installed
- [x] Handle beforeinstallprompt event
- [x] Custom install UI with dismiss functionality
- [x] Service Worker registration in production

#### Service Worker Features (Basic)
- [x] Basic service worker setup
- [x] Network-first strategy
- [x] Push notification event handlers (prepared for Phase 5)
- [ ] Full offline caching (deferred to Phase 6)
- [ ] Background sync (deferred to Phase 6)

**Completed:** 2026-01-13
**Note:** Full offline functionality deferred to Phase 6

**Key Features:**
- Fully functional offline (view data, mark as taken)
- Sync when back online
- Install banner
- Standalone app experience

---

### Phase 5: Push Notifications 🚧 IN PROGRESS

#### Backend Notification Service
- [x] Set up VAPID keys
- [ ] Create notification service
  ```javascript
  // Pseudo-code structure
  class NotificationService {
    async sendNotification(subscription, payload) {}
    async sendToAll(payload) {}
    async scheduleNotification(medicationId, time) {}
  }
  ```
- [ ] Implement cron job for scheduled notifications
  ```javascript
  // Check every minute for due medications
  cron.schedule('* * * * *', async () => {
    const dueMedications = await getDueMedications();
    for (const med of dueMedications) {
      await sendNotification(med);
    }
  });
  ```
- [ ] Handle notification errors and retry logic
- [ ] Clean up expired subscriptions

#### Frontend Notification Features
- [ ] Request notification permission
  - Onboarding flow
  - Permission UI
  - Handle denial gracefully
- [ ] Subscribe to push service
  ```javascript
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });
  ```
- [ ] Send subscription to backend
- [ ] Handle notification click events
  - Open app to specific medication
  - Mark as taken from notification
- [ ] Create notification settings
  - Enable/disable per medication
  - Advance reminder (5, 10, 15 minutes before)
  - Quiet hours

#### Service Worker Notification Handling
- [ ] Listen for push events
- [ ] Display notification with actions
  ```javascript
  self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      actions: [
        { action: 'taken', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze 10 min' }
      ]
    });
  });
  ```
- [ ] Handle notification actions

**Key Features:**
- Scheduled push notifications
- Rich notifications with actions
- Notification history
- Smart scheduling (avoid night time)
- Missed dose alerts

---

### Phase 6: Polish & Testing (Day 11-12)

#### UI/UX Improvements
- [ ] Responsive design for all screen sizes
- [ ] Dark mode support
- [ ] Loading states and skeletons
- [ ] Empty states
- [ ] Success/error toast notifications
- [ ] Smooth transitions and animations
- [ ] Accessibility improvements
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus management

#### Settings Page
- [ ] Notification preferences
- [ ] Theme selection (light/dark/auto)
- [ ] Data export/import
- [ ] Clear all data option
- [ ] App information and version

#### Testing
- [ ] Unit tests for critical functions
- [ ] API endpoint testing
- [ ] PWA Lighthouse audit
  - Performance
  - Accessibility
  - Best Practices
  - SEO
  - PWA score
- [ ] Cross-browser testing
  - Chrome/Edge
  - Firefox
  - Safari (iOS)
- [ ] Device testing
  - Android phones
  - iPhones
  - Tablets

#### Documentation
- [ ] README with setup instructions
- [ ] API documentation
- [ ] User guide
- [ ] Deployment guide

---

## Key Implementation Details

### 1. Notification Scheduling Logic

```javascript
// Backend: schedulerService.js
const scheduleDailyNotifications = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Get medications scheduled for this minute
    const dueMedications = await db.prepare(`
      SELECT m.*, l.id as log_id
      FROM medications m
      JOIN medication_logs l ON m.id = l.medication_id
      WHERE m.active = 1
      AND l.status = 'pending'
      AND date(l.scheduled_time) = date('now')
      AND time(l.scheduled_time) = ?
    `).all(currentTime);
    
    // Send notifications
    for (const med of dueMedications) {
      await notificationService.send({
        title: `Time for ${med.name}`,
        body: `${med.dosage || 'Take your medication'}`,
        data: {
          medicationId: med.id,
          logId: med.log_id
        }
      });
    }
  });
};
```

### 2. Daily Log Generation

```javascript
// Backend: Run at midnight to generate next day's logs
cron.schedule('0 0 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
  const activeMedications = await db.prepare(`
    SELECT * FROM medications 
    WHERE active = 1 
    AND (end_date IS NULL OR end_date >= date('now'))
  `).all();
  
  for (const med of activeMedications) {
    const times = JSON.parse(med.times);
    
    for (const time of times) {
      await db.prepare(`
        INSERT INTO medication_logs (medication_id, scheduled_time, status)
        VALUES (?, ?, 'pending')
      `).run(med.id, `${tomorrowDate} ${time}:00`);
    }
  }
});
```

### 3. Service Worker Registration (Frontend)

```javascript
// src/services/serviceWorkerRegistration.js
export async function register() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js'
      );
      
      console.log('Service Worker registered:', registration);
      
      // Subscribe to push notifications
      await subscribeToPush(registration);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

async function subscribeToPush(registration) {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      )
    });
    
    // Send subscription to backend
    await axios.post('/api/push/subscribe', subscription);
  }
}
```

### 4. Offline Data Sync

```javascript
// Service Worker: Handle offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medication-logs') {
    event.waitUntil(syncPendingLogs());
  }
});

async function syncPendingLogs() {
  const cache = await caches.open('pending-logs');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

---

## Environment Setup

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite

# VAPID Keys (generate with web-push library)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

---

## Deployment Guide

### Frontend (Static Hosting)
**Recommended:** Vercel, Netlify, or Cloudflare Pages

```bash
# Build
npm run build

# Deploy
# Upload 'dist' folder to hosting service
```

**Requirements:**
- Must be served over HTTPS
- Configure redirects for SPA routing

### Backend (Node.js Server)
**Options:** Railway, Render, DigitalOcean, AWS EC2

```bash
# Install dependencies
npm install --production

# Start server
npm start
```

**Requirements:**
- Node.js 18+
- Persistent storage for SQLite
- Environment variables configured
- Process manager (PM2) for production

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

---

## Testing Checklist

### Functional Testing
- [ ] Can add medication with multiple times
- [ ] Can edit medication details
- [ ] Can delete medication
- [ ] Daily logs are auto-generated
- [ ] Can mark medication as taken
- [ ] Notifications arrive on time
- [ ] Notification actions work
- [ ] History shows correct data
- [ ] Statistics calculate correctly
- [ ] App works offline
- [ ] Data syncs when back online

### PWA Testing
- [ ] Manifest loads correctly
- [ ] Icons display properly
- [ ] App can be installed
- [ ] Works in standalone mode
- [ ] Service Worker caches assets
- [ ] Offline page displays
- [ ] Updates prompt when new version available

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] Database queries optimized

### Browser Compatibility
- [ ] Chrome/Edge (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Samsung Internet (Android)

---

## Future Enhancements (Post-MVP)

### Phase 7+
- [ ] Multi-user support with authentication
- [ ] Cloud sync across devices
- [ ] Medication interaction warnings
- [ ] Refill reminders
- [ ] Doctor appointment tracking
- [ ] Health metrics integration
- [ ] Family/caregiver sharing
- [ ] Photo of medication packaging
- [ ] Barcode scanner for medication info
- [ ] Integration with pharmacy APIs
- [ ] Smart watch notifications
- [ ] Voice commands
- [ ] Medication inventory tracking
- [ ] AI-powered insights

---

## Resources & References

### Documentation
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/docs.html)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [PWA Patterns](https://web.dev/progressive-web-apps/)

### Libraries
- [date-fns](https://date-fns.org/)
- [web-push](https://github.com/web-push-libs/web-push)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Workbox](https://developers.google.com/web/tools/workbox)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [web-push-testing](https://github.com/web-push-libs/web-push-testing)

---

## Project Timeline Summary

| Week | Phase | Focus |
|------|-------|-------|
| Week 1, Days 1-2 | Setup | Infrastructure and project initialization |
| Week 1, Days 3-4 | Core Features | Medication CRUD operations |
| Week 1, Days 5-6 | Tracking | Daily logging and history |
| Week 2, Days 7-8 | PWA | Offline support and installability |
| Week 2, Days 9-10 | Notifications | Push notification system |
| Week 2, Days 11-12 | Polish | UI improvements and testing |

**Total Development Time:** ~2 weeks for full-featured MVP

---

## Success Metrics

- [ ] App installable on mobile devices
- [ ] Notifications delivered within 1 minute of scheduled time
- [ ] 95%+ uptime for notification service
- [ ] App loads in < 3 seconds
- [ ] Works offline for core features
- [ ] Lighthouse PWA score > 90
- [ ] Zero critical bugs
- [ ] Positive user feedback on usability

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-13  
**Status:** Planning Complete - Ready for Development
