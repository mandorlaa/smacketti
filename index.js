
// IMMAGINI

const images = [
  './assets/image-content/img-01.png',
  './assets/image-content/img-02.png',
  './assets/image-content/img-03.png',
  './assets/image-content/img-04.png',
  './assets/image-content/img-05.png'
];

// Immagine "Game Over"
const GAME_OVER_IMAGE = './assets/image-content/img-06.png';

// audio
const bgAudio     = new Audio('./assets/bg-song.mp3');       // loop
const happyAudio  = new Audio('./assets/happy-song.mp4');    // "Muso ora è felice"
const overAudio   = new Audio('./assets/rko-sound.mp4'); // "Game Over"
bgAudio.loop = true;
happyAudio.loop = false;
overAudio.loop = false;

function stopAllAudio() {
  [bgAudio, happyAudio, overAudio].forEach(a => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch (_) {}
  });
}

let bgStarted = false;
async function ensureBgAudio() {
  if (!bgStarted) {
    try {
      await bgAudio.play();
      bgStarted = true;
    } catch (e) {
      bgStarted = false;
    }
  }
}


const imageContent     = document.querySelector('.image-content');
const mainButton       = document.getElementById('main-button');   // "Accarezza"
const rkoButton        = document.getElementById('rko-button');    // "RKO"
const buttonsRow       = document.getElementById('buttons-row');
const finalArea        = document.getElementById('final-area');
const finalMessageEl   = document.getElementById('final-message');
const restartButton    = document.getElementById('restart-button');
const container        = document.querySelector('.container');
const shrinkCloseIcons = document.querySelectorAll('.shrink-icon');

//stato

let currentIndex = 0;
let accarezzamiClicks = 0;
let reachedLastOnce = false; 


function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve; 
  });
}

async function showImage(src) {
  imageContent.style.opacity = 0;
  await preload(src);
  imageContent.style.backgroundImage = `url('${src}')`;
  imageContent.style.opacity = 1;
}

function showFinal(text) {
  finalMessageEl.textContent = text;
  finalArea.classList.remove('hidden');
}

function hideFinal() {
  finalArea.classList.add('hidden');
}

function hideButtons() {
  buttonsRow.classList.add('hidden');
}

function showButtons() {
  buttonsRow.classList.remove('hidden');
}

function resetState() {
  // Stato
  currentIndex = 0;
  accarezzamiClicks = 0;
  reachedLastOnce = false;

  // Layout bottoni
  buttonsRow.classList.remove('two');  // solo "Accarezza" (centrato)
  rkoButton.classList.add('hidden');   // RKO nascosto
  mainButton.textContent = 'Accarezza';

  // Messaggi
  hideFinal();
  showButtons();

  // Immagine iniziale
  showImage(images[currentIndex]);

  stopAllAudio();
  bgStarted = false;
}


(function init() {
  resetState();
})();


async function playHappy() {
  stopAllAudio();
  try { await happyAudio.play(); } catch (_) {}
}

async function playGameOver() {
  stopAllAudio();
  try { await overAudio.play(); } catch (_) {}
}

mainButton.addEventListener('click', async () => {
  await ensureBgAudio();

  accarezzamiClicks++;

  if (currentIndex < images.length - 1) {
    currentIndex++;
    await showImage(images[currentIndex]);
  }

  if (accarezzamiClicks === 2) {
    rkoButton.classList.remove('hidden');
    buttonsRow.classList.add('two');
  }

  if (currentIndex === images.length - 1 && !reachedLastOnce) {
    reachedLastOnce = true;
    hideButtons();
    showFinal('Muso ora è felice');
    await playHappy(); 
  } else if (currentIndex < images.length - 1) {
    hideFinal();
  }
});

rkoButton.addEventListener('click', async () => {
  await ensureBgAudio();

  await showImage(GAME_OVER_IMAGE);
  hideButtons();
  showFinal('Game Over');
  await playGameOver(); 
});

restartButton.addEventListener('click', () => {
  resetState();
});


shrinkCloseIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    container.classList.add('hidden');     // fade out 
    setTimeout(() => {
      container.classList.remove('hidden'); // fade in
    }, 100);
  });
});
