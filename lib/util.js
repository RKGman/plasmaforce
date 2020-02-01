import { toggleMute } from './app'

// Some global utility functions and variables necessary for the game.

export const canvasHeight = 700
export const canvasWidth = 450

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
      case 13:
        toggleMute(false);
        game.showTitleScreen = false;
        break;
      case 80:
        game.pauseGame();
        break;
      case 82:
        game.resetGame();
        break;
      default:
        break;
    }
  })
}
