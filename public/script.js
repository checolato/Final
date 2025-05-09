window.addEventListener('DOMContentLoaded', () => {
  const socket     = io();
  const container  = document.getElementById('container');

  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;
  let switchTimer  = null;
  let currentIndex = 0;

  const playlist = [
    { name: 'Park', src: 'assets/Park.mp3',   duration: 20000 },
    { name: 'Rain', src: 'assets/Rain.mp3',   duration: 15000 },
    { name: 'Bird', src: 'assets/Bird.mp3',   duration: 20000 },
    { name: 'Wind', src: 'assets/Wind.mp3',   duration: 10000 }
  ];

  function applyAnimation(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      if (soundName === 'Rain')      el.classList.add('raindrop');
      else if (soundName === 'Wind') el.classList.add('fly-away');
      if (soundName === 'Rain' || soundName === 'Wind') {
        el.addEventListener('animationend', () => el.remove());
      }
    });
  }

  // ← new helper to toggle the darken/particulate look
  function applyAudioStyles(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      el.classList.remove('darken', 'particulate');

      if (soundName === 'Rain')      el.classList.add('darken');
      else if (soundName === 'Wind') el.classList.add('particulate');
    });
  }

  function playNext() {
    if (switchTimer) clearTimeout(switchTimer);
    if (currentAudio)  currentAudio.pause();

    const { name, src, duration } = playlist[currentIndex];
    currentSound = name;
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);

    // apply both visual effects when the clip starts
    currentAudio.addEventListener('play', () => {
      applyAnimation(currentSound);
      applyAudioStyles(currentSound);
    });

    switchTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % playlist.length;
      playNext();
    }, duration);
  }

  // ——— socket.io & box code unchanged ———
  socket.on('new-box',   data => spawnBox(data, false));
  socket.on('update-box',data => {
    const el = document.querySelector(`.text-item[data-id="${data.id}"]`);
    if (el) el.innerHTML = data.content;
  });

  container.addEventListener('click', e => {
    if (!audioStarted) { playNext(); audioStarted = true; }
    const id = Date.now() + '-' + Math.random();
    spawnBox({ x: e.clientX, y: e.clientY, id, content: '' }, true);
  });

  function spawnBox(data, emit) {
    const { x,y,id,content } = data;
    if (document.querySelector(`.text-item[data-id="${id}"]`)) return;

    const box = document.createElement('div');
    box.className       = 'text-item';
    box.setAttribute('data-id', id);
    box.style.left      = `${x}px`;
    box.style.top       = `${y}px`;
    box.contentEditable = 'true';
    box.innerHTML       = content;

    box.addEventListener('input', () => {
      socket.emit('update-box', { id, content: box.innerHTML });
    });
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') ev.preventDefault(), box.blur();
    });
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
        applyAudioStyles(currentSound);
      }
      socket.emit('update-box', { id, content: box.innerHTML });
    });

    container.appendChild(box);
    box.focus();

    if (emit) socket.emit('new-box', data);
  }
});
