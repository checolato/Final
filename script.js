let recognition;
let currentAudio = null;
const audioFiles = ['Rain.m4a', 'Wind.m4a', 'Picnic.m4a', 'Bird.m4a'];

// 1) SpeechRecognition setup
function initSpeechRecognition() {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechAPI) return alert('Use Chrome or Edge for speech recog.');

  recognition = new SpeechAPI();
  recognition.continuous    = true;
  recognition.interimResults = true;  // show partial so you can debug
  recognition.lang          = 'en-US';

  recognition.onresult = event => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const txt = res[0].transcript.trim();
      console.log(res.isFinal ? '✔️ final:' : '⏳ interim:', txt);
      if (res.isFinal) createTextElement(txt);
    }
  };

  recognition.onend = () => recognition.start();  // auto-restart
  recognition.onerror = e => console.error(e);
  recognition.start();
}


// 2) Create & animate text
function createTextElement(text) {
  const el = document.createElement('div');
  el.className   = 'speech-text';
  el.textContent = text;
  const x = Math.random() * (window.innerWidth - 200);
  const y = Math.random() * (window.innerHeight - 50);
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  document.getElementById('text-container').appendChild(el);

  if (currentAudio) {
    const fname = currentAudio.src.split('/').pop();
    if (fname === 'Rain.m4a') {
      el.classList.add('raindrop');
      setTimeout(() => el.remove(), 3000);
    } else if (fname === 'Wind.m4a') {
      el.classList.add('fly-away');
      setTimeout(() => el.remove(), 3000);
    }
    // Picnic/Bird just accumulate
  }
}

// 3) Play random audio
function playNextAudio() {
  const choice = audioFiles[Math.floor(Math.random() * audioFiles.length)];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
  }
  currentAudio = new Audio(`assets/${choice}`);
  currentAudio.play().catch(err => console.error('Audio play failed:', err));
  currentAudio.onended = playNextAudio;
}

// 4) Wire up optional buttons
document.getElementById('start-audio')
  .addEventListener('click', playNextAudio);
document.getElementById('stop-audio')
  .addEventListener('click', () => currentAudio && currentAudio.pause());

// 5) Auto-start everything on load
window.addEventListener('load', () => {
  initSpeechRecognition();
  playNextAudio();
});
