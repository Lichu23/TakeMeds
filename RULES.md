# RULES.md - Development Guidelines for Vibecoding PillTime

## 🎯 Project Context
This document contains the rules and best practices for developing PillTime (Medication Reminder PWA) using AI-assisted development (vibecoding) with Claude.

---

## 📋 General Development Rules

### 1. Always Provide Context
When asking Claude for help, include:
- What you're trying to accomplish
- What files are relevant
- What errors you're seeing (full error messages)
- What you've already tried
- Expected vs actual behavior

**Good:** "I'm implementing the medication form component. The time picker isn't updating state correctly. Here's the component code and the error in console: [error]. I've tried using onChange vs onValueChange."

**Bad:** "Time picker doesn't work. Fix it."

### 2. Iterative Development
- Build features incrementally
- Test each piece before moving on
- Request code reviews for complex logic
- Don't ask Claude to build everything at once

### 3. File Organization
- Keep files focused and under 300 lines
- Extract reusable logic into utilities/hooks
- Use clear, descriptive file names
- Follow the project structure in DEVELOPMENT_PLAN.md

### 4. Code Quality Standards
- TypeScript for type safety (frontend)
- Proper error handling (try-catch, error boundaries)
- Input validation on both frontend and backend
- Meaningful variable and function names
- Comments for complex logic only

---

## 🎨 Frontend Development Rules

### React Component Guidelines

#### Component Structure
```typescript
// 1. Imports (grouped: React, libraries, local)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MedicationCard } from './MedicationCard';

// 2. Types/Interfaces
interface MedicationListProps {
  onEdit: (id: number) => void;
}

// 3. Component
export function MedicationList({ onEdit }: MedicationListProps) {
  // 4. Hooks (state first, then effects)
  const [medications, setMedications] = useState([]);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Event handlers
  const handleDelete = (id: number) => {
    // Handler logic
  };
  
  // 6. Return JSX
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

#### State Management Rules
- Use `useState` for local component state
- Use custom hooks for shared logic
- Lift state up when needed by multiple components
- Avoid prop drilling (max 2 levels deep)

#### API Calls
- Always wrap in try-catch
- Show loading states
- Handle errors gracefully with user-friendly messages
- Use Axios interceptors for auth/error handling
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  setError(null);
  const response = await api.get('/medications');
  setMedications(response.data.medications);
} catch (err) {
  setError('Failed to load medications. Please try again.');
  console.error(err);
} finally {
  setLoading(false);
}
```

#### Styling Rules
- Use TailwindCSS utility classes
- Mobile-first responsive design
- Consistent spacing (use Tailwind's spacing scale)
- Dark mode support from the start
- Accessible color contrast ratios

### Custom Hooks Guidelines

When to create a custom hook:
- Logic used in multiple components
- Complex stateful logic
- Side effects that should be reusable

Example structure:
```typescript
export function useMedications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMedications = async () => {
    // Fetch logic
  };
  
  const addMedication = async (data: MedicationInput) => {
    // Add logic
  };
  
  useEffect(() => {
    fetchMedications();
  }, []);
  
  return {
    medications,
    loading,
    error,
    addMedication,
    refetch: fetchMedications
  };
}
```

---

## 🔧 Backend Development Rules

### API Endpoint Structure

#### Standard Response Format
```javascript
// Success
{
  success: true,
  data: { ... },
  message: "Optional success message"
}

// Error
{
  success: false,
  error: "Error message",
  details: "Optional detailed error info"
}
```

#### Route Organization
```javascript
// routes/medications.js
const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');

router.get('/', medicationController.getAll);
router.post('/', medicationController.create);
router.get('/:id', medicationController.getById);
router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.delete);

module.exports = router;
```

#### Controller Pattern
```javascript
// controllers/medicationController.js
const medicationService = require('../services/medicationService');

exports.create = async (req, res) => {
  try {
    // 1. Validate input
    const { error, value } = validateMedication(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // 2. Business logic
    const medication = await medicationService.create(value);
    
    // 3. Return response
    res.status(201).json({
      success: true,
      data: { medication }
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create medication'
    });
  }
};
```

### Database Rules

#### Query Guidelines
- Use prepared statements (prevents SQL injection)
- Add indexes for frequently queried columns
- Use transactions for multi-step operations
- Close database connections properly

```javascript
// Good
const medication = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);

// Bad (SQL injection risk)
const medication = db.prepare(`SELECT * FROM medications WHERE id = ${id}`).get();
```

#### Migration Pattern
When changing schema:
```javascript
// migrations/001_add_reminder_column.js
module.exports = {
  up: (db) => {
    db.exec('ALTER TABLE medications ADD COLUMN reminder_advance_minutes INTEGER DEFAULT 0');
  },
  down: (db) => {
    db.exec('ALTER TABLE medications DROP COLUMN reminder_advance_minutes');
  }
};
```

### Error Handling

#### Centralized Error Handler
```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  // Operational errors (safe to show to user)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // Programming errors (don't leak details)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

---

## 🔔 Push Notifications Rules

### VAPID Key Management
- **NEVER** commit VAPID keys to Git
- Store in environment variables
- Generate once, reuse across deployments
- Keep private key absolutely secret

### Notification Best Practices

#### Notification Content
```javascript
{
  title: "Time for Aspirin",           // Clear, specific
  body: "500mg - 1 pill",              // Dosage info
  icon: "/icons/icon-192x192.png",     // App icon
  badge: "/icons/badge-72x72.png",     // Monochrome badge
  tag: "medication-123",               // Unique per medication
  requireInteraction: false,           // Don't force interaction
  actions: [
    { action: "taken", title: "✓ Taken", icon: "/icons/check.png" },
    { action: "snooze", title: "Snooze 10m", icon: "/icons/snooze.png" }
  ],
  data: {
    medicationId: 123,
    logId: 456,
    timestamp: new Date().toISOString()
  }
}
```

#### Scheduling Logic
- Check every minute for due medications
- Don't send duplicate notifications
- Handle timezone differences correctly
- Respect "Do Not Disturb" hours
- Batch notifications if multiple meds at same time

#### Error Handling
```javascript
// Handle expired subscriptions
try {
  await webpush.sendNotification(subscription, payload);
} catch (error) {
  if (error.statusCode === 410) {
    // Subscription expired, remove from database
    await removeSubscription(subscription.endpoint);
  } else {
    console.error('Push notification error:', error);
  }
}
```

---

## 🌐 PWA Requirements

### Service Worker Rules

#### Caching Strategy
```javascript
// Cache static assets (cache-first)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// API calls (network-first, fallback to cache)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
);
```

#### Update Handling
```javascript
// Prompt user when new version available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// In React component
const updateServiceWorker = () => {
  const registrationWaiting = registration?.waiting;
  if (registrationWaiting) {
    registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
  }
};
```

### Manifest Requirements
- Include all required fields
- Provide multiple icon sizes
- Set appropriate `display` mode
- Define `theme_color` and `background_color`
- Use correct `start_url`

---

## 🧪 Testing Rules

### What to Test

#### Critical Paths
- Medication CRUD operations
- Marking medication as taken
- Notification delivery
- Service Worker registration
- Offline functionality

#### Test Structure
```javascript
describe('Medication Service', () => {
  beforeEach(() => {
    // Setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should create a medication with valid data', async () => {
    const medication = await createMedication({
      name: 'Aspirin',
      dosage: '500mg',
      times: ['09:00']
    });
    
    expect(medication).toBeDefined();
    expect(medication.name).toBe('Aspirin');
  });
  
  it('should reject invalid medication data', async () => {
    await expect(createMedication({ name: '' }))
      .rejects.toThrow('Name is required');
  });
});
```

### Manual Testing Checklist
Before each commit:
- [ ] Test in Chrome DevTools mobile view
- [ ] Check console for errors
- [ ] Verify notifications work
- [ ] Test offline mode
- [ ] Check responsive layout
- [ ] Validate form inputs

---

## 🚀 Deployment Rules

### Pre-Deployment Checklist

#### Frontend
- [ ] Run production build (`npm run build`)
- [ ] Test built files locally
- [ ] Check Lighthouse scores (all > 90)
- [ ] Verify manifest.json is correct
- [ ] Test Service Worker in production mode
- [ ] Check all environment variables are set
- [ ] Remove console.logs (except critical errors)

#### Backend
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Error handling in place
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if needed)
- [ ] Logging configured

### Environment Variables
Never hardcode:
- API URLs
- VAPID keys
- Database paths
- Secret keys

Always use:
```javascript
// Frontend
const API_URL = import.meta.env.VITE_API_URL;

// Backend
const PORT = process.env.PORT || 3000;
```

---

## 🐛 Debugging Rules

### When Something Breaks

1. **Read the error message completely**
   - Don't just skim it
   - Note the file and line number
   - Look for the root cause (often at the bottom)

2. **Check the browser console**
   - Look for JavaScript errors
   - Check network tab for failed requests
   - Inspect Service Worker status

3. **Verify the data flow**
   - Frontend sending correct data?
   - Backend receiving it correctly?
   - Database storing it properly?
   - Response sent back correctly?

4. **Use appropriate debugging tools**
   ```javascript
   // Frontend
   console.log('State:', medications);
   console.table(medications); // Better for arrays
   
   // Backend
   console.log('Request body:', req.body);
   console.log('Database result:', result);
   ```

5. **Isolate the problem**
   - Comment out code to find the issue
   - Test components in isolation
   - Use minimal reproducible example

### Common Issues & Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Notifications not working | Permission denied / HTTPS required | Check permission, use HTTPS or localhost |
| Service Worker not updating | Aggressive caching | Clear cache, use "Update on reload" in DevTools |
| API calls failing | CORS misconfigured | Check CORS settings in backend |
| Database errors | Wrong SQL syntax / constraints | Check schema, use prepared statements |
| State not updating | Missing dependency in useEffect | Add to dependency array |

---

## 💬 Asking Claude for Help

### Effective Prompts

#### ✅ Good Examples

**"I'm implementing the notification service. I need help with the cron job that checks for due medications every minute. Here's my current code [paste code]. The issue is that it's sending duplicate notifications. How can I prevent this?"**

**"The DailyTracker component needs to display today's medications sorted by time. I have the data from the API [show example data], but I need help with the sorting logic and rendering. Should I use useMemo for performance?"**

**"I'm getting this error when trying to register the Service Worker: [paste full error]. I've verified the file is at /public/service-worker.js. What could be wrong?"**

#### ❌ Bad Examples

**"Make the notification thing work"** - Too vague

**"Write all the code for the medication form"** - Too broad, ask for specific parts

**"Fix this"** - No context, no code provided

### Request Code in Chunks

Instead of:
> "Build the entire medication tracking system"

Break it down:
1. "Help me create the database schema for medication logs"
2. "Now create the API endpoint to log a medication as taken"
3. "Create the React component with the UI for marking as taken"
4. "Add error handling and loading states"

### Ask for Explanations

When Claude provides code:
- Ask "Why did you structure it this way?"
- Request alternatives: "Are there other approaches?"
- Understand tradeoffs: "What are the pros/cons?"

---

## 📚 Code Review Checklist

Before considering a feature "done":

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states shown

### Code Quality
- [ ] No console.log statements (except errors)
- [ ] No commented-out code
- [ ] Variables have descriptive names
- [ ] Complex logic has comments
- [ ] No magic numbers (use constants)

### Performance
- [ ] No unnecessary re-renders
- [ ] API calls optimized
- [ ] Database queries indexed
- [ ] Images optimized

### Security
- [ ] User input validated
- [ ] SQL injection prevented (prepared statements)
- [ ] XSS prevented (React handles this)
- [ ] Sensitive data not exposed

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

### Mobile
- [ ] Touch targets >= 44x44px
- [ ] Responsive on small screens
- [ ] No horizontal scrolling
- [ ] Text readable without zoom

---

## 🔄 Git Workflow

### Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code restructure
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(frontend): add medication form component
fix(backend): prevent duplicate notification sending
docs(readme): add setup instructions
refactor(hooks): extract medication logic to custom hook
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Active development
- `feature/medication-form` - Feature branches
- `fix/notification-duplicate` - Bug fix branches

### Before Committing
```bash
# Run linter
npm run lint

# Run tests
npm test

# Build to check for errors
npm run build
```

---

## 🎯 Success Criteria

A feature is "done" when:

1. **It works** - Core functionality complete
2. **It's tested** - Manual testing passed, critical paths have tests
3. **It's documented** - Code comments, README updated if needed
4. **It's accessible** - Keyboard and screen reader friendly
5. **It's responsive** - Works on mobile and desktop
6. **It's performant** - No obvious performance issues
7. **It's clean** - Code is readable and maintainable

---

## 🚨 Red Flags - Stop and Ask for Help

Stop coding and ask Claude for guidance if you encounter:

- Making the same mistake repeatedly
- Spending > 30 minutes on a single bug
- Need to significantly change the architecture
- Unsure about security implications
- Database migrations feel risky
- Performance degrading significantly
- Need to implement complex algorithm
- Dealing with sensitive user data

---

## 📖 Reference Quick Links

### When You Need To...

**Add a new medication field:**
1. Update database schema (add column)
2. Update API validation
3. Update React form
4. Update TypeScript types

**Add a new API endpoint:**
1. Create route in routes/
2. Create controller function
3. Implement business logic in service
4. Add error handling
5. Test with Postman

**Fix a notification issue:**
1. Check VAPID keys are correct
2. Verify subscription exists in database
3. Check cron job is running
4. Look at browser console for errors
5. Test with `/api/push/test` endpoint

**Debug offline issues:**
1. Check Service Worker is registered
2. Inspect cache in DevTools
3. Verify network strategy is correct
4. Check for CORS issues
5. Test in incognito mode

---

## 🎓 Learning Resources

As you develop:
- Read error messages carefully
- Use browser DevTools effectively
- Check MDN for web APIs
- Review library documentation
- Ask Claude to explain concepts

**Remember:** 
- It's okay to ask "why" 
- There's no shame in not knowing
- Debugging is part of development
- Every error is a learning opportunity

---

## 📝 Notes Section

Use this space to track project-specific decisions and patterns:

```
DATE: 2026-01-13
DECISION: Using date-fns instead of moment.js (smaller bundle)
REASON: Moment.js is deprecated, date-fns is tree-shakeable

DATE: 2026-01-13
PATTERN: All API calls go through src/services/api.js
REASON: Centralized error handling and base URL configuration
```

---

## ✅ Ready to Code?

You're ready when you:
- [ ] Have reviewed CLAUDE.md (project context)
- [ ] Have reviewed DEVELOPMENT_PLAN.md (what to build)
- [ ] Understand these rules
- [ ] Have development environment set up
- [ ] Know how to ask Claude for help
- [ ] Understand the project architecture

**Happy coding! Remember: Build incrementally, test frequently, ask questions early.**

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-13  
**For Questions:** Ask Claude with context and specific details
