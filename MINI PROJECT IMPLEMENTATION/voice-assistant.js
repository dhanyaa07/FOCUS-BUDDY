// Voice Assistant for Thought Tracker
// Uses Web Speech API for speech-to-text conversion

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcript = '';
        this.onTranscript = null;
        this.init();
    }

    init() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser');
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            this.transcript = finalTranscript || interimTranscript;

            if (this.onTranscript) {
                this.onTranscript(this.transcript, !finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Voice recognition ended');
        };

        return true;
    }

    startListening(callback) {
        if (!this.recognition) {
            alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
            return false;
        }

        this.onTranscript = callback;
        this.transcript = '';

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            return false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    getTranscript() {
        return this.transcript;
    }

    // Text-to-speech for reading back thoughts
    speak(text, options = {}) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1.1;
            utterance.volume = options.volume || 1;
            utterance.lang = 'en-US';

            // Use a friendly voice if available
            const voices = speechSynthesis.getVoices();
            const friendlyVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google'));
            if (friendlyVoice) {
                utterance.voice = friendlyVoice;
            }

            speechSynthesis.speak(utterance);
        }
    }

    stopSpeaking() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
}

// Global instance
window.voiceAssistant = new VoiceAssistant();

// Helper function to check browser support
function checkVoiceSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSpeechRecognition = !!SpeechRecognition;
    const hasSpeechSynthesis = 'speechSynthesis' in window;

    return {
        supported: hasSpeechRecognition && hasSpeechSynthesis,
        recognition: hasSpeechRecognition,
        synthesis: hasSpeechSynthesis
    };
}
