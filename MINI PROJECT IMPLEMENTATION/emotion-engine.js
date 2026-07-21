// ML Emotion Detection Engine using face-api.js
// Real-time face detection and emotion recognition

class EmotionEngine {
    constructor() {
        this.isModelLoaded = false;
        this.isDetecting = false;
        this.video = null;
        this.canvas = null;
        this.currentEmotion = null;
        this.emotionHistory = [];
        this.onEmotionChange = null;
    }

    async loadModels() {
        try {
            console.log('Loading face-api.js models...');

            // Load models from CDN
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

            this.isModelLoaded = true;
            console.log('Models loaded successfully!');
            return true;
        } catch (error) {
            console.error('Error loading models:', error);
            return false;
        }
    }

    async startCamera(videoElement) {
        try {
            this.video = videoElement;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.video.srcObject = stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please ensure you have granted camera permissions.');
            return false;
        }
    }

    stopCamera() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        this.isDetecting = false;
    }

    async startDetection(videoElement, canvasElement, callback) {
        if (!this.isModelLoaded) {
            const loaded = await this.loadModels();
            if (!loaded) return false;
        }

        const cameraStarted = await this.startCamera(videoElement);
        if (!cameraStarted) return false;

        this.canvas = canvasElement;
        this.onEmotionChange = callback;
        this.isDetecting = true;

        // Match canvas size to video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        this.detectEmotions();
        return true;
    }

    async detectEmotions() {
        if (!this.isDetecting) return;

        try {
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            // Clear canvas
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (detections.length > 0) {
                // Draw face detection box
                const resizedDetections = faceapi.resizeResults(detections, {
                    width: this.canvas.width,
                    height: this.canvas.height
                });

                // Draw face box and landmarks
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);

                // Get dominant emotion
                const expressions = detections[0].expressions;
                const emotion = this.getDominantEmotion(expressions);

                // Update emotion if changed
                if (emotion.name !== this.currentEmotion?.name) {
                    this.currentEmotion = emotion;
                    this.emotionHistory.push({
                        emotion: emotion.name,
                        confidence: emotion.confidence,
                        timestamp: new Date()
                    });

                    // Keep only last 100 entries
                    if (this.emotionHistory.length > 100) {
                        this.emotionHistory.shift();
                    }

                    if (this.onEmotionChange) {
                        this.onEmotionChange(emotion, expressions);
                    }
                }

                // Draw emotion label
                this.drawEmotionLabel(ctx, emotion, detections[0].detection.box);
            }
        } catch (error) {
            console.error('Detection error:', error);
        }

        // Continue detection loop
        requestAnimationFrame(() => this.detectEmotions());
    }

    getDominantEmotion(expressions) {
        const emotions = [
            { name: 'happy', emoji: '😊', color: '#ffd700' },
            { name: 'sad', emoji: '😢', color: '#6495ed' },
            { name: 'angry', emoji: '😠', color: '#ff6347' },
            { name: 'neutral', emoji: '😐', color: '#a9a9a9' },
            { name: 'surprised', emoji: '😮', color: '#ff69b4' },
            { name: 'fearful', emoji: '😨', color: '#9370db' },
            { name: 'disgusted', emoji: '🤢', color: '#9acd32' }
        ];

        let maxConfidence = 0;
        let dominantEmotion = emotions[3]; // default to neutral

        emotions.forEach(emotion => {
            const confidence = expressions[emotion.name];
            if (confidence > maxConfidence) {
                maxConfidence = confidence;
                dominantEmotion = { ...emotion, confidence };
            }
        });

        return dominantEmotion;
    }

    drawEmotionLabel(ctx, emotion, box) {
        ctx.fillStyle = emotion.color;
        ctx.font = 'bold 24px Nunito';
        ctx.fillText(
            `${emotion.emoji} ${emotion.name} (${Math.round(emotion.confidence * 100)}%)`,
            box.x,
            box.y - 10
        );
    }

    getEmotionStats() {
        if (this.emotionHistory.length === 0) return null;

        const emotionCounts = {};
        this.emotionHistory.forEach(entry => {
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });

        const total = this.emotionHistory.length;
        const stats = {};

        Object.keys(emotionCounts).forEach(emotion => {
            stats[emotion] = {
                count: emotionCounts[emotion],
                percentage: (emotionCounts[emotion] / total * 100).toFixed(1)
            };
        });

        return stats;
    }

    getRecommendation() {
        if (!this.currentEmotion) return null;

        const recommendations = {
            happy: {
                message: "You're feeling great! Keep up the positive energy!",
                activities: ['games', 'challenges', 'social activities'],
                color: '#ffd700'
            },
            sad: {
                message: "Feeling down? Let's try something uplifting!",
                activities: ['music therapy', 'art therapy', 'relaxation'],
                color: '#6495ed'
            },
            angry: {
                message: "Feeling frustrated? Let's calm down together.",
                activities: ['breathing exercises', 'physical activity', 'mindfulness'],
                color: '#ff6347'
            },
            neutral: {
                message: "Ready for anything! What would you like to do?",
                activities: ['any activity', 'explore new things'],
                color: '#a9a9a9'
            },
            surprised: {
                message: "Something caught your attention! Stay curious!",
                activities: ['exploration games', 'discovery activities'],
                color: '#ff69b4'
            },
            fearful: {
                message: "Feeling worried? Let's find some comfort.",
                activities: ['relaxation', 'calming stories', 'breathing'],
                color: '#9370db'
            },
            disgusted: {
                message: "Not feeling it? Let's try something different!",
                activities: ['change activity', 'take a break'],
                color: '#9acd32'
            }
        };

        return recommendations[this.currentEmotion.name] || recommendations.neutral;
    }

    exportData() {
        return {
            currentEmotion: this.currentEmotion,
            history: this.emotionHistory,
            stats: this.getEmotionStats(),
            exportDate: new Date().toISOString()
        };
    }

    clearHistory() {
        this.emotionHistory = [];
        this.currentEmotion = null;
    }
}

// Global instance
window.emotionEngine = new EmotionEngine();

// Helper function to check browser compatibility
function checkBrowserCompatibility() {
    const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasCanvas = !!document.createElement('canvas').getContext;

    return {
        compatible: hasWebRTC && hasCanvas,
        webRTC: hasWebRTC,
        canvas: hasCanvas
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmotionEngine, checkBrowserCompatibility };
}
