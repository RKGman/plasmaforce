import Background from './background'
import ShipFactory from './ship_factory'
import * as Util from './util'
import SoundFx from './sound_fx'
import Explosion from './explosion'
import UI from './ui'
import Player from './player'

var fpsInterval;
var startTime;
var now;
var then;
var elapsed;

/**
 * Defines the functions necessary for running game operations and defining the main rendering loop.
 */
class Game {
  /**
   * Instantiates a new Game object.
   */
  constructor () {
    this.bgCanvas = document.querySelector('#background-canvas');
    this.canvas = document.querySelector('#game-canvas');
    this.UICanvas = document.querySelector('#ui-canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.bgContext = this.bgCanvas.getContext('2d');
    this.UIContext = this.UICanvas.getContext('2d');
    this.scores = { score: 0, hiScore: parseInt(window.localStorage.hiScore) };
    this.bg = new Background();
    this.ui = new UI(this);
    this.player = new Player();
    this.showTitleScreen = true;
    this.showGameOverScreen = false;
    this.paused = false;
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];
    ShipFactory.init(this);
    Util.addListeners(this);
  }

  /**
   * Initial calls to begin the main render loop and spawn ships.
   * @param {any} fps
   */
  run(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    this.render();
    ShipFactory.spawnEnemies();
  }

  /**
   * Toggles the pause flag.
   */
  pauseGame () {
    this.pause = !this.pause;
  }

  /**
   * Resets values to begin a new game and begin respawning ships.
   */
  resetGame () {
    this.player = new Player();
    this.scores.score = 0;
    this.bullets.length = 0;
    this.enemies.length = 0;
    this.explosions.length = 0;
    this.showGameOverScreen = false;
    ShipFactory.spawnEnemies();
  }

  /**
   * Defines logic for cleaning up destroyed or exhausted objects.  Calls next wave of enemies if none remain.
   */
  cleanup () {
    this.enemies = this.enemies.filter(ship => !ship.cleanup);
    this.explosions = this.explosions.filter(exp => !exp.cleanup);

    if (this.enemies.length === 0) {
      ShipFactory.spawnEnemies();
    }
  }

  /**
   * Removes bullets marked for clean up and reassigns the bullet objects for each ship in the game.
   */
  deleteBullets () {
    this.bullets = this.bullets.filter(bul => !bul.cleanup);
    this.enemies.forEach(ship => { ship.bullets = this.bullets });
  }

  /**
   * Handles the rendering, damage, and scoring for each player bullet in the game.
   */
  handlePlayerAction () {
    this.player.playerBullets.forEach(bullet => {
      bullet.render(this.canvasContext);
      this.enemies.forEach(ship => {
        if (ship.posY + ship.hitboxH >= 0 && Util.checkCollision(ship, bullet)) {
          this.handleBulletHit(bullet, ship);
          this.scores.score += 5;
          this.player.deleteBullets();
        }
      })
    })
  }

  /**
   * Handles the calling the explosion sequence, health point reduction, and checking if the game is over (player ship is destroyed).
   * @param {any} bullet
   * @param {any} ship
   */
  handleBulletHit (bullet, ship) {
    SoundFx.hit.play();
    this.explosions.push(new Explosion([bullet.posX,
      ship.constructor.name === 'Player' ? bullet.posY : bullet.posY - 20]));

    bullet.destroySelf();
    this.deleteBullets();
    ship.hp--;
    if (ship.hp <= 0) {
      ship.destroySelf();
      this.cleanup();
      SoundFx.explosion.play();
      this.explosions.push(new Explosion([bullet.posX,
        ship.constructor.name === 'Player' ? bullet.posY : bullet.posY - 20], 64));
      if (this.player.cleanup) {
        this.showGameOverScreen = true;
      }
    }
  }

  /**
   * Clears the game canvas.
   */
  clearGameCanvas () {
    this.canvasContext.clearRect(0, 0, Util.canvasWidth, Util.canvasHeight);
  }

  /**
   * The main render loop for the game responsible for each ship and its bullets.
   */
  render() {
    // Save current time
    now = Date.now();

    // If enough time has passed, draw the next frame
    elapsed = now - then;    
    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now
      then = now - (elapsed % fpsInterval);

      if (!this.pause) {
        this.bg.render(this.bgContext);
        this.clearGameCanvas();
        if (this.showTitleScreen) {
          this.renderTitleScreen(this.canvasContext);
        } else {
          this.renderGame();
        }
      }

      // Render next frame (recursive call)
      window.requestAnimationFrame(this.render.bind(this));
    }
    else {
      // Try again later (recursive call)
      window.requestAnimationFrame(this.render.bind(this));
    }    
  }

  /**
   * Renders each ship, then renders each bullet.  Also handles rendering when in a game over state. 
   */
  renderGame() {
    // Render each ship.
    this.enemies.forEach(ship => {
      ship.render(this.canvasContext);

      if (Util.checkCollision(ship, this.player) && !this.player.iframe && !this.showGameOverScreen) {
        SoundFx.explosion.play();
        this.explosions.push(new Explosion([this.player.posX + 5, this.player.posY - 10], 64));
        this.player.iframe = 10;
        this.player.hp--;

        if (this.player.hp <= 0) {
          this.showGameOverScreen = true;
        }
      }
    })

    // Render each bullet.
    this.bullets.forEach(bullet => {
      bullet.render(this.canvasContext);

      if (Util.checkCollision(bullet, this.player)) {
        if (!this.player.iframe && !this.showGameOverScreen) {
          this.handleBulletHit(bullet, this.player);
          // Give player 30 invincible frames after each bullet hit
          this.player.iframe = 30;
        }
      }
    })

    // Check if game over and render if necessary
    if (this.showGameOverScreen) {
      this.renderGameOverScreen(this.canvasContext);
    } else {
      // Otherwise, continue to handle player actions.
      this.player.render(this.canvasContext);
      this.handlePlayerAction();
    }

    // Render explosions
    this.explosions.forEach(explosion => explosion.render(this.canvasContext));
    // Render the user interface context.
    this.ui.render(this.UIContext);
  }

  /**
   * Render the starting title screen
   * @param {any} ctx
   */
  renderTitleScreen (ctx) {
    ctx.fillStyle = '#ff9e4f';
    ctx.font = '48px arcadeclassicregular';
    ctx.fillText('PlasmaForce', 80, 200);
    ctx.fillStyle = 'white';
    ctx.font = '30px arcadeclassicregular';
    ctx.fillText('press enter to start', 70, 350);
  }

  /**
   * Render the game over screen.
   * @param {any} ctx
   */
  renderGameOverScreen (ctx) {
    this.player = {};
    ctx.font = '48px arcadeclassicregular';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER', 110, 200);
    ctx.font = '30px arcadeclassicregular';
    ctx.fillText('press r to restart', 90, 350);
  }
}

export default Game
