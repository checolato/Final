window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  const webcam = document.getElementById('webcam');
  const canvas = document.getElementById('motion-canvas');
  const ctx = canvas.getContext('2d');

  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;
  let switchTimer = null;
  let currentIndex = 0;
  let lastFrame = null;
  let lastSpawn = 0;

  const playlist = [
    { name: 'Park', src: 'assets/Park.mp3', duration: 20000 },
    { name: 'Rain', src: 'assets/Rain.mp3', duration: 15000 },
    { name: 'Bird', src: 'assets/Bird.mp3', duration: 20000 },
    { name: 'Wind', src: 'assets/Wind.mp3', duration: 10000 }
  ];

  // Start webcam
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    webcam.srcObject = stream;
    detectMotion();
  }).catch(err => {
    alert("Camera or microphone access denied.");
    console.error(err);
  });

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

  function spawnBox(x, y) {
    const id = Date.now() + '-' + Math.random();
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
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interim += transcript;
      }
      box.innerHTML = finalTranscript + '<span style="opacity:0.6">' + interim + '</span>';
    };

    recognition.onerror = (e) => {
  if (e.error === 'aborted' || e.error === 'no-speech') {
    box.innerHTML = ''; // Just keep it blank
  } else {
    box.innerHTML = 'Error: ' + e.error;
  }
    };


    recognition.onend = () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
        applyPageDarken(currentSound);
      }
    };

    recognition.start();
  }

  function detectMotion() {
  ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (lastFrame) {
    let diff = 0;
    for (let i = 0; i < current.data.length; i += 4) {
      const avgCurr = (current.data[i] + current.data[i + 1] + current.data[i + 2]) / 3;
      const avgLast = (lastFrame.data[i] + lastFrame.data[i + 1] + lastFrame.data[i + 2]) / 3;
      diff += Math.abs(avgCurr - avgLast);
    }

    const now = Date.now();
    if (diff > 1000000 && now - lastSpawn > 3000) {
      if (!audioStarted) {
        playNext();
        audioStarted = true;
      }

      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = 100 + Math.random() * (window.innerHeight - 200);
      spawnBox(x, y);
      lastSpawn = now;
    }
  }

  lastFrame = current;
  requestAnimationFrame(detectMotion);
}
});
