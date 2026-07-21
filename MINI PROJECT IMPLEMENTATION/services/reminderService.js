const cron = require('node-cron');
const { db } = require('../db/database');

class ReminderService {
    constructor() {
        this.activeReminders = new Map();
        this.initializeCronJobs();
    }

    initializeCronJobs() {
        // Reset all completed_today flags at midnight
        cron.schedule('0 0 * * *', () => {
            db.run('UPDATE reminders SET completed_today = 0', (err) => {
                if (err) {
                    console.error('Error resetting reminders:', err);
                } else {
                    console.log('Daily reminders reset at midnight');
                }
            });
        });

        // Check for due reminders every minute
        cron.schedule('* * * * *', () => {
            this.checkDueReminders();
        });

        console.log('Reminder service initialized with cron jobs');
    }

    checkDueReminders() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        db.all(
            `SELECT r.*, u.name, u.email 
       FROM reminders r
       JOIN users u ON r.user_id = u.id
       WHERE r.active = 1 
       AND r.completed_today = 0 
       AND r.time = ?`,
            [currentTime],
            (err, reminders) => {
                if (err) {
                    console.error('Error fetching reminders:', err);
                    return;
                }

                reminders.forEach(reminder => {
                    // Check if reminder should fire today based on frequency
                    let shouldFire = false;

                    if (reminder.frequency === 'daily') {
                        shouldFire = true;
                    } else if (reminder.frequency === 'weekly' && reminder.days) {
                        const days = reminder.days.toLowerCase().split(',').map(d => d.trim());
                        shouldFire = days.includes(currentDay);
                    } else if (reminder.frequency === 'custom' && reminder.days) {
                        const days = reminder.days.toLowerCase().split(',').map(d => d.trim());
                        shouldFire = days.includes(currentDay);
                    }

                    if (shouldFire) {
                        this.triggerReminder(reminder);
                    }
                });
            }
        );
    }

    triggerReminder(reminder) {
        console.log(`🔔 Reminder triggered for ${reminder.name}: ${reminder.title}`);

        // In a production app, you would:
        // 1. Send push notification
        // 2. Send email
        // 3. Send SMS
        // 4. Store notification in database for in-app display

        // For now, we just log it
        // The frontend will poll for active reminders and show browser notifications
    }

    // Get active reminders for a user that should be shown now
    getActiveRemindersForUser(userId, callback) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        db.all(
            `SELECT * FROM reminders 
       WHERE user_id = ? 
       AND active = 1 
       AND completed_today = 0
       AND time <= ?
       ORDER BY time ASC`,
            [userId, currentTime],
            callback
        );
    }
}

// Singleton instance
const reminderService = new ReminderService();

module.exports = reminderService;
