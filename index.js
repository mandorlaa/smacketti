// =============================================
// IMMAGINI
// =============================================
const images = [
  './assets/image-content/img-01.png',
  './assets/image-content/img-02.png',
  './assets/image-content/img-03.png',
  './assets/image-content/img-04.png',
  './assets/image-content/img-05.png'
];

// Immagine "Game Over"
const GAME_OVER_IMAGE = './assets/image-content/img-06.png';

// =============================================
// AUDIO
// =============================================
// Nota: per policy dei browser, l'audio può partire solo dopo un gesto utente.
// Avviamo la musica di background al primo click su un bottone.
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
      // Se il browser blocca, riprovare dopo un'interazione successiva.
      bgStarted = false;
    }
  }
}

// =============================================
// RIFERIMENTI DOM
// =============================================
const imageContent     = document.querySelector('.image-content');
const mainButton       = document.getElementById('main-button');   // "Accarezza"
const rkoButton        = document.getElementById('rko-button');    // "RKO"
const buttonsRow       = document.getElementById('buttons-row');
const finalArea        = document.getElementById('final-area');
const finalMessageEl   = document.getElementById('final-message');
const restartButton    = document.getElementById('restart-button');
const container        = document.querySelector('.container');
const shrinkCloseIcons = document.querySelectorAll('.shrink-icon');

// =============================================
// STATO
// =============================================
let currentIndex = 0;
let accarezzamiClicks = 0;
let reachedLastOnce = false; // mostra "Muso ora è felice" solo la prima volta

// =============================================
// FUNZIONI
// =============================================
function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve; // non bloccare in caso d'errore
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

  // Audio: fermo tutto e ripristino background (ripartirà al primo click)
  stopAllAudio();
  bgStarted = false;
}

// =============================================
// INIT
// =============================================
(function init() {
  resetState();
})();

// =============================================
// AUDIO HELPERS per eventi finali
// =============================================
async function playHappy() {
  stopAllAudio();
  try { await happyAudio.play(); } catch (_) {}
}

async function playGameOver() {
  stopAllAudio();
  try { await overAudio.play(); } catch (_) {}
}

// =============================================
// HANDLER "ACCAREZZA"
// =============================================
mainButton.addEventListener('click', async () => {
  // Avvio musica di background al primo click
  await ensureBgAudio();

  accarezzamiClicks++;

  // Avanza immagine finché non sei all'ultima
  if (currentIndex < images.length - 1) {
    currentIndex++;
    await showImage(images[currentIndex]);
  }

  // Al 2° click appare RKO e i pulsanti si dispongono ai lati
  if (accarezzamiClicks === 2) {
    rkoButton.classList.remove('hidden');
    buttonsRow.classList.add('two');
  }

  // Arrivo all'ultima immagine (prima volta) → mostra "Muso ora è felice"
  if (currentIndex === images.length - 1 && !reachedLastOnce) {
    reachedLastOnce = true;
    hideButtons();
    showFinal('Muso ora è felice');
    await playHappy(); // stop bg, play happy
  } else if (currentIndex < images.length - 1) {
    hideFinal();
  }
});

// =============================================
// HANDLER "RKO"
// =============================================
rkoButton.addEventListener('click', async () => {
  // L'audio di background potrebbe non essere partito: prova ad avviarlo al bisogno (gesto utente presente)
  await ensureBgAudio();

  await showImage(GAME_OVER_IMAGE);
  hideButtons();
  showFinal('Game Over');
  await playGameOver(); // stop bg, play gameover
});

// =============================================
// HANDLER "RESTART"
// =============================================
restartButton.addEventListener('click', () => {
  resetState();
});

// =============================================
// HANDLER SHRINK / CLOSE ICON → chiudi e riapri
// =============================================
shrinkCloseIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    container.classList.add('hidden');     // fade out veloce
    setTimeout(() => {
      container.classList.remove('hidden'); // fade in
    }, 100);
  });
});
