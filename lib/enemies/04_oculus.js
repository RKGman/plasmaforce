import BaseShip from './base'
import { BasicEnemyBullet } from '../bullet'
import {canvasHeight, canvasWidth} from '../util'
import SoundFx from '../sound_fx'

/**
 * This defines the level 4 enemy ship.
 */
class OculusShip extends BaseShip {
  /**
   * Initializes a new instance of the OculusShip object.
   * @param {any} props
   */
  constructor (props) {
    props = Object.assign({ speedX: 3, speedY: 3, posY: -100, posX: Math.floor(Math.random() * 350) }, props);
    super(props);
    this.hp = 68;
    this.sprite = this.images.enemyOculus;
    this.tickCount = 0;
    this.hitboxW = 72;
    this.hitboxH = 120;
    this.sprites = [];
    for (let i = 0; i <= 3; i++) {
      this.sprites.push([this.sprite, i * 48, 0, 48, 80]);
    }
    for (let i = 3; i >= 0; i--) {
      this.sprites.push([this.sprite, i * 48, 0, 48, 80]);
    }
    this.BULLET_VECTORS = [
      [0, 5],
      [0, -5],
      [5, 0],
      [-5, 0],
      [-2, 4],
      [2, 4],
      [-2, -4],
      [2, -4],
      [4, 2],
      [4, -2],
      [-4, -2],
      [-4, 2]
    ];
  }

  /**
   * Specifies logic for how the Oculus ship moves.
   */
  move () {
    if (this.posY < 0) {
      this.posY += 2;
    } else if (this.tickCount >= 24 && this.tickCount < 60) {
      if (this.tickCount % 3 === 0) { this.fireBullet() }
    } else {
      if (this.posY + this.speedY >= 0 && this.posY + this.speedY <= 300) {
        this.posY += this.speedY;
      } else {
        this.speedY *= -1;
      }
      if (this.posX + this.speedX >= 0 && this.posX + this.speedX <= canvasWidth - this.hitboxW) {
        this.posX += this.speedX;
      } else {
        this.speedX *= -1;
      }
    }
  }

  /**
   * Defines the logic for using bullet vector data to push new bullet objects into the bullet queue.
   * This function also triggers the bullet sound effect.
   */
  fireBullet () {
    SoundFx.enemyBasicBullet.play();
    let posObj = {
      posX: this.posX + Math.floor(this.hitboxW / 2) - 10,
      posY: this.posY + Math.floor(this.hitboxH / 2) - 10
    };
    let vector = this.BULLET_VECTORS[(this.tickCount - 24) / 3];
    let bulletData = Object.assign({ speedX: vector[0], speedY: vector[1] }, posObj);
    this.bullets.push(new BasicEnemyBullet(bulletData));
  }

  /**
   * Calls function to render the SuacerShip object image and its hitbox at a particular location.
   * @param {any} ctx
   */
  render (ctx) {
    this.move();
    ctx.drawImage(...this.getSprite(), this.posX, this.posY, this.hitboxW, this.hitboxH);
  }

  /**
   * Returns the sprite for a specific tick count
   */
  getSprite () {
    if (this.tickCount >= 80) {
      this.tickCount = 0;
    }
    let result = this.sprites[Math.floor(this.tickCount / 10)];
    this.tickCount++;
    return result;
  }
}

export default OculusShip
