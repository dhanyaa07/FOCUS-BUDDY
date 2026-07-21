const express = require('express');
const { db } = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all notes for a specific child
router.get('/child/:childId', authenticateToken, (req, res) => {
    const { childId } = req.params;

    db.all(
        `SELECT tn.*, u.name as teacher_name 
     FROM teacher_notes tn
     JOIN users u ON tn.teacher_id = u.id
     WHERE tn.child_id = ?
     ORDER BY tn.created_at DESC`,
        [childId],
        (err, notes) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(notes);
        }
    );
});

// Get all notes created by a teacher
router.get('/teacher/:teacherId', authenticateToken, authorizeRoles('teacher', 'therapist'), (req, res) => {
    const { teacherId } = req.params;

    // Check authorization
    if (req.user.id !== parseInt(teacherId) && req.user.role !== 'therapist') {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.all(
        `SELECT tn.*, u.name as child_name 
     FROM teacher_notes tn
     JOIN users u ON tn.child_id = u.id
     WHERE tn.teacher_id = ?
     ORDER BY tn.created_at DESC`,
        [teacherId],
        (err, notes) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(notes);
        }
    );
});

// Get all children (for teacher dropdown)
router.get('/children', authenticateToken, authorizeRoles('teacher', 'therapist'), (req, res) => {
    db.all(
        `SELECT id, name, email FROM users WHERE role = 'child' ORDER BY name ASC`,
        [],
        (err, children) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(children);
        }
    );
});

// Create new teacher note
router.post('/', authenticateToken, authorizeRoles('teacher', 'therapist'), (req, res) => {
    const { childId, note, category } = req.body;
    const teacherId = req.user.id;

    if (!childId || !note) {
        return res.status(400).json({ error: 'Child ID and note are required' });
    }

    // Verify child exists
    db.get('SELECT id FROM users WHERE id = ? AND role = "child"', [childId], (err, child) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!child) {
            return res.status(404).json({ error: 'Child not found' });
        }

        db.run(
            `INSERT INTO teacher_notes (teacher_id, child_id, note, category)
       VALUES (?, ?, ?, ?)`,
            [teacherId, childId, note, category || null],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({
                    message: 'Note created successfully',
                    id: this.lastID
                });
            }
        );
    });
});

// Update teacher note
router.put('/:id', authenticateToken, authorizeRoles('teacher', 'therapist'), (req, res) => {
    const { id } = req.params;
    const { note, category } = req.body;

    // Check if note belongs to teacher
    db.get('SELECT teacher_id FROM teacher_notes WHERE id = ?', [id], (err, noteRecord) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!noteRecord) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (noteRecord.teacher_id !== req.user.id && req.user.role !== 'therapist') {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run(
            `UPDATE teacher_notes 
       SET note = COALESCE(?, note),
           category = COALESCE(?, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [note, category, id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Note updated successfully' });
            }
        );
    });
});

// Delete teacher note
router.delete('/:id', authenticateToken, authorizeRoles('teacher', 'therapist'), (req, res) => {
    const { id } = req.params;

    // Check if note belongs to teacher
    db.get('SELECT teacher_id FROM teacher_notes WHERE id = ?', [id], (err, noteRecord) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!noteRecord) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (noteRecord.teacher_id !== req.user.id && req.user.role !== 'therapist') {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.run('DELETE FROM teacher_notes WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Note deleted successfully' });
        });
    });
});

module.exports = router;
