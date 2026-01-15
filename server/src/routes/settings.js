import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all settings
router.get('/', (req, res) => {
  try {
    const settingsArray = db.prepare('SELECT key, value FROM settings').all();

    // Convert array to object
    const settings = {};
    settingsArray.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// GET single setting
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      key,
      value: setting.value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// PUT update setting
router.put('/', (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: key, value'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(key, value, value);

    // Get all settings
    const settingsArray = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    settingsArray.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    res.json({
      success: true,
      message: 'Setting updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

// DELETE setting
router.delete('/:key', (req, res) => {
  try {
    const { key } = req.params;

    const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    db.prepare('DELETE FROM settings WHERE key = ?').run(key);

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete setting',
      error: error.message
    });
  }
});

export default router;
