let recognition;
let isAudioPlaying = false;
let currentAudio = null;
const audioFiles = ['Rain.m4a', 'Wind.m4a', 'Picnic.m4a', 'Bird.m4a'];

// Initialize speech recognition
function initSpeechRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
            const text = result[0].transcript;
            createTextElement(text);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.start();
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