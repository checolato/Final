window.addEventListener('DOMContentLoaded', () => {
  // —— Socket.IO setup ——
  const socket     = io();             
  const container  = document.getElementById('container');

  // —— Audio playlist setup ——
  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;
  let switchTimer  = null;
  let currentIndex = 0;

  const playlist = [
    { name: 'Park', src: 'assets/Park.mp3',   duration: 20000 },
    { name: 'Rain', src: 'assets/Rain.m4a',   duration: 15000 },
    { name: 'Bird', src: 'assets/Bird.m4a',   duration: 20000 },
    { name: 'Wind', src: 'assets/Wind.m4a',   duration: 10000 }
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

  function playNext() {
    if (switchTimer) clearTimeout(switchTimer);
    if (currentAudio)  currentAudio.pause();

    const { name, src, duration } = playlist[currentIndex];
    currentSound = name;
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);
    currentAudio.addEventListener('play', () => applyAnimation(currentSound));

    switchTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % playlist.length;
      playNext();
    }, duration);
  }

  // —— Real-time events from other clients ——
  socket.on('new-box', data => spawnBox(data, false));
  socket.on('update-box', data => {
    const el = document.querySelector(`.text-item[data-id="${data.id}"]`);
    if (el) el.innerHTML = data.content;
  });

  // —— Click spawns a box locally & broadcasts it ——
  container.addEventListener('click', e => {
    if (!audioStarted) {
      playNext();
      audioStarted = true;
    }

    const id = Date.now() + '-' + Math.random();
    spawnBox({ x: e.clientX, y: e.clientY, id, content: '' }, true);
  });

  // —— Box creation / broadcast function ——
  function spawnBox(data, emit) {
    const { x, y, id, content } = data;
    // avoid duplicates
    if (document.querySelector(`.text-item[data-id="${id}"]`)) return;

    const box = document.createElement('div');
    box.className       = 'text-item';
    box.setAttribute('data-id', id);
    box.style.left      = `${x}px`;
    box.style.top       = `${y}px`;
    box.contentEditable = 'true';
    box.innerHTML       = content;

    // broadcast on each input
    box.addEventListener('input', () => {
      socket.emit('update-box', { id, content: box.innerHTML });
    });
    // finish on Enter
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        box.blur();
      }
    });
    // re-apply animation on blur if needed + final broadcast
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
      }
      socket.emit('update-box', { id, content: box.innerHTML });
    });

    container.appendChild(box);
    box.focus();

    // let others know about this new box
    if (emit) socket.emit('new-box', data);
  }
});
