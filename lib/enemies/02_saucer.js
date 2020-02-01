import BaseShip from './base'
import { BasicEnemyBullet } from '../bullet'
import {canvasHeight, canvasWidth} from '../util'
import SoundFx from '../sound_fx'

/**
 * This defines the enemy ship that is the "lvl2," with a "fire circular spread" 
 */
class SaucerShip extends BaseShip {
  /**
   * Initializes a new instance of the SaucerShip object.
   * @param {any} props
   */
  constructor (props) {
    props = Object.assign({ speedY: 3, posY: -100, posX: Math.floor(canvasWidth / 2 - 60) }, props);
    super(props);
    this.hp = 36;
    this.sprite = this.images.enemySaucerRed;
    this.tickCount = 0;
    this.hitboxW = 96;
    this.hitboxH = 90;
    this.sprites = [];
    for (let i = 0; i <= 6; i++) {
      this.sprites.push([this.sprite, i * 96, 0, 96, 90]);
    }
    for (let i = 6; i >= 0; i--) {
      this.sprites.push([this.sprite, i * 96, 0, 96, 90]);
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
   * Specifies logic for how the Suacer ship moves.
   */
  move () {
    if (this.tickCount === 70) {
      this.fireBullet();
    }
    if (this.posY < 0) {
      this.posY += 2;
    } else if (this.tickCount > 65 && this.tickCount < 100) {
      return false;
    } else if (this.posY + this.speedY >= 0 && this.posY + this.speedY <= canvasHeight - this.hitboxH) {
      this.posY += this.speedY;
    } else {
      this.antiBumpTechnology();
    }
  }

  /**
   * Defines the logic for using bullet vector data to push new bullet objects into the bullet queue.
   * This function also triggers the bullet sound effect.
   */
  fireBullet () {
    SoundFx.enemyBasicBullet.play()

    let posObj = {
      posX: this.posX + Math.floor(this.hitboxW / 2) - 10,
      posY: this.posY + Math.floor(this.hitboxH / 2) - 10
    };

    this.BULLET_VECTORS.forEach(vector => {
      let bulletData = Object.assign({ speedX: vector[0], speedY: vector[1] }, posObj);
      this.bullets.push(new BasicEnemyBullet(bulletData));
    });
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
    if (this.tickCount >= 140) {
      this.tickCount = 0;
    }

    let result = this.sprites[Math.floor(this.tickCount / 10)];
    this.tickCount++;
    return result;
  }
}

export default SaucerShip
