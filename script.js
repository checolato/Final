  window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');

  // Request microphone access up front
  navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
    console.warn('Microphone permission was denied or failed:', err);
  });
  
  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;
  let switchTimer = null;
  let currentIndex = 0;

  const playlist = [
    { name: 'Park', src: 'assets/Park.mp3', duration: 20000 },
    { name: 'Rain', src: 'assets/Rain.mp3', duration: 15000 },
    { name: 'Bird', src: 'assets/Bird.mp3', duration: 20000 },
    { name: 'Wind', src: 'assets/Wind.mp3', duration: 10000 }
  ];


  function applyAnimation(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      if (soundName === 'Rain') el.classList.add('raindrop');
      else if (soundName === 'Wind') el.classList.add('fly-away');

      if (soundName === 'Rain' || soundName === 'Wind') {
        el.addEventListener('animationend', () => el.remove());
      }
    });
  }

  function applyPageDarken(soundName) {
    if (soundName === 'Rain') container.classList.add('darken');
    else container.classList.remove('darken');
  }

  function playNext() {
    if (switchTimer) clearTimeout(switchTimer);
    if (currentAudio) currentAudio.pause();

    const { name, src, duration } = playlist[currentIndex];
    currentSound = name;
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);

    currentAudio.addEventListener('play', () => {
      applyAnimation(currentSound);
      applyPageDarken(currentSound);
    });

    switchTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % playlist.length;
      playNext();
    }, duration);
  }

  container.addEventListener('click', e => {
    if (!audioStarted) {
      playNext();
      audioStarted = true;
    }
    const id = Date.now() + '-' + Math.random();
    spawnBox({ x: e.clientX, y: e.clientY, id });
  });

  function spawnBox(data) {
    const { x, y, id } = data;
    if (document.querySelector(`.text-item[data-id="${id}"]`)) return;

    const box = document.createElement('div');
    box.className = 'text-item';
    box.setAttribute('data-id', id);
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.innerHTML = '<em>Listening...</em>';

    container.appendChild(box);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      box.innerHTML = 'Speech Recognition not supported.';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      box.innerHTML = finalTranscript + '<span style="opacity:0.6">' + interimTranscript + '</span>';
    };

    recognition.onerror = (event) => {
      box.innerHTML = 'Error: ' + event.error;
    };

    recognition.onend = () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
        applyPageDarken(currentSound);
      }
    };

    recognition.start();
  }
});
