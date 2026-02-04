import cron from 'node-cron';
import db from '../db/database.js';
import { checkAndNotifyDueMedications } from './notificationService.js';

// Generate logs for a specific date
export function generateLogsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];

  console.log(`Generating logs for ${dateStr}...`);

  // Get all active medications
  const activeMedications = db.prepare(`
    SELECT * FROM medications
    WHERE active = 1
    AND start_date <= date(?)
    AND (end_date IS NULL OR end_date >= date(?))
  `).all(dateStr, dateStr);

  let logsCreated = 0;

  for (const med of activeMedications) {
    const times = JSON.parse(med.times);

    for (const time of times) {
      const scheduledTime = `${dateStr} ${time}:00`;

      // Check if log already exists
      const existing = db.prepare(`
        SELECT id FROM medication_logs
        WHERE medication_id = ? AND scheduled_time = ?
      `).get(med.id, scheduledTime);

      if (!existing) {
        db.prepare(`
          INSERT INTO medication_logs (medication_id, scheduled_time, status)
          VALUES (?, ?, 'pending')
        `).run(med.id, scheduledTime);

        logsCreated++;
      }
    }
  }

  console.log(`✓ Created ${logsCreated} logs for ${dateStr}`);
  return logsCreated;
}

// Generate logs for a specific medication (used when creating/updating medications)
export function generateLogsForMedication(medicationId) {
  const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(medicationId);

  if (!med || !med.active) {
    return 0;
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Check if medication is valid for today or tomorrow
  const startDate = med.start_date;
  const endDate = med.end_date;

  let logsCreated = 0;
  const times = JSON.parse(med.times);

  // Generate for today if applicable
  if (startDate <= todayStr && (!endDate || endDate >= todayStr)) {
    for (const time of times) {
      const scheduledTime = `${todayStr} ${time}:00`;

      const existing = db.prepare(`
        SELECT id FROM medication_logs
        WHERE medication_id = ? AND scheduled_time = ?
      `).get(med.id, scheduledTime);

      if (!existing) {
        db.prepare(`
          INSERT INTO medication_logs (medication_id, scheduled_time, status)
          VALUES (?, ?, 'pending')
        `).run(med.id, scheduledTime);
        logsCreated++;
      }
    }
  }

  // Generate for tomorrow if applicable
  if (startDate <= tomorrowStr && (!endDate || endDate >= tomorrowStr)) {
    for (const time of times) {
      const scheduledTime = `${tomorrowStr} ${time}:00`;

      const existing = db.prepare(`
        SELECT id FROM medication_logs
        WHERE medication_id = ? AND scheduled_time = ?
      `).get(med.id, scheduledTime);

      if (!existing) {
        db.prepare(`
          INSERT INTO medication_logs (medication_id, scheduled_time, status)
          VALUES (?, ?, 'pending')
        `).run(med.id, scheduledTime);
        logsCreated++;
      }
    }
  }

  console.log(`✓ Created ${logsCreated} logs for medication ${med.name}`);
  return logsCreated;
}

// Mark past pending logs as missed
export function markMissedLogs() {
  const now = new Date().toISOString();

  const result = db.prepare(`
    UPDATE medication_logs
    SET status = 'missed'
    WHERE status = 'pending' AND scheduled_time < ?
  `).run(now);

  if (result.changes > 0) {
    console.log(`✓ Marked ${result.changes} logs as missed`);
  }

  return result.changes;
}

// Initialize scheduler
export function initializeScheduler() {
  console.log('📅 Initializing scheduler...');

  // Generate logs for today (on startup)
  const today = new Date();
  generateLogsForDate(today);

  // Also generate for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  generateLogsForDate(tomorrow);

  // Schedule: Generate tomorrow's logs at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('🕐 Midnight - Generating logs for tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    generateLogsForDate(tomorrow);
  });

  // Schedule: Mark missed logs every hour
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Checking for missed medications...');
    markMissedLogs();
  });

  // Schedule: Check for due medications and send notifications every minute
  cron.schedule('* * * * *', async () => {
    await checkAndNotifyDueMedications();
  });

  console.log('✅ Scheduler initialized');
  console.log('   - Generating tomorrow\'s logs at midnight');
  console.log('   - Checking for missed logs every hour');
  console.log('   - Sending medication reminders every minute');
}
