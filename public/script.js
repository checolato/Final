window.addEventListener('DOMContentLoaded', () => {
  const container     = document.getElementById('container');
  let audioStarted    = false;
  let currentAudio    = null;
  let currentSound    = null;
  let switchTimer     = null;

  const audioFiles = [
    { name: 'Rain',   src: 'assets/Rain.m4a'   },
    { name: 'Wind',   src: 'assets/Wind.m4a'   },
    { name: 'Picnic', src: 'assets/Picnic.m4a' },
    { name: 'Bird',   src: 'assets/Bird.m4a'   }
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
    // clear any pending switch
    if (switchTimer) {
      clearTimeout(switchTimer);
      switchTimer = null;
    }

    // pick next
    const { name, src } = audioFiles[
      Math.floor(Math.random() * audioFiles.length)
    ];
    currentSound = name;

    // tear down old audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // start new
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);

    // animate when it begins
    currentAudio.addEventListener('play', () => applyAnimation(currentSound));

    // schedule cut-off after 10 seconds
    switchTimer = setTimeout(() => {
      if (currentAudio) currentAudio.pause();
      playRandomAudio();
    }, 10000);
  }

  // click → first gesture + spawn box
  container.addEventListener('click', e => {
    if (!audioStarted) {
      playRandomAudio();
      audioStarted = true;
    }

    const box = document.createElement('div');
    box.contentEditable = 'true';
    box.className      = 'text-item';
    box.style.left     = `${e.clientX}px`;
    box.style.top      = `${e.clientY}px`;

    // finish on Enter
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') ev.preventDefault(), box.blur();
    });
    // replay animation if typing ends during Rain/Wind
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
      }
    });

    container.appendChild(box);
    box.focus();
  });
});
