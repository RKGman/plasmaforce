import Background from './background'
import ShipFactory from './ship_factory'
import * as Util from './util'
import SoundFx from './sound_fx'
import Explosion from './explosion'
import UI from './ui'
import Player from './player'
import Scores from './scores.js'

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

const INITIAL_PLUS_MIN_POSY = 315;
const INITIAL_PLUS_MAX_POSY = 370;

const INITIAL_MINUS_MIN_POSY = 410;
const INITIAL_MINUS_MAX_POSY = 460;

const SUBMIT_SCORE_MIN_POSY = 520;
const SUBMIT_SCORE_MAX_POSY = 560;

const SELECTABLE_LETTERS = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];

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
    this.isSecondGOClick = 0;
    this.loadingState = 0;
    this.renderLoadingTrackerTick = 0;
    this.highScores = null;
    this.initial1 = 0;
    this.initial2 = 0;
    this.initial3 = 0;
    this.scoreRefresh = true;
    this.cRect = document.getElementById('c-container').getBoundingClientRect();
    this.scaleValue = this.cRect.width / Util.canvasWidth;
    Util.addListeners(this);
  }

  /**
   * Initial calls to begin the main render loop and spawn ships.
   * @param {any} fps
   */
  run(fps, startState, hScores) {
    if (startState == Util.menuStates.CONNECTING) {
      this.mmState = Util.menuStates.CONNECTING;
    } else {
      this.mmState = Util.menuStates.MAIN;
      this.highScores = hScores;
    }
    
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    this.render();
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
    this.scoreRefresh = true;
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
        this.mmState = Util.menuStates.SCORE_INPUT;
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
  processClickSelection(clickX, clickY) {
    if (this.mmState != Util.menuStates.GAME) {
      var rect = document.getElementById('c-container').getBoundingClientRect();
      var canvasX = Math.floor(clickX - rect.left);
      var canvasY = Math.floor((clickY - rect.top) * (Util.canvasHeight / document.getElementById('m-container').offsetHeight));

      if (this.mmState == Util.menuStates.MAIN) {
        // Handle click on main menu
        this.handleMainMenuClickEvent(canvasY);
      } else if (this.mmState == Util.menuStates.OPTIONS) {
        // Handle click on options menu
        this.handleOptionsMenuClickEvent(canvasY);
      } else if (this.mmState == Util.menuStates.SCORE_INPUT) {
        // Handle clock on score input
        this.handleScoreMenuClickEvent(canvasX, canvasY);
      } else if (this.mmState == Util.menuStates.GAMEOVER && this.isSecondGOClick == 1) {
        this.mmState = Util.menuStates.MAIN;
        this.isSecondGOClick = 0;
      } else if (this.mmState == Util.menuStates.GAMEOVER) {
        this.isSecondGOClick++;
        // Ignore first click...
      }
    }
  }

  /**
   * Attempts to increment the position of the allowed chars... Loops around if necessary.
   * @param {any} initialNumber
   */
  getNextLetterPosition(initialNumber) {
    initialNumber++;
    if (initialNumber > SELECTABLE_LETTERS.length - 1) {
      initialNumber = 0;
    }

    return initialNumber;
  }

/**
 * Attempts to decrement the position of the allowed chars... Loops around if necessary.
 * @param {any} initialNumber
 */
  getPreviousLetterPosition(initialNumber) {
    initialNumber--;
    if (initialNumber < 0) {
      initialNumber = SELECTABLE_LETTERS.length - 1;
    }

    return initialNumber;
  }

  /**
   * Handles score entry button clicks...
   * @param {any} clickX
   * @param {any} clickY
   */
  handleScoreMenuClickEvent(clickX, clickY) {

    var leftButtonColumn = Math.floor(this.cRect.width / 3);
    var middleButtonColumn = Math.floor(this.cRect.width / 2);
    var rightButtonColumn = Math.floor(this.cRect.width * 2 / 3);    

    var maxLeftButton = ((leftButtonColumn + middleButtonColumn) / 2);
    var maxMiddleButton = ((middleButtonColumn + rightButtonColumn) / 2);

    if (clickY >= SUBMIT_SCORE_MIN_POSY && clickY <= SUBMIT_SCORE_MAX_POSY) {
      // Handle submit button click...
      console.log("Submitting score...");
      this.submitScore();
    }  

    if (clickY >= INITIAL_MINUS_MIN_POSY && clickY <= INITIAL_MINUS_MAX_POSY) {
      // We have a potential minus sign hit...
      if (clickX >= maxMiddleButton) {
        // Handle right initial plus button click...
        this.initial3 = this.getPreviousLetterPosition(this.initial3);
      } else if (clickX > maxLeftButton && clickX < maxMiddleButton) {
        // Handle middle initial plus button click...
        this.initial2 = this.getPreviousLetterPosition(this.initial2);
      } else if (clickX <= maxLeftButton) {
        // Handle left initial plus button click...
        this.initial1 = this.getPreviousLetterPosition(this.initial1);
      }
    }

    if (clickY >= INITIAL_PLUS_MIN_POSY && clickY <= INITIAL_PLUS_MAX_POSY) {
      // We have a potential plus sign hit...
      if (clickX >= maxMiddleButton) {
        // Handle right initial plus button click...
        this.initial3 = this.getNextLetterPosition(this.initial3);
      } else if (clickX > maxLeftButton && clickX < maxMiddleButton) {
        // Handle middle initial plus button click...
        this.initial2 = this.getNextLetterPosition(this.initial2);
      } else if (clickX <= maxLeftButton * this.scaleValue) {
        // Handle left initial plus button click...
        this.initial1 = this.getNextLetterPosition(this.initial1);
      } 
    }
  }

  /**
   * Calls function to get most recent scores given current difficulty...
   */
  getUpdatedScores() {
    this.mmState = Util.menuStates.CONNECTING;
    var scoreClient = new Scores();
    var receivedScores = null;

    function callback(newScores) {
      receivedScores = newScores;
    }

    scoreClient.httpGetAsync(Util.HTTPGETADDRESS, 10000, String(this.difficulty),
      (function callbackCloser(test) {
        //console.log(test);
        return callback;
      })(this.difficulty)
    );

    setTimeout(() => {
      this.highScores = receivedScores;
      this.scoreRefresh = false; // Only update the first time...
      this.mmState = Util.menuStates.SCORE_INPUT;
    }, 4000);   
  }

  /**
   * Calls function to execute the submission of the high score... 
   */
  submitScore() {
    this.mmState = Util.menuStates.CONNECTING;
    var scoreClient = new Scores();
    var sInitials = SELECTABLE_LETTERS[this.initial1] + SELECTABLE_LETTERS[this.initial2] + SELECTABLE_LETTERS[this.initial3];
    var receivedScores = null;


    function callback(newScores) {
      receivedScores = newScores;
    }

    scoreClient.httpPostAsync(Util.HTTPPOSTADDRESS, 10000, sInitials, this.scores.score, String(this.difficulty),
      (function callbackCloser(test) {
        //console.log(test);
        return callback;
      })(this.scores.score)
    );

    setTimeout(() => {
      this.highScores = receivedScores;
      this.mmState = Util.menuStates.GAMEOVER;
    }, 8000);    
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
        } else if (this.mmState == Util.menuStates.SCORE_INPUT){
          this.renderScoreScreen(this.canvasContext);
        } else if (this.mmState == Util.menuStates.GAMEOVER) {
          this.renderGameOverScreen(this.canvasContext);
        } else if (this.mmState == Util.menuStates.CONNECTING) {
          this.renderLoadingScreen(this.canvasContext);
          this.renderLoadingTrackerTick++;
          if (this.renderLoadingTrackerTick > 60) {
            this.renderLoadingTrackerTick = 0;
          }
          
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
          this.mmState = Util.menuStates.SCORE_INPUT;
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
      //this.renderGameOverScreen(this.canvasContext);
      this.mmState = Util.menuStates.SCORE_INPUT;
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
    ctx.fillStyle = '#32cd32';
    ctx.font = '48px arcadeclassicregular';
    ctx.fillText('PlasmaPulse', 35, 200);
    ctx.fillText('(ALPHA)', 90, 250);
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
   * Helper function for loading score entry screen.
   * @param {any} ctx
   */
  renderScoreEntryScreen(ctx) {
    ctx.font = '30px arcadeclassicregular';
    ctx.fillStyle = '#32cd32';
    ctx.fillText("NEW HIGH SCORE!", 60, 100);
    ctx.fillText(Util.formatScore(this.scores.score), 130, 150);    
    ctx.font = '30px arcadeclassicregular';
    ctx.fillStyle = 'white';
    ctx.fillText('Enter initials', 64, 250);
    ctx.fillText("+", Util.canvasWidth / 3, 350);
    ctx.fillText("+", Util.canvasWidth / 2, 350);
    ctx.fillText("+", Util.canvasWidth * 2 / 3, 350);
    ctx.fillText(SELECTABLE_LETTERS[this.initial1], Util.canvasWidth / 3, 400);
    ctx.fillText(SELECTABLE_LETTERS[this.initial2], Util.canvasWidth / 2, 400);
    ctx.fillText(SELECTABLE_LETTERS[this.initial3], Util.canvasWidth * 2 / 3, 400);
    ctx.fillText("_", Util.canvasWidth / 3, 430);
    ctx.fillText("_", Util.canvasWidth / 2, 430);
    ctx.fillText("_", Util.canvasWidth * 2 / 3, 430);
    ctx.fillText("[> Submit <]", 100, 550)

  }

  /**
   * Check for new high score and display input screen.  
   * @param {any} ctx
   */
  renderScoreScreen(ctx) {
    if (this.scoreRefresh == true) {
      this.getUpdatedScores();      
    }

    if (this.highScores == null) {
      this.mmState = Util.menuStates.GAMEOVER;
    } else {
      //if (this.highScores[this].fields['score'] )
      if (this.highScores.length == 0 || this.highScores.length < 10) {
        // Enter new high score
        this.renderScoreEntryScreen(ctx);
      } else if (parseInt(this.scores.score) > parseInt(this.highScores[this.highScores.length - 1].fields['score'])) {
        // Enter new high score
        this.renderScoreEntryScreen(ctx);
      } else {
        this.mmState = Util.menuStates.GAMEOVER;
      }
    }
  }

  /**
   * Converts difficulty value to string for display... 
   */
  getDifficultyString() {
    var difficultyText = "L0L Y0U CH34T M8? H4X0R!";
    if (this.difficulty == Util.difficulty.EASY) {
      difficultyText = "Easy";
    } else if (this.difficulty == Util.difficulty.NORMAL) {
      difficultyText = "Normal";
    } else if (this.difficulty == Util.difficulty.HARD) {
      difficultyText - "Hard";
    } 

    return difficultyText;
  }

  /**
   * Render the game over screen. Show high scores if any were pulled from database.
   * @param {any} ctx
   */
  renderGameOverScreen(ctx) {
    this.player.hp = 0;
    ctx.font = '48px arcadeclassicregular';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 60, 100);
    ctx.font = '22px arcadeclassicregular';
    ctx.fillStyle = 'white';
    ctx.fillText("(Difficulty Level: " + this.difficulty + ")", 60, 150);
    ctx.font = '24px arcadeclassicregular';
    ctx.fillStyle = 'yellow';
    ctx.fillText('--- High Scores ---', 66, 180);
    ctx.font = '20px arcadeclassicregular';
    ctx.fillStyle = 'white';

    if (this.highScores == null) {
      ctx.fillText(">Connection Error<", 80, 200);
    }
    else {
      var i;
      var startingRowPos = 210;
      for (i = 0; i < this.highScores.length; i++) {
        ctx.fillText((i + 1) + ". - " + this.highScores[i].fields['initials'] + " - " + this.highScores[i].fields['score'], 100, startingRowPos);
        startingRowPos += 40;
      }
    }    
  }

  /**
   * Renders a loading screen for waiting to connect to database... and stuff.
   * @param {any} ctx
   */
  renderLoadingScreen(ctx) {
    if (this.showGameOverScreen == true) {
      ctx.font = '48px arcadeclassicregular';
      ctx.fillStyle = 'red';
      ctx.fillText('GAME OVER', 60, 100);
      ctx.font = '22px arcadeclassicregular';
    }

    ctx.font = '48px arcadeclassicregular';
    ctx.fillStyle = 'yellow';
    if (this.loadingState == 0) {
      ctx.fillText('LOADING.', 66, 280);
      if (this.renderLoadingTrackerTick == 20) {
        this.loadingState++;
      }
    } else if (this.loadingState == 1) {
      ctx.fillText('LOADING..', 66, 280);
      if (this.renderLoadingTrackerTick == 40) {
        this.loadingState++;
      }
    } else if (this.loadingState == 2) {
      ctx.fillText('LOADING...', 66, 280);
      if (this.renderLoadingTrackerTick == 60) {
        this.loadingState++;
      }
    } else {
      ctx.fillText('LOADING....', 66, 280);
      if (this.renderLoadingTrackerTick == 60) {
        this.loadingState++;
      }

      if (this.loadingState > 3) {
        this.loadingState = 0;
      }
    }          
  }
}

export default Game
