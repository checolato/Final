window.addEventListener('DOMContentLoaded', () => {
  const socket     = io();              // ← connect to your server!
  const container  = document.getElementById('container');
  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;

  const audioFiles = [
    { name: 'Rain',   src: 'assets/Rain.mp3'   },
    { name: 'Wind',   src: 'assets/Wind.mp3'   },
    { name: 'Picnic', src: 'assets/Park.mp3' },
    { name: 'Bird',   src: 'assets/Bird.mp3'   }
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

  function playRandomAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    const { name, src } = audioFiles[
      Math.floor(Math.random() * audioFiles.length)
    ];
    currentSound = name;
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);
    currentAudio.addEventListener('play', () => applyAnimation(currentSound));
    currentAudio.addEventListener('ended', playRandomAudio);
  }

  // When *other* clients create/update boxes:
  socket.on('new-box', data   => spawnBox(data, false));
  socket.on('update-box', data=> {
    const el = document.querySelector(`.text-item[data-id="${data.id}"]`);
    if (el) el.innerHTML = data.content;
  });

  // Local click → start audio (on first click) + spawn & broadcast
  container.addEventListener('click', e => {
    if (!audioStarted) { playRandomAudio(); audioStarted = true; }
    const id = Date.now() + '-' + Math.random();
    spawnBox({ x: e.clientX, y: e.clientY, id, content: '' }, true);
  });

  function spawnBox(data, emit) {
    const { x,y,id,content } = data;
    // avoid duplicate if it already exists
    if (document.querySelector(`.text-item[data-id="${id}"]`)) return;

    const box = document.createElement('div');
    box.className      = 'text-item';
    box.setAttribute('data-id', id);
    box.style.left     = `${x}px`;
    box.style.top      = `${y}px`;
    box.contentEditable= 'true';
    box.innerHTML      = content;

    // broadcast updates as the user types
    box.addEventListener('input', () => {
      const payload = { id, content: box.innerHTML };
      socket.emit('update-box', payload);
    });
    // finish on Enter
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        box.blur();
      }
    });
    // on blur, re-animate if needed and re-broadcast
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
      }
      socket.emit('update-box', { id, content: box.innerHTML });
    });

    container.appendChild(box);
    box.focus();

    // if this creation came from *this* client, notify others
    if (emit) socket.emit('new-box', data);
  }
});
