window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');

  // 1) list of your audio files
  const audioFiles = [
    { name: 'Rain',  src: 'assets/Rain.m4a' },
    { name: 'Wind',  src: 'assets/Wind.m4a' },
    { name: 'Picnic', src: 'assets/Picnic.m4a' },
    { name: 'Bird',  src: 'assets/Bird.m4a' }
  ];
  let currentAudio = null;

  // 2) pick & play one at random, then chain to next on end
  function playRandomAudio() {
    const { name, src } = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.remove();
    }
    currentAudio = new Audio(src);
    currentAudio.play().catch(_=>{}); // may be blocked by browser policy
    currentAudio.addEventListener('play', () => applyAnimation(name));
    currentAudio.addEventListener('ended', playRandomAudio);
  }

  // 3) apply the right animation to all existing text-items
  function applyAnimation(soundName) {
    document.querySelectorAll('.text-item').forEach(el => {
      if (soundName === 'Rain') {
        el.classList.add('raindrop');
      } else if (soundName === 'Wind') {
        el.classList.add('fly-away');
      }
      // Picnic & Bird do nothing, so text stays put
      el.addEventListener('animationend', () => {
        if (el.classList.contains('raindrop') || el.classList.contains('fly-away')) {
          el.remove();
        }
      });
    });
  }

  // kick it all off
  playRandomAudio();

  // 4) create a new editable text block wherever the user clicks
  container.addEventListener('click', e => {
    const x = e.clientX, y = e.clientY;
    const box = document.createElement('div');
    box.contentEditable = true;
    box.className = 'text-item';
    box.style.left = `${x}px`;
    box.style.top  = `${y}px`;
    // let Enter finish editing
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        box.blur();
      }
    });
    container.appendChild(box);
    box.focus();
  });
});
