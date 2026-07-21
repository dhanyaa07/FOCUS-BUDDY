// Gamification Engine for ADHD Assist
// Handles XP, levels, streaks, achievements, and rewards

class GamificationEngine {
    constructor() {
        this.userId = null;
        this.currentXP = 0;
        this.currentLevel = 1;
        this.currentStreak = 0;
        this.achievements = [];
        this.init();
    }

    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.userId = JSON.parse(userData).id;
            this.loadProgress();
        }
    }

    // XP and Level System
    calculateLevel(xp) {
        // Level formula: level = floor(sqrt(xp / 100)) + 1
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    getXPForNextLevel(currentLevel) {
        // XP needed for next level
        return Math.pow(currentLevel, 2) * 100;
    }

    addXP(amount, reason = '') {
        this.currentXP += amount;
        const newLevel = this.calculateLevel(this.currentXP);

        if (newLevel > this.currentLevel) {
            this.currentLevel = newLevel;
            this.showLevelUp(newLevel);
            this.playSound('level-up');
        }

        this.saveProgress();
        this.updateUI();

        // Show XP gain animation
        this.showXPGain(amount, reason);
    }

    // Streak System
    updateStreak() {
        const today = new Date().toDateString();
        const lastActivity = localStorage.getItem('lastActivityDate');

        if (lastActivity === today) {
            // Already completed today
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActivity === yesterday.toDateString()) {
            // Continuing streak
            this.currentStreak++;
            this.showStreakCelebration();
        } else if (!lastActivity || lastActivity !== today) {
            // New streak or broken streak
            this.currentStreak = 1;
        }

        localStorage.setItem('lastActivityDate', today);
        this.saveProgress();
        this.updateUI();
    }

    // Achievement System
    achievements_list = [
        { id: 'first_activity', name: 'First Steps', description: 'Complete your first activity', icon: '🎯', xp: 50 },
        { id: 'streak_3', name: '3 Day Streak', description: 'Maintain a 3-day streak', icon: '🔥', xp: 100 },
        { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⭐', xp: 200 },
        { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', xp: 500 },
        { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '🌟', xp: 150 },
        { id: 'level_10', name: 'Expert', description: 'Reach level 10', icon: '💎', xp: 300 },
        { id: 'games_10', name: 'Game Master', description: 'Play 10 games', icon: '🎮', xp: 100 },
        { id: 'therapy_5', name: 'Therapy Explorer', description: 'Try 5 therapy activities', icon: '🎨', xp: 150 },
        { id: 'relax_10', name: 'Zen Master', description: 'Complete 10 relaxation sessions', icon: '🧘', xp: 100 },
        { id: 'perfect_week', name: 'Perfect Week', description: 'Complete daily goals for 7 days', icon: '✨', xp: 250 },
        { id: 'early_bird', name: 'Early Bird', description: 'Complete activity before 9 AM', icon: '🌅', xp: 75 },
        { id: 'night_owl', name: 'Night Owl', description: 'Complete activity after 8 PM', icon: '🦉', xp: 75 },
        { id: 'emotion_tracker', name: 'Emotion Explorer', description: 'Use emotion detection 5 times', icon: '😊', xp: 100 },
        { id: 'all_therapies', name: 'Therapy Champion', description: 'Try all 6 therapy types', icon: '🏆', xp: 300 },
        { id: 'all_games', name: 'Game Champion', description: 'Play all 6 games', icon: '🎯', xp: 200 },
    ];

    checkAchievements() {
        const stats = this.getStats();
        const newAchievements = [];

        this.achievements_list.forEach(achievement => {
            if (this.achievements.includes(achievement.id)) return;

            let earned = false;

            switch (achievement.id) {
                case 'first_activity':
                    earned = stats.totalActivities >= 1;
                    break;
                case 'streak_3':
                    earned = this.currentStreak >= 3;
                    break;
                case 'streak_7':
                    earned = this.currentStreak >= 7;
                    break;
                case 'streak_30':
                    earned = this.currentStreak >= 30;
                    break;
                case 'level_5':
                    earned = this.currentLevel >= 5;
                    break;
                case 'level_10':
                    earned = this.currentLevel >= 10;
                    break;
                case 'games_10':
                    earned = stats.gamesPlayed >= 10;
                    break;
                case 'therapy_5':
                    earned = stats.therapySessions >= 5;
                    break;
                case 'relax_10':
                    earned = stats.relaxSessions >= 10;
                    break;
            }

            if (earned) {
                this.achievements.push(achievement.id);
                newAchievements.push(achievement);
                this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
            }
        });

        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
        }

        this.saveProgress();
    }

    // UI Updates
    updateUI() {
        // Update XP bar
        const xpBar = document.getElementById('xp-bar');
        const xpText = document.getElementById('xp-text');
        const levelText = document.getElementById('level-text');
        const streakText = document.getElementById('streak-text');

        if (xpBar && xpText && levelText) {
            const nextLevelXP = this.getXPForNextLevel(this.currentLevel);
            const currentLevelXP = this.getXPForNextLevel(this.currentLevel - 1);
            const xpInLevel = this.currentXP - currentLevelXP;
            const xpNeeded = nextLevelXP - currentLevelXP;
            const percentage = (xpInLevel / xpNeeded) * 100;

            xpBar.style.width = percentage + '%';
            xpText.textContent = `${xpInLevel} / ${xpNeeded} XP`;
            levelText.textContent = `Level ${this.currentLevel}`;
        }

        if (streakText) {
            streakText.textContent = `🔥 ${this.currentStreak} day streak`;
        }
    }

    // Animations
    showXPGain(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-amount">+${amount} XP</div>
            ${reason ? `<div class="xp-reason">${reason}</div>` : ''}
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    showLevelUp(level) {
        this.showCelebration('🎉 Level Up! 🎉', `You reached Level ${level}!`);
        this.playSound('level-up');
    }

    showStreakCelebration() {
        this.showCelebration('🔥 Streak Continued! 🔥', `${this.currentStreak} days in a row!`);
        this.playSound('streak');
    }

    showAchievements(achievements) {
        achievements.forEach(achievement => {
            this.showCelebration(
                `${achievement.icon} Achievement Unlocked!`,
                `${achievement.name}: ${achievement.description}`
            );
            this.playSound('achievement');
        });
    }

    showCelebration(title, message) {
        const modal = document.createElement('div');
        modal.className = 'celebration-modal';
        modal.innerHTML = `
            <div class="celebration-content">
                <div class="confetti"></div>
                <h2>${title}</h2>
                <p>${message}</p>
                <button onclick="this.closest('.celebration-modal').remove()">Awesome!</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Add confetti effect
        this.createConfetti(modal.querySelector('.confetti'));

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 5000);
    }

    createConfetti(container) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(confetti);
        }
    }

    // Sound Effects
    playSound(soundName) {
        // Simple beep sounds using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const sounds = {
            'level-up': [523, 659, 784, 1047], // C, E, G, C
            'streak': [440, 554, 659], // A, C#, E
            'achievement': [392, 494, 587, 698], // G, B, D, F
            'click': [440]
        };

        const frequencies = sounds[soundName] || [440];
        let time = audioContext.currentTime;

        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

            osc.start(time);
            osc.stop(time + 0.3);

            time += 0.15;
        });
    }

    // Data Persistence
    saveProgress() {
        const data = {
            xp: this.currentXP,
            level: this.currentLevel,
            streak: this.currentStreak,
            achievements: this.achievements
        };
        localStorage.setItem('gamification_' + this.userId, JSON.stringify(data));
    }

    loadProgress() {
        const data = localStorage.getItem('gamification_' + this.userId);
        if (data) {
            const parsed = JSON.parse(data);
            this.currentXP = parsed.xp || 0;
            this.currentLevel = parsed.level || 1;
            this.currentStreak = parsed.streak || 0;
            this.achievements = parsed.achievements || [];
        }
    }

    getStats() {
        // Get stats from localStorage or API
        return {
            totalActivities: parseInt(localStorage.getItem('totalActivities') || '0'),
            gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
            therapySessions: parseInt(localStorage.getItem('therapySessions') || '0'),
            relaxSessions: parseInt(localStorage.getItem('relaxSessions') || '0')
        };
    }

    // Public API
    completeActivity(type, xpAmount = 10) {
        this.addXP(xpAmount, `Completed ${type}`);
        this.updateStreak();
        this.checkAchievements();

        // Update stats
        const stats = this.getStats();
        stats.totalActivities++;
        if (type.includes('game')) stats.gamesPlayed++;
        if (type.includes('therapy')) stats.therapySessions++;
        if (type.includes('relax')) stats.relaxSessions++;

        localStorage.setItem('totalActivities', stats.totalActivities);
        localStorage.setItem('gamesPlayed', stats.gamesPlayed);
        localStorage.setItem('therapySessions', stats.therapySessions);
        localStorage.setItem('relaxSessions', stats.relaxSessions);
    }

    getAchievementsList() {
        return this.achievements_list.map(a => ({
            ...a,
            earned: this.achievements.includes(a.id)
        }));
    }
}

// Global instance
window.gamification = new GamificationEngine();
