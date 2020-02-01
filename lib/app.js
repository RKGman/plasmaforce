import Game from './game.js'
import { Howl } from 'howler' 

const settings = {
  muted: true,
  muteBtn: document.querySelector('#mute-control')
}

Howler.mute(settings.muted);

const bgMusic = new Howl({
  autoplay: true,
  loop: true,
  src: './assets/music/bensound-scifi.mp3'
})

bgMusic.play();

/**
 * Toggles the mute setting.
 * @param {any} bool
 */
export const toggleMute = (bool = settings.muted) => {
  Howler.mute(bool);
}

// Add event handler for muting.
settings.muteBtn.addEventListener('click', () => {
  settings.muted = !settings.muted;
  toggleMute();
})

window.localStorage.hiScore = window.localStorage.hiScore || 0

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.onload = () => {
    game.run(60);
  }
})
