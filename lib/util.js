import { toggleMute } from './app'

// Some global utility functions and variables necessary for the game.

export const canvasHeight = 640
export const canvasWidth = 360

export const menuStates = {
  MAIN: 'main',
  OPTIONS: 'options',
  GAME: 'game',
  SCORE_INPUT: 'score_input',
  GAMEOVER: 'gameover',
  CONNECTING: 'connecting'
}

export const menuSelections = {
  GAME: 0,
  OPTIONS: 1
}

export const difficulty = {
  LOL: 0,
  EASY: 1,
  NORMAL: 2,
  HARD: 3
}

export const menuDirections = {
  UP: 'up',
  DOWN: 'down'
}

export const genDirections = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
}

export const HTTPGETADDRESS = "http://localhost:5000/scores/";

export const HTTPPOSTADDRESS = "http://localhost:5000/scores/new/";

/**
 * A function to check if two objects are in a collision.
 * @param {any} obj1
 * @param {any} obj2
 */
export const checkCollision = (obj1, obj2) => {
  if (obj1.posY + obj1.hitboxH < obj2.posY || obj1.posY > obj2.posY + obj2.hitboxH ||
    obj1.posX + obj1.hitboxW < obj2.posX || obj1.posX > obj2.posX + obj2.hitboxW) {
    return false;
  } else {
    return true;
  }
}

/**
 * Function for adding padding to sores, if possible, for displaying purposes.
 * @param {any} num
 */
export const formatScore = (num) => {
  if (num > 999999) {
    return '999999';
  } else if (num > 99999) {
    return num;
  } else if (num > 9999) {
    return '0' + num;
  } else if (num > 999) {
    return '00' + num;
  } else if (num > 99) {
    return '000' + num;
  } else if (num > 9) {
    return '0000' + num;
  } else {
    return '00000' + num;
  }
}

/**
 * Function for adding listeners for controlling menus, pausing, other related functions.
 * @param {any} game
 */
export const addListeners = (game) => {
  document.addEventListener('keydown', e => {
    switch (e.keyCode) {
      case 13: // Enter
        toggleMute(false);
        game.processMainMenuAction = true;
        break;
      case 80: // P
        game.pauseGame();
        break;
      case 82: // R
        game.resetGame();
        break;
      case 87: // Up Arrow
      case 38:
        game.processMenuSelection(menuDirections.UP);
        break;
      case 83: // Down Arrow
      case 40:
        game.processMenuSelection(menuDirections.DOWN);
        break;
      default:
        break;
    }
  })
  document.addEventListener('mouseup', e => {
    // Check and handle click based on positions
    game.processClickSelection(e.clientX, e.clientY);
  })
  //document.addEventListener('touchend', e => {
  //  // Check and handle touchend based on positions
  //  game.processClickSelection(e.touches[0].pageX, e.touches[0].pageY);
  //})
}
