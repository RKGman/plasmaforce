import * as Util from './util'

/**
 * Defines the UI class for interfacing game data and ship information to the user.
 */
class UI {
  /**
   * Initializes a new instance of the UI object.
   * @param {any} game
   */
  constructor (game) {
    this.game = game;
    this.scores = game.scores;
    this.tick = 0;
  }

  /**
   * Renders the relavent information for the user interface to the context object.
   * @param {any} ctx
   */
  render (ctx) {
    if (this.tick % 4 === 0) {
      ctx.clearRect(0, 0, Util.canvasWidth, 50);
      ctx.fillStyle = 'white';
      ctx.font = '24px arcadeclassicregular';
      ctx.fillText(`SCORE: ${Util.formatScore(this.scores.score)}`, 140, 30);
      ctx.fillText(`HI: ${Util.formatScore(this.scores.hiScore)}`, 320, 30);

      ctx.fillText('HP', 10, 30);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(45, 14, 81, 18);
      ctx.fillStyle = 'red';
      ctx.fillRect(45, 15, (this.game.player.hp * 8), 16);

      if (this.scores.score > this.scores.hiScore) {
        window.localStorage.hiScore = this.scores.score;
        this.scores.hiScore = this.scores.score;
      }

      this.tick > 300 && (this.tick = 0);
    }

    this.tick++;
  }
}

export default UI
