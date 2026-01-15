import webpush from 'web-push';
import db from '../db/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@pilltime.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send push notification to a specific subscription
 */
export async function sendNotification(subscription, payload) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: JSON.parse(subscription.keys),
    };

    const payloadString = JSON.stringify(payload);
    await webpush.sendNotification(pushSubscription, payloadString);

    console.log(`✅ Notification sent to ${subscription.endpoint.substring(0, 50)}...`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);

    // Remove invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('🗑️  Removing invalid subscription');
      db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(subscription.endpoint);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send notification to all subscribed users
 */
export async function sendToAll(payload) {
  const subscriptions = db.prepare('SELECT * FROM push_subscriptions').all();

  if (subscriptions.length === 0) {
    console.log('⚠️  No subscriptions found');
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const result = await sendNotification(sub, payload);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`📊 Notifications sent: ${sent} succeeded, ${failed} failed`);
  return { sent, failed };
}

/**
 * Send notification for a specific medication
 */
export async function sendMedicationReminder(medication, log) {
  const payload = {
    title: `💊 Time for ${medication.name}`,
    body: medication.dosage
      ? `Take ${medication.dosage}`
      : 'Time to take your medication',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: `med-${log.id}`,
    data: {
      medicationId: medication.id,
      logId: log.id,
      url: '/',
    },
    actions: [
      { action: 'taken', title: '✓ Mark as Taken' },
      { action: 'snooze', title: '⏰ Snooze 10 min' },
    ],
    requireInteraction: true,
    timestamp: Date.now(),
  };

  return await sendToAll(payload);
}

/**
 * Check for due medications and send notifications
 */
export async function checkAndNotifyDueMedications() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  // Get pending logs for current time
  const dueLogs = db
    .prepare(
      `
    SELECT
      l.id as log_id,
      l.medication_id,
      l.scheduled_time,
      m.name,
      m.dosage,
      m.active
    FROM medication_logs l
    JOIN medications m ON l.medication_id = m.id
    WHERE l.status = 'pending'
      AND m.active = 1
      AND date(l.scheduled_time) = date('now')
      AND time(l.scheduled_time) = ?
  `
    )
    .all(currentTime + ':00');

  if (dueLogs.length === 0) {
    return { sent: 0 };
  }

  console.log(`🔔 Found ${dueLogs.length} due medications for ${currentTime}`);

  let totalSent = 0;

  for (const log of dueLogs) {
    const medication = {
      id: log.medication_id,
      name: log.name,
      dosage: log.dosage,
    };

    const logData = {
      id: log.log_id,
      scheduled_time: log.scheduled_time,
    };

    const result = await sendMedicationReminder(medication, logData);
    totalSent += result.sent;
  }

  return { sent: totalSent, count: dueLogs.length };
}

/**
 * Clean up expired or invalid subscriptions
 */
export function cleanupSubscriptions() {
  // Remove subscriptions older than 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = db
    .prepare('DELETE FROM push_subscriptions WHERE created_at < ?')
    .run(ninetyDaysAgo.toISOString());

  if (result.changes > 0) {
    console.log(`🗑️  Cleaned up ${result.changes} old subscriptions`);
  }

  return result.changes;
}
