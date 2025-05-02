window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  let audioStarted = false;
  let currentAudio = null;
  let currentSound = null;

  // 1) Your audio files
  const audioFiles = [
    { name: 'Rain',   src: 'assets/Rain.m4a'   },
    { name: 'Wind',   src: 'assets/Wind.m4a'   },
    { name: 'Picnic', src: 'assets/Picnic.m4a' },
    { name: 'Bird',   src: 'assets/Bird.m4a'   }
  ];

  // 2) Apply the correct animation to ALL text-items
  function applyAnimation(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      if (soundName === 'Rain') {
        el.classList.add('raindrop');
      } else if (soundName === 'Wind') {
        el.classList.add('fly-away');
      }
      // remove after animation for Rain/Wind
      if (soundName === 'Rain' || soundName === 'Wind') {
        el.addEventListener('animationend', () => el.remove());
      }
    });
  }

  // 3) Play a random audio, chaining to itself on end
  function playRandomAudio() {
    const { name, src } = audioFiles[
      Math.floor(Math.random() * audioFiles.length)
    ];
    currentSound = name;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.remove();
    }
    currentAudio = new Audio(src);
    currentAudio.play().catch(console.warn);

    // animate all current boxes when this sound starts
    currentAudio.addEventListener('play', () => applyAnimation(currentSound));

    // when this file ends, pick & play another
    currentAudio.addEventListener('ended', playRandomAudio);
  }

  // 4) On click: start audio (once) & create a new text block
  container.addEventListener('click', e => {
    // first user gesture → start audio loop
    if (!audioStarted) {
      playRandomAudio();
      audioStarted = true;
    }

    // create the editable div
    const box = document.createElement('div');
    box.contentEditable = 'true';
    box.className = 'text-item';
    box.style.left = `${e.clientX}px`;
    box.style.top  = `${e.clientY}px`;

    // finish editing on Enter → blur
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        box.blur();
      }
    });

    // when you finish typing, re-apply Rain/Wind animation to all
    box.addEventListener('blur', () => {
      if (currentSound === 'Rain' || currentSound === 'Wind') {
        applyAnimation(currentSound);
      }
    });

    container.appendChild(box);
    box.focus();
  });
});
