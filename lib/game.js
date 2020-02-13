import Background from './background'
import ShipFactory from './ship_factory'
import * as Util from './util'
import SoundFx from './sound_fx'
import Explosion from './explosion'
import UI from './ui'
import Player from './player'

const ENGAGE_MIN_POS = 320;
const ENGAGE_MAX_POS = 360;
const OPTIONS_MIN_POS = 375;
const OPTIONS_MAX_POS = 415;
const EASY_MIN_POS = 275;
const EASY_MAX_POS = 315;
const NORMAL_MIN_POS = 325;
const NORMAL_MAX_POS = 365;
const HARD_MIN_POS = 375;
const HARD_MAX_POS = 415;

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
  constructor() {
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
    this.processMainMenuAction = false;
    this.mmState = Util.menuStates.MAIN;
    this.mmSelection = Util.menuSelections.GAME;
    this.difficulty = Util.difficulty.NORMAL;
    this.showGameOverScreen = false;
    this.paused = false;
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];
    this.needRestart = false;
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
    //ShipFactory.spawnEnemies();
  }

  /**
   * Toggles the pause flag.
   */
  pauseGame() {
    this.pause = !this.pause;
  }

  /**
   * Resets values to begin a new game and begin respawning ships.
   */
  resetGame() {
    this.player = {};
    this.player = new Player();
    this.scores.score = 0;
    this.bullets.length = 0;
    this.enemies.length = 0;
    this.explosions.length = 0;
    this.showGameOverScreen = false;
    this.needRestart = false;
    ShipFactory.spawnEnemies();
  }

  /**
   * Defines logic for cleaning up destroyed or exhausted objects.  Calls next wave of enemies if none remain.
   */
  cleanup() {
    this.enemies = this.enemies.filter(ship => !ship.cleanup);
    this.explosions = this.explosions.filter(exp => !exp.cleanup);

    if (this.enemies.length === 0) {
      ShipFactory.spawnEnemies();
    }
  }

  /**
   * Removes bullets marked for clean up and reassigns the bullet objects for each ship in the game.
   */
  deleteBullets() {
    this.bullets = this.bullets.filter(bul => !bul.cleanup);
    this.enemies.forEach(ship => { ship.bullets = this.bullets });
  }

  /**
   * Handles the rendering, damage, and scoring for each player bullet in the game.
   */
  handlePlayerAction() {
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
  handleBulletHit(bullet, ship) {
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
        this.mmState = Util.menuStates.GAMEOVER;
        this.needRestart = true;
      }
    }
  }

  /**
   * Clears the game canvas.
   */
  clearGameCanvas() {
    this.canvasContext.clearRect(0, 0, Util.canvasWidth, Util.canvasHeight);
  }

  /**
   * Process a menu selection
   */
  processMenuSelection(mDirection) {
    switch (mDirection) {
      case Util.menuDirections.UP:
        if (this.mmState == Util.menuStates.MAIN) {
          if (this.mmSelection != Util.menuSelections.GAME) {
            this.mmSelection = this.mmSelection - 1;
          }
        } else if (this.mmState == Util.menuStates.OPTIONS) {
          if (this.difficulty != Util.difficulty.EASY) {
            this.difficulty = this.difficulty - 1;
          }
        }
        break;
      case Util.menuDirections.DOWN:
        if (this.mmState == Util.menuStates.MAIN) {
          if (this.mmSelection != Util.menuSelections.OPTIONS) {
            this.mmSelection = this.mmSelection + 1;
          }
        } else if (this.mmState == Util.menuStates.OPTIONS) {
          if (this.difficulty != Util.difficulty.HARD) {
            this.difficulty = this.difficulty + 1;
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * 
   * @param {any} clickX
   * @param {any} clickY
   */
  processClickSelection(clickY) {
    if (this.mmState == Util.menuStates.GAMEOVER) {
      this.mmState = Util.menuStates.MAIN;
    }

    if (this.mmState != Util.menuStates.GAME) {
      var rect = document.getElementById('c-container').getBoundingClientRect();
      var canvasY = Math.floor((clickY - rect.top) * (Util.canvasHeight / document.getElementById('m-container').offsetHeight));

      if (this.mmState == Util.menuStates.MAIN) {
        // Handle click on main menu
        this.handleMainMenuClickEvent(canvasY);
      } else {
        // Handle click on options menu
        this.handleOptionsMenuClickEvent(canvasY);
      }
    }
  }

  /**
   * Handles options menu mouse and touch click logic.
   * @param {any} clickY
   */
  handleOptionsMenuClickEvent(clickY) {
    if (clickY >= EASY_MIN_POS && clickY <= EASY_MAX_POS && this.difficulty == Util.difficulty.EASY) {
      // Make easy selection
      this.processMenuAction();
    } else if (clickY >= EASY_MIN_POS && clickY <= EASY_MAX_POS && this.difficulty == Util.difficulty.NORMAL) {
      // Move towards easy selection
      this.processMenuSelection(Util.menuDirections.UP);
    } else if (clickY >= EASY_MIN_POS && clickY <= EASY_MAX_POS && this.difficulty == Util.difficulty.HARD) {
      // Move towards easy selection from hard
      this.processMenuSelection(Util.menuDirections.UP);
      this.processMenuSelection(Util.menuDirections.UP);
    } else if (clickY >= NORMAL_MIN_POS && clickY <= NORMAL_MAX_POS && this.difficulty == Util.difficulty.NORMAL) {
      // Make normal selection
      this.processMenuAction();
    } else if (clickY >= NORMAL_MIN_POS && clickY <= NORMAL_MAX_POS && this.difficulty == Util.difficulty.EASY) {
      // Move towards normal selection
      this.processMenuSelection(Util.menuDirections.DOWN);
    } else if (clickY >= NORMAL_MIN_POS && clickY <= NORMAL_MAX_POS && this.difficulty == Util.difficulty.HARD) {
      // Move towards normal selection
      this.processMenuSelection(Util.menuDirections.UP);
    } else if (clickY >= HARD_MIN_POS && clickY <= HARD_MAX_POS && this.difficulty == Util.difficulty.HARD) {
      // Make hard selection
      this.processMenuAction();
    } else if (clickY >= HARD_MIN_POS && clickY <= HARD_MAX_POS && this.difficulty == Util.difficulty.NORMAL) {
      // Move towards hard selection
      this.processMenuSelection(Util.menuDirections.DOWN);
    } else if (clickY >= HARD_MIN_POS && clickY <= HARD_MAX_POS && this.difficulty == Util.difficulty.EASY) {
      // Move towards hard selection from easy
      this.processMenuSelection(Util.menuDirections.DOWN);
      this.processMenuSelection(Util.menuDirections.DOWN);
    }
  }

  /**
   * Handles main menu mouse and touch click logic.
   * @param {any} clickY
   */
  handleMainMenuClickEvent(clickY) {
    if (clickY >= ENGAGE_MIN_POS && clickY <= ENGAGE_MAX_POS && this.mmSelection == Util.menuSelections.GAME) {
      // Begin game
      this.processMenuAction();
    } else if (clickY >= ENGAGE_MIN_POS && clickY <= ENGAGE_MAX_POS && this.mmSelection == Util.menuSelections.OPTIONS) {
      // Move selection to engage
      this.processMenuSelection(Util.menuDirections.UP);
    } else if (clickY >= OPTIONS_MIN_POS && clickY <= OPTIONS_MAX_POS && this.mmSelection == Util.menuSelections.OPTIONS) {
      // Enter options menu
      this.processMenuAction();
    } else if (clickY >= OPTIONS_MIN_POS && clickY <= OPTIONS_MAX_POS && this.mmSelection == Util.menuSelections.GAME) {
      // Move selection to options
      this.processMenuSelection(Util.menuDirections.DOWN);
    }
  }

  /**
   * Processes a menu action
   */
  processMenuAction() {
    switch (this.mmState) {
      case Util.menuStates.MAIN:
        if (this.mmSelection == Util.menuSelections.GAME) {
          ShipFactory.init(this);
          ShipFactory.spawnEnemies();
          this.mmState = Util.menuStates.GAME;
        } else if (this.mmSelection == Util.menuSelections.OPTIONS) {
          this.mmState = Util.menuStates.OPTIONS;
        }
        break;
      case Util.menuStates.OPTIONS:
        // Difficulty should be set.  Show main menu now...
        this.mmState = Util.menuStates.MAIN;
        break;
      case Util.menuStates.GAME:
        break;
      case Util.menuStates.GAMEOVER:
        this.mmState = Util.menuStates.MAIN;
        break;
      default:
        break;
    }
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
        if (this.processMainMenuAction == true) {
          this.processMenuAction();
          this.processMainMenuAction = false;
        }

        if (this.mmState == Util.menuStates.GAME) {
          if (this.needRestart == true) {
            this.resetGame();
          }

          this.renderGame();
        } else if (this.mmState == Util.menuStates.OPTIONS) {
          this.renderOptionsScreen(this.canvasContext);
        } else if (this.mmState == Util.menuStates.GAMEOVER) {
          this.renderGameOverScreen(this.canvasContext)
        } else { // Continue to render main menu
          this.renderTitleScreen(this.canvasContext);
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
          this.mmState = Util.menuStates.GAMEOVER;
          this.needRestart = true;
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
  renderTitleScreen(ctx) {
    ctx.fillStyle = '#ff9e4f';
    ctx.font = '48px arcadeclassicregular';
    ctx.fillText('PlasmaForce', 40, 200);
    ctx.fillText('V2', 160, 240);
    ctx.fillStyle = 'white';
    ctx.font = '30px arcadeclassicregular';
    if (this.mmSelection == Util.menuSelections.GAME) {
      ctx.fillText('Engage<', 125, 350);
      ctx.fillText('Options', 125, 400);
    } else {
      ctx.fillText('Engage', 125, 350);
      ctx.fillText('Options<', 125, 400);
    }


  }

  /**
   * Shows options for specifying difficulty setting.
   * @param {any} ctx
   */
  renderOptionsScreen(ctx) {
    this.clearGameCanvas();
    ctx.fillStyle = 'white';
    ctx.font = '50px arcadeclassicregular';
    ctx.fillText('Difficulty', 55, 200);
    ctx.fillStyle = 'white';
    ctx.font = '30px arcadeclassicregular';
    if (this.difficulty == Util.difficulty.EASY) {
      ctx.fillText('Easy<', 75, 300);
      ctx.fillText('Normal', 75, 350);
      ctx.fillText('Hard', 75, 400);
    } else if (this.difficulty == Util.difficulty.NORMAL) {
      ctx.fillText('Easy', 75, 300);
      ctx.fillText('Normal<', 75, 350);
      ctx.fillText('Hard', 75, 400);
    } else {
      ctx.fillText('Easy', 75, 300);
      ctx.fillText('Normal', 75, 350);
      ctx.fillText('Hard<', 75, 400);
    }

  }

  /**
   * Render the game over screen.
   * @param {any} ctx
   */
  renderGameOverScreen(ctx) {
    this.player.hp = 0;
    ctx.font = '48px arcadeclassicregular';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER', 70, 280);
    ctx.font = '30px arcadeclassicregular';
  }
}

export default Game
