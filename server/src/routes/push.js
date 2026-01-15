import express from 'express';
import webpush from 'web-push';
import db from '../db/database.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@pilltime.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️  VAPID keys not configured. Push notifications will not work.');
  console.warn('   Run: npx web-push generate-vapid-keys');
}

// GET VAPID public key
router.get('/vapid-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({
      success: false,
      message: 'VAPID keys not configured'
    });
  }

  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// POST subscribe to push notifications
router.post('/subscribe', (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription object'
      });
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (endpoint, keys, user_agent)
      VALUES (?, ?, ?)
    `);

    stmt.run(
      endpoint,
      JSON.stringify(keys),
      req.headers['user-agent'] || null
    );

    res.json({
      success: true,
      message: 'Subscription saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save subscription',
      error: error.message
    });
  }
});

// POST unsubscribe from push notifications
router.post('/unsubscribe', (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required'
      });
    }

    db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error.message
    });
  }
});

// POST send test notification
router.post('/test', async (req, res) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY) {
      return res.status(500).json({
        success: false,
        message: 'VAPID keys not configured'
      });
    }

    const subscriptions = db.prepare('SELECT * FROM push_subscriptions').all();

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscriptions found'
      });
    }

    const payload = JSON.stringify({
      title: 'PillTime Test Notification',
      body: 'This is a test notification from PillTime!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      timestamp: Date.now()
    });

    const results = [];
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: JSON.parse(sub.keys)
        };

        await webpush.sendNotification(pushSubscription, payload);
        results.push({ endpoint: sub.endpoint, success: true });
      } catch (error) {
        results.push({ endpoint: sub.endpoint, success: false, error: error.message });

        // Remove invalid subscriptions (410 Gone or 404 Not Found)
        if (error.statusCode === 410 || error.statusCode === 404) {
          db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
        }
      }
    }

    res.json({
      success: true,
      message: 'Test notifications sent',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

export default router;
