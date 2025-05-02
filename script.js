let recognition;
let isAudioPlaying = false;
let currentAudio = null;
const audioFiles = ['Rain.m4a', 'Wind.m4a', 'Picnic.m4a', 'Bird.m4a'];
let isRecognitionActive = false;

// Initialize speech recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Add visual feedback for microphone status
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'mic-status';
    statusIndicator.style.position = 'fixed';
    statusIndicator.style.top = '10px';
    statusIndicator.style.right = '10px';
    statusIndicator.style.padding = '10px';
    statusIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    statusIndicator.style.color = 'white';
    statusIndicator.style.borderRadius = '5px';
    document.body.appendChild(statusIndicator);

    recognition.onstart = () => {
        isRecognitionActive = true;
        statusIndicator.textContent = '🎤 Microphone is listening...';
        statusIndicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    };

    recognition.onend = () => {
        isRecognitionActive = false;
        statusIndicator.textContent = '🎤 Click to start listening';
        statusIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        
        // Only restart if we're not already trying to start
        if (!isRecognitionActive) {
            setTimeout(() => {
                if (recognition && !isRecognitionActive) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error('Error restarting recognition:', e);
                    }
                }
            }, 1000);
        }
    };

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
            const text = result[0].transcript;
            createTextElement(text);
            statusIndicator.textContent = '🎤 Detected speech!';
            statusIndicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecognitionActive = false;
        
        switch (event.error) {
            case 'no-speech':
                statusIndicator.textContent = '🎤 No speech detected. Please speak louder.';
                break;
            case 'audio-capture':
                statusIndicator.textContent = '🎤 No microphone detected. Please check your microphone.';
                break;
            case 'not-allowed':
                statusIndicator.textContent = '🎤 Microphone access denied. Please allow microphone access.';
                break;
            default:
                statusIndicator.textContent = '🎤 Error: ' + event.error;
        }
        statusIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    };

    // Add click handler to restart recognition if needed
    statusIndicator.addEventListener('click', () => {
        if (isRecognitionActive) {
            try {
                recognition.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error('Error starting recognition:', e);
            }
        }
    });

    try {
        recognition.start();
    } catch (e) {
        console.error('Error starting recognition:', e);
        statusIndicator.textContent = '🎤 Error starting speech recognition';
        statusIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    }
}

// Create text element at random position
function createTextElement(text) {
    const textElement = document.createElement('div');
    textElement.className = 'speech-text';
    textElement.textContent = text;
    
    // Random position
    const x = Math.random() * (window.innerWidth - 300);
    const y = Math.random() * (window.innerHeight - 100);
    textElement.style.left = `${x}px`;
    textElement.style.top = `${y}px`;
    
    document.getElementById('text-container').appendChild(textElement);
    
    // Apply animation based on current audio
    if (currentAudio) {
        const audioName = currentAudio.src.split('/').pop();
        if (audioName === 'Rain.m4a') {
            textElement.classList.add('raindrop');
            setTimeout(() => textElement.remove(), 3000);
        } else if (audioName === 'Wind.m4a') {
            textElement.classList.add('fly-away');
            setTimeout(() => textElement.remove(), 3000);
        }
    }
}

// Play random audio
function playRandomAudio() {
    if (isAudioPlaying) {
        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const audioFile = audioFiles[randomIndex];
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        currentAudio = new Audio(`assets/${audioFile}`);
        currentAudio.loop = true;
        currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            alert('Error playing audio. Please make sure your browser supports M4A format.');
        });
    }
}

// Initialize audio controls
document.getElementById('start-audio').addEventListener('click', () => {
    isAudioPlaying = true;
    playRandomAudio();
});

document.getElementById('stop-audio').addEventListener('click', () => {
    isAudioPlaying = false;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
});

// Start speech recognition when page loads
window.addEventListener('load', () => {
    initSpeechRecognition();
});