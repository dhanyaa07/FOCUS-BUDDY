const express = require('express');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all reminders for a user
router.get('/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;

    // Check authorization
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.all(
        'SELECT * FROM reminders WHERE user_id = ? ORDER BY time ASC',
        [userId],
        (err, reminders) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(reminders);
        }
    );
});

// Create new reminder
router.post('/', authenticateToken, (req, res) => {
    const { userId, title, description, time, frequency, days, category } = req.body;

    if (!title || !time || !frequency) {
        return res.status(400).json({ error: 'Title, time, and frequency are required' });
    }

    // Check authorization
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.run(
        `INSERT INTO reminders (user_id, title, description, time, frequency, days, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, description || null, time, frequency, days || null, category || null],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'Reminder created successfully',
                id: this.lastID
            });
        }
    );
});

// Update reminder
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, description, time, frequency, days, category, active } = req.body;

    // First check if reminder belongs to user
    db.get('SELECT user_id FROM reminders WHERE id = ?', [id], (err, reminder) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        if (reminder.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run(
            `UPDATE reminders 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           time = COALESCE(?, time),
           frequency = COALESCE(?, frequency),
           days = COALESCE(?, days),
           category = COALESCE(?, category),
           active = COALESCE(?, active)
       WHERE id = ?`,
            [title, description, time, frequency, days, category, active, id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Reminder updated successfully' });
            }
        );
    });
});

// Delete reminder
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // First check if reminder belongs to user
    db.get('SELECT user_id FROM reminders WHERE id = ?', [id], (err, reminder) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        if (reminder.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run('DELETE FROM reminders WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Reminder deleted successfully' });
        });
    });
});

// Mark reminder as completed for today
router.post('/:id/complete', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.get('SELECT user_id FROM reminders WHERE id = ?', [id], (err, reminder) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        if (reminder.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run(
            'UPDATE reminders SET completed_today = 1 WHERE id = ?',
            [id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Reminder marked as completed' });
            }
        );
    });
});

module.exports = router;
