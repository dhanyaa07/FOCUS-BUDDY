const express = require('express');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user progress for a specific date or today
router.get('/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Check authorization
    if (req.user.id !== parseInt(userId) && req.user.role !== 'parent' && req.user.role !== 'therapist') {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.get(
        'SELECT * FROM progress WHERE user_id = ? AND date = ?',
        [userId, date],
        (err, progress) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!progress) {
                // Return default progress if none exists
                return res.json({
                    user_id: parseInt(userId),
                    date,
                    focus_minutes: 0,
                    games_played: 0,
                    relax_sessions: 0,
                    stars: 0,
                    streak: 0,
                    best_reaction: null,
                    heart_rate: null
                });
            }

            res.json(progress);
        }
    );
});

// Update or create progress
router.post('/', authenticateToken, (req, res) => {
    const {
        userId,
        focusMinutes,
        gamesPlayed,
        relaxSessions,
        stars,
        streak,
        bestReaction,
        heartRate
    } = req.body;

    const date = new Date().toISOString().split('T')[0];

    // Check authorization
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.run(
        `INSERT INTO progress (user_id, date, focus_minutes, games_played, relax_sessions, stars, streak, best_reaction, heart_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, date) 
     DO UPDATE SET
       focus_minutes = ?,
       games_played = ?,
       relax_sessions = ?,
       stars = ?,
       streak = ?,
       best_reaction = COALESCE(?, best_reaction),
       heart_rate = ?`,
        [
            userId, date, focusMinutes, gamesPlayed, relaxSessions, stars, streak, bestReaction, heartRate,
            focusMinutes, gamesPlayed, relaxSessions, stars, streak, bestReaction, heartRate
        ],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                message: 'Progress updated successfully',
                date,
                userId
            });
        }
    );
});

// Get aggregated stats for a user
router.get('/:userId/stats', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    // Check authorization
    if (req.user.id !== parseInt(userId) && req.user.role !== 'parent' && req.user.role !== 'therapist') {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.all(
        `SELECT * FROM progress 
     WHERE user_id = ? 
     AND date >= date('now', '-' || ? || ' days')
     ORDER BY date DESC`,
        [userId, days],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const stats = {
                totalFocusMinutes: 0,
                totalGamesPlayed: 0,
                totalRelaxSessions: 0,
                totalStars: 0,
                currentStreak: 0,
                bestReaction: null,
                dailyData: rows
            };

            rows.forEach(row => {
                stats.totalFocusMinutes += row.focus_minutes;
                stats.totalGamesPlayed += row.games_played;
                stats.totalRelaxSessions += row.relax_sessions;
                stats.totalStars += row.stars;
                if (row.streak > stats.currentStreak) stats.currentStreak = row.streak;
                if (row.best_reaction && (!stats.bestReaction || row.best_reaction < stats.bestReaction)) {
                    stats.bestReaction = row.best_reaction;
                }
            });

            res.json(stats);
        }
    );
});

module.exports = router;
