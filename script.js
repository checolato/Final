window.addEventListener('load', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Sorry, your browser does not support SpeechRecognition.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;      // keep listening until the page unloads
  recognition.interimResults = false; // only final transcripts
  recognition.lang = 'en-US';         // set your language

  const container = document.getElementById('container');

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript.trim();
        spawnWords(transcript);
      }
    }
  };

  recognition.onerror = (err) => {
    console.error('Speech recognition error:', err);
  };

  // start listening immediately
  recognition.start();

  function spawnWords(text) {
    const words = text.split(/\s+/);
    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;

      // pick a random position inside the viewport
      const maxX = window.innerWidth  - 100; // leave some room
      const maxY = window.innerHeight -  30;
      span.style.left = `${Math.random() * maxX}px`;
      span.style.top  = `${Math.random() * maxY}px`;

      container.appendChild(span);
    });
  }
});
