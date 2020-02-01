import {canvasHeight, canvasWidth} from './util'
import MovingObject from './moving_object'

/**
 * Defines a Bullet object, a child of a MovingObject.  This ia base class to generalize specific bullet types.
 */
export class Bullet extends MovingObject {
  /**
   * Initializes a new instance of the Bullet object.
   * @param {any} props
   */
  constructor (props) {
    super(props);
    this.sprite = this.images.beams;
  }

  /**
   * Describes how the bullet moves.
   */
  move () {
    this.posX += this.speedX;
    this.posY += this.speedY;
    if (this.posX < 0 || this.posX > canvasWidth || this.posY < 0 || this.posY > canvasHeight) {
      this.destroySelf();
    }
  }

  /**
   * Sets the flag to indicate that the bullet should be removed from the game.
   */
  destroySelf () {
    // Mark this bullet for cleanup so that the game's cleanup function can delete it!
    this.cleanup = true
  }
}

/**
 * Describes the playey's ship bullet type, a child of the Bullet object.
 */
export class PlayerBulletBasic extends Bullet {
  /**
   * Initializes a new instance of the PlayerBulletBasic object.
   * @param {any} props
   */
  constructor (props) {
    super(props);
    this.hitboxW = 20;
    this.hitboxH = 40;
  }

  /**
   * Describes how the PlayerBulletBasic object moves. 
   */
  move () {
    // Give bullets a slight spread...
    if (this.posY % 3 === 0 && this.speedX !== 0) {
      this.posX += this.speedX;
    }

    this.posY += this.speedY;

    if (this.posX < -20 || this.posX > canvasWidth || this.posY < 0 || this.posY > canvasHeight) {
      this.destroySelf();
    }
  }

  /**
   * Renders the player bullet sprite onto the context object.
   * @param {any} ctx
   */
  render (ctx) {
    this.move();
    ctx.drawImage(this.sprite, 140, 318, 45, 77, this.posX, this.posY, this.hitboxW, this.hitboxH);
  }
}

/**
 * Defines a basic enemy bullet, a child of the Bullet object.
 */
export class BasicEnemyBullet extends Bullet {
  /**
   * Initializes a new instance of the BasicEnemyBullet object.
   * @param {any} props
   */
  constructor (props) {
    super(props);
    this.hitboxW = 19;
    this.hitboxH = 19;
  }

  /**
   * Describes how the BasicEnemyBullet object moves.
   */
  move () {
    // Give bullets a slight spread
    this.posX += this.speedX;
    this.posY += this.speedY;

    if (this.posX < -20 || this.posX > canvasWidth || this.posY < 0 || this.posY > canvasHeight) {
      this.destroySelf();
    }
  }

  /**
   * Renders the enemy bullet onto the context object.
   * @param {any} ctx
   */
  render (ctx) {
    this.move();
    ctx.drawImage(this.sprite, 36, 115, 19, 19, this.posX, this.posY, this.hitboxW, this.hitboxH);
  }
}
