// Mascot Character System - "Brainy" the Brain Buddy
// Provides encouraging messages, animations, and personality

class MascotSystem {
    constructor() {
        this.currentMood = 'happy';
        this.messages = this.initMessages();
        this.init();
    }

    init() {
        this.createMascot();
        this.startIdleAnimation();
    }

    initMessages() {
        return {
            welcome: [
                "Hi there! I'm Brainy, your brain buddy! 🧠",
                "Welcome back, superstar! Ready to have fun?",
                "Let's make today amazing together!",
                "You're here! That makes me so happy! 😊"
            ],
            encouragement: [
                "You're doing great! Keep it up!",
                "Wow, you're so smart!",
                "I believe in you!",
                "You've got this!",
                "Amazing work!",
                "You're a superstar! ⭐"
            ],
            celebration: [
                "Woohoo! You did it! 🎉",
                "That was incredible!",
                "You're unstoppable!",
                "I knew you could do it!",
                "High five! ✋"
            ],
            motivation: [
                "Let's try one more activity!",
                "You're on a roll!",
                "Ready for the next challenge?",
                "Let's keep this streak going! 🔥"
            ],
            comfort: [
                "It's okay, everyone makes mistakes!",
                "Let's try again together!",
                "You're learning and that's awesome!",
                "Take a deep breath, you've got this! 💙"
            ],
            tips: [
                "Did you know? Taking breaks helps your brain!",
                "Remember to breathe deeply!",
                "You're making your brain stronger!",
                "Every activity helps you grow!"
            ]
        };
    }

    createMascot() {
        const mascot = document.createElement('div');
        mascot.id = 'brainy-mascot';
        mascot.className = 'mascot-container';
        mascot.innerHTML = `
            <div class="mascot-character">
                <svg viewBox="0 0 200 200" class="mascot-svg">
                    <!-- Brain body -->
                    <ellipse cx="100" cy="100" rx="70" ry="75" fill="#ff6b9d" class="mascot-body"/>
                    
                    <!-- Brain texture -->
                    <path d="M 60 70 Q 70 60, 80 70 T 100 70" stroke="#ff4081" stroke-width="3" fill="none" class="brain-line"/>
                    <path d="M 60 90 Q 70 80, 80 90 T 100 90" stroke="#ff4081" stroke-width="3" fill="none" class="brain-line"/>
                    <path d="M 100 70 Q 110 60, 120 70 T 140 70" stroke="#ff4081" stroke-width="3" fill="none" class="brain-line"/>
                    <path d="M 100 90 Q 110 80, 120 90 T 140 90" stroke="#ff4081" stroke-width="3" fill="none" class="brain-line"/>
                    
                    <!-- Eyes -->
                    <circle cx="75" cy="95" r="12" fill="white" class="eye-white"/>
                    <circle cx="125" cy="95" r="12" fill="white" class="eye-white"/>
                    <circle cx="75" cy="95" r="7" fill="#333" class="eye-pupil pupil-left"/>
                    <circle cx="125" cy="95" r="7" fill="#333" class="eye-pupil pupil-right"/>
                    
                    <!-- Smile -->
                    <path d="M 70 120 Q 100 135, 130 120" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" class="mouth"/>
                    
                    <!-- Blush -->
                    <circle cx="50" cy="110" r="8" fill="#ff9999" opacity="0.6" class="blush"/>
                    <circle cx="150" cy="110" r="8" fill="#ff9999" opacity="0.6" class="blush"/>
                    
                    <!-- Arms -->
                    <ellipse cx="40" cy="120" rx="15" ry="8" fill="#ff6b9d" class="arm-left" transform="rotate(-30 40 120)"/>
                    <ellipse cx="160" cy="120" rx="15" ry="8" fill="#ff6b9d" class="arm-right" transform="rotate(30 160 120)"/>
                </svg>
            </div>
            <div class="mascot-speech-bubble" id="mascot-speech">
                <div class="speech-text"></div>
            </div>
        `;

        document.body.appendChild(mascot);

        // Make mascot clickable
        mascot.querySelector('.mascot-character').addEventListener('click', () => {
            this.showRandomMessage('encouragement');
        });
    }

    startIdleAnimation() {
        setInterval(() => {
            this.blink();
        }, 3000 + Math.random() * 2000);

        setInterval(() => {
            this.wiggle();
        }, 5000 + Math.random() * 3000);
    }

    blink() {
        const pupils = document.querySelectorAll('.eye-pupil');
        pupils.forEach(pupil => {
            pupil.style.transform = 'scaleY(0.1)';
            setTimeout(() => {
                pupil.style.transform = 'scaleY(1)';
            }, 150);
        });
    }

    wiggle() {
        const character = document.querySelector('.mascot-character');
        if (character) {
            character.style.animation = 'none';
            setTimeout(() => {
                character.style.animation = 'wiggle 0.5s ease-in-out';
            }, 10);
        }
    }

    jump() {
        const character = document.querySelector('.mascot-character');
        if (character) {
            character.style.animation = 'jump 0.6s ease-in-out';
        }
    }

    celebrate() {
        this.jump();
        this.showRandomMessage('celebration');
        this.setMood('excited');
        setTimeout(() => this.setMood('happy'), 3000);
    }

    encourage() {
        this.showRandomMessage('encouragement');
        this.wiggle();
    }

    comfort() {
        this.showRandomMessage('comfort');
        this.setMood('caring');
        setTimeout(() => this.setMood('happy'), 4000);
    }

    setMood(mood) {
        this.currentMood = mood;
        const mouth = document.querySelector('.mouth');
        const body = document.querySelector('.mascot-body');

        if (!mouth || !body) return;

        switch (mood) {
            case 'happy':
                mouth.setAttribute('d', 'M 70 120 Q 100 135, 130 120');
                body.style.fill = '#ff6b9d';
                break;
            case 'excited':
                mouth.setAttribute('d', 'M 70 115 Q 100 140, 130 115');
                body.style.fill = '#ff4081';
                break;
            case 'caring':
                mouth.setAttribute('d', 'M 70 125 Q 100 130, 130 125');
                body.style.fill = '#ff8fab';
                break;
            case 'thinking':
                mouth.setAttribute('d', 'M 70 125 L 130 125');
                body.style.fill = '#ff6b9d';
                break;
        }
    }

    showMessage(message, duration = 3000) {
        const bubble = document.getElementById('mascot-speech');
        const text = bubble.querySelector('.speech-text');

        text.textContent = message;
        bubble.classList.add('active');

        setTimeout(() => {
            bubble.classList.remove('active');
        }, duration);
    }

    showRandomMessage(category) {
        const messages = this.messages[category];
        if (messages && messages.length > 0) {
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.showMessage(message);
        }
    }

    welcome() {
        setTimeout(() => {
            this.showRandomMessage('welcome');
            this.wiggle();
        }, 500);
    }

    tip() {
        this.showRandomMessage('tips');
        this.setMood('thinking');
        setTimeout(() => this.setMood('happy'), 4000);
    }

    motivate() {
        this.showRandomMessage('motivation');
        this.jump();
    }

    // Context-aware responses
    onActivityStart(activityType) {
        const messages = {
            game: "Let's play! This is going to be fun! 🎮",
            therapy: "Great choice! This will help you feel amazing! 🎨",
            relax: "Time to relax and recharge! You deserve it! 🧘",
            emotion: "Let's check in with your feelings! 😊"
        };
        this.showMessage(messages[activityType] || "Let's do this together!");
    }

    onActivityComplete(activityType, success = true) {
        if (success) {
            this.celebrate();
        } else {
            this.comfort();
        }
    }

    onStreak(days) {
        if (days >= 7) {
            this.showMessage(`🔥 WOW! ${days} days in a row! You're on fire!`);
            this.celebrate();
        } else if (days >= 3) {
            this.showMessage(`🔥 ${days} day streak! Keep it going!`);
            this.jump();
        }
    }

    onLevelUp(level) {
        this.showMessage(`🎉 Level ${level}! You're getting so strong!`, 4000);
        this.celebrate();
    }

    onAchievement(achievementName) {
        this.showMessage(`🏆 ${achievementName}! I'm so proud of you!`, 4000);
        this.celebrate();
    }
}

// Global instance
window.mascot = new MascotSystem();

// Auto-welcome when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.mascot) {
        window.mascot.welcome();
    }
});
