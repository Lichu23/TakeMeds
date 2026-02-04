import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all logs (with optional date filtering)
router.get('/', (req, res) => {
  try {
    const { start_date, end_date, medication_id } = req.query;

    let query = `
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ' AND date(l.scheduled_time) >= date(?)';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND date(l.scheduled_time) <= date(?)';
      params.push(end_date);
    }

    if (medication_id) {
      query += ' AND l.medication_id = ?';
      params.push(medication_id);
    }

    query += ' ORDER BY l.scheduled_time DESC';

    const logs = db.prepare(query).all(...params);

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// GET today's logs (includes today + tomorrow's upcoming if today has few pending)
router.get('/today', (req, res) => {
  try {
    // Get today's logs
    const todayLogs = db.prepare(`
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE date(l.scheduled_time) = date('now')
      ORDER BY l.scheduled_time ASC
    `).all();

    // Get tomorrow's logs (to show upcoming)
    const tomorrowLogs = db.prepare(`
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE date(l.scheduled_time) = date('now', '+1 day')
      ORDER BY l.scheduled_time ASC
    `).all();

    // Check if there are pending medications for the rest of today
    const pendingToday = todayLogs.filter(l => l.status === 'pending').length;

    // If no pending for today, include tomorrow's logs
    // This helps when user creates medication late at night
    let logs = todayLogs;
    let includesUpcoming = false;

    if (pendingToday === 0 && tomorrowLogs.length > 0) {
      logs = [...todayLogs, ...tomorrowLogs];
      includesUpcoming = true;
    }

    // Calculate statistics (only for today)
    const stats = {
      total: todayLogs.length,
      taken: todayLogs.filter(l => l.status === 'taken').length,
      missed: todayLogs.filter(l => l.status === 'missed').length,
      pending: todayLogs.filter(l => l.status === 'pending').length,
      skipped: todayLogs.filter(l => l.status === 'skipped').length
    };

    res.json({
      success: true,
      logs,
      stats,
      includesUpcoming,
      upcomingCount: includesUpcoming ? tomorrowLogs.length : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s logs',
      error: error.message
    });
  }
});

// GET history with statistics
router.get('/history', (req, res) => {
  try {
    const { days = 30 } = req.query;

    const logs = db.prepare(`
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE date(l.scheduled_time) >= date('now', '-' || ? || ' days')
      ORDER BY l.scheduled_time DESC
    `).all(days);

    // Calculate statistics
    const totalLogs = logs.length;
    const takenLogs = logs.filter(l => l.status === 'taken').length;
    const complianceRate = totalLogs > 0 ? ((takenLogs / totalLogs) * 100).toFixed(2) : 0;

    // Calculate streak (consecutive days with all medications taken)
    const streak = calculateStreak();

    // Group by medication
    const byMedication = {};
    logs.forEach(log => {
      if (!byMedication[log.medication_id]) {
        byMedication[log.medication_id] = {
          name: log.medication_name,
          total: 0,
          taken: 0,
          missed: 0,
          pending: 0,
          skipped: 0
        };
      }
      byMedication[log.medication_id].total++;
      byMedication[log.medication_id][log.status]++;
    });

    res.json({
      success: true,
      logs,
      stats: {
        totalDays: parseInt(days),
        totalLogs,
        taken: takenLogs,
        compliance_rate: parseFloat(complianceRate),
        streak,
        byMedication
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
});

// POST create log (mark medication as taken)
router.post('/', (req, res) => {
  try {
    const { medication_id, scheduled_time, taken_time, status, notes } = req.body;

    if (!medication_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: medication_id, status'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO medication_logs (medication_id, scheduled_time, taken_time, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      medication_id,
      scheduled_time || new Date().toISOString(),
      taken_time || (status === 'taken' ? new Date().toISOString() : null),
      status,
      notes || null
    );

    const newLog = db.prepare(`
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE l.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Log created successfully',
      log: newLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create log',
      error: error.message
    });
  }
});

// PUT update log
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, taken_time, notes } = req.body;

    const existing = db.prepare('SELECT * FROM medication_logs WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    const stmt = db.prepare(`
      UPDATE medication_logs
      SET status = ?, taken_time = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(
      status || existing.status,
      taken_time !== undefined ? taken_time : existing.taken_time,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare(`
      SELECT l.*, m.name as medication_name, m.dosage
      FROM medication_logs l
      JOIN medications m ON l.medication_id = m.id
      WHERE l.id = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Log updated successfully',
      log: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update log',
      error: error.message
    });
  }
});

// DELETE log
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM medication_logs WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    db.prepare('DELETE FROM medication_logs WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete log',
      error: error.message
    });
  }
});

// Helper function to calculate streak
function calculateStreak() {
  try {
    // Get all dates with logs
    const dailyStats = db.prepare(`
      SELECT
        date(scheduled_time) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken
      FROM medication_logs
      WHERE date(scheduled_time) < date('now')
      GROUP BY date(scheduled_time)
      ORDER BY date DESC
    `).all();

    let streak = 0;
    for (const day of dailyStats) {
      if (day.taken === day.total) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Failed to calculate streak:', error);
    return 0;
  }
}

export default router;
