window.addEventListener('DOMContentLoaded', () => {
  const container   = document.getElementById('container');
  let audioStarted  = false;
  let currentAudio  = null;
  let currentSound  = null;
  let switchTimer   = null;
  let currentIndex  = 0;

  // 1) Your 4‐step playlist, with durations in milliseconds
  const playlist = [
    { name: 'Park', src: 'assets/Park.mp3',   duration: 20000 },
    { name: 'Rain', src: 'assets/Rain.mp3',   duration: 15000 },
    { name: 'Bird', src: 'assets/Bird.mp3',   duration: 20000 },
    { name: 'Wind', src: 'assets/Wind.mp3',   duration: 10000 }
  ];

  // 2) Animate all text‐items for Rain/Wind
  function applyAnimation(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      if (soundName === 'Rain')      el.classList.add('raindrop');
      else if (soundName === 'Wind') el.classList.add('fly-away');
      if (soundName === 'Rain' || soundName === 'Wind') {
        el.addEventListener('animationend', () => el.remove());
      }
    });
  }

  // 3) Play the currentIndex clip, then schedule the next one
  function playNext() {
    // tear down previous audio & timer
    if (switchTimer) clearTimeout(switchTimer);
    if (currentAudio)  currentAudio.pause();

    // grab the next track & duration
    const { name, src, duration } = playlist[currentIndex];
    currentSound = name;
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);

    // trigger animations on play
    currentAudio.addEventListener('play', () => applyAnimation(currentSound));

    // after `duration`, move to the next track (with wrap‐around)
    switchTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % playlist.length;
      playNext();
    }, duration);
  }

  // 4) On first click, kick off the audio loop + always spawn an editable box
  container.addEventListener('click', e => {
    if (!audioStarted) {
      playNext();
      audioStarted = true;
    }

    // spawn your text‐box exactly as before
    const box = document.createElement('div');
    box.contentEditable = 'true';
    box.className      = 'text-item';
    box.style.left     = `${e.clientX}px`;
    box.style.top      = `${e.clientY}px`;

    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        box.blur();
      }
    });
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
      }
    });

    container.appendChild(box);
    box.focus();
  });
});
