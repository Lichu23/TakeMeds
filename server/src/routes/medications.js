import express from 'express';
import db from '../db/database.js';
import { generateLogsForMedication } from '../services/schedulerService.js';

const router = express.Router();

// GET all medications
router.get('/', (req, res) => {
  try {
    const medications = db.prepare('SELECT * FROM medications ORDER BY created_at DESC').all();

    // Parse times JSON for each medication
    const parsedMedications = medications.map(med => ({
      ...med,
      times: JSON.parse(med.times),
      active: Boolean(med.active)
    }));

    res.json({
      success: true,
      medications: parsedMedications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error.message
    });
  }
});

// GET single medication
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const medication = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.json({
      success: true,
      medication: {
        ...medication,
        times: JSON.parse(medication.times),
        active: Boolean(medication.active)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medication',
      error: error.message
    });
  }
});

// POST create new medication
router.post('/', (req, res) => {
  try {
    const { name, dosage, frequency, times, start_date, end_date, notes } = req.body;

    // Validation
    if (!name || !frequency || !times || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, frequency, times, start_date'
      });
    }

    if (!Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Times must be a non-empty array'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO medications (name, dosage, frequency, times, start_date, end_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      dosage || null,
      frequency,
      JSON.stringify(times),
      start_date,
      end_date || null,
      notes || null
    );

    const newMedication = db.prepare('SELECT * FROM medications WHERE id = ?').get(result.lastInsertRowid);

    // Generate logs for today and tomorrow for this new medication
    generateLogsForMedication(newMedication.id);

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      medication: {
        ...newMedication,
        times: JSON.parse(newMedication.times),
        active: Boolean(newMedication.active)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create medication',
      error: error.message
    });
  }
});

// PUT update medication
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, times, start_date, end_date, active, notes } = req.body;

    // Check if medication exists
    const existing = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const stmt = db.prepare(`
      UPDATE medications
      SET name = ?, dosage = ?, frequency = ?, times = ?, start_date = ?,
          end_date = ?, active = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name || existing.name,
      dosage !== undefined ? dosage : existing.dosage,
      frequency || existing.frequency,
      times ? JSON.stringify(times) : existing.times,
      start_date || existing.start_date,
      end_date !== undefined ? end_date : existing.end_date,
      active !== undefined ? (active ? 1 : 0) : existing.active,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);

    // Regenerate logs if times changed or medication was reactivated
    if (times || active === true) {
      generateLogsForMedication(updated.id);
    }

    res.json({
      success: true,
      message: 'Medication updated successfully',
      medication: {
        ...updated,
        times: JSON.parse(updated.times),
        active: Boolean(updated.active)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update medication',
      error: error.message
    });
  }
});

// DELETE medication
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM medications WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    db.prepare('DELETE FROM medications WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication',
      error: error.message
    });
  }
});

export default router;
