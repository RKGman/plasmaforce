import Game from './game.js'
import { Howl } from 'howler' 
import Scores from './scores.js'
import * as Util from './util'

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
//settings.muteBtn.addEventListener('click', () => {
//  settings.muted = !settings.muted;
//  toggleMute();
//})

window.localStorage.hiScore = window.localStorage.hiScore || 0;

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  var highScores = new Scores();

  function handleReturn(scores) {
    game.run(60, Util.menuStates.MAIN, scores);
  }

  window.onload = () => {
    game.run(60, Util.menuStates.CONNECTING, null)
    setTimeout(() => { highScores.httpGetAsync("http://localhost:5000/scores/", 10000, "2", handleReturn); }, 2000);    
  }
})
