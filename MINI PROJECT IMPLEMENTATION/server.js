require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');
const reminderService = require('./services/reminderService');

// Import routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const reminderRoutes = require('./routes/reminders');
const teacherNotesRoutes = require('./routes/teacherNotes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/teacher-notes', teacherNotesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ADHD Assist API is running' });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'ADHD Assist API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            progress: '/api/progress',
            reminders: '/api/reminders',
            teacherNotes: '/api/teacher-notes'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 ADHD Assist - Backend Server                    ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   API endpoint: http://localhost:${PORT}/api          ║
║                                                       ║
║   📊 Database: SQLite                                ║
║   🔔 Reminder Service: Active                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
