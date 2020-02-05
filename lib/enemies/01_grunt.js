import BaseShip from './base'
import { BasicEnemyBullet } from '../bullet'
import * as Util from '../util'
import SoundFx from '../sound_fx'

 
/**
 * This defines the enemy ship that is the "weakest enemy ship" (pre-suicider?) *
 */
class GruntShip extends BaseShip {
  /**
   * Initializes a new instance of the GruntShip object.
   * @param {any} props
   */
  constructor (props, difficulty) {
    props = Object.assign({ speedX: 2, posY: -100, posX: (Math.abs(Math.floor(Math.random() * Util.canvasWidth) - 50)) }, props);
    super(props);
    this.hp = 10;
    this.sprite = this.images.enemyGrunt;
    this.tickCount = 0;
    this.boundY = (Math.floor(Math.random() * 6) * 20) + 20;
    this.hitboxW = 48;
    this.hitboxH = 72;
    this.sprites = [];
    this.difficulty = difficulty;
    for (let i = 0; i <= 3; i++) {
      this.sprites.push([this.sprite, i * 32, 0, 32, 48]);
    }
    for (let i = 3; i >= 0; i--) {
      this.sprites.push([this.sprite, i * 32, 0, 32, 48]);
    }
  }

  /**
   * Specifies logic for how the Grunt ship moves.
   */
  move () {
    if (this.posY < this.boundY) {
      this.posY += 2;
    } else {
      if (this.tickCount % 40 === 0 && (Math.random() * 2) > 1) {
        this.fireBullet();
      }
      if (this.posX + this.speedX >= 0 && this.posX + this.speedX <= Util.canvasWidth - this.hitboxW) {
        this.posX += this.speedX;
      } else {
        this.antiBumpTechnology();
      }
    }
  }

  /**
   * Defines the logic for specifying bullet vector data and pushing new bullet objects into the bullet queue.
   * This function also triggers the bullet sound effect.
   */
  fireBullet () {
    SoundFx.enemyBasicBullet.play();

    let posObj = {
      posX: this.posX + Math.floor(this.hitboxW / 2) - 10,
      posY: this.posY + this.hitboxH - 20
    };
    let bulletData = Object.assign({ speedX: 0, speedY: 5 }, posObj);
    let bulletData2 = Object.assign({ speedX: -3, speedY: 4 }, posObj);
    let bulletData3 = Object.assign({ speedX: 3, speedY: 4 }, posObj);
    let bulletData4 = Object.assign({ speedX: -1, speedY: 4 }, posObj);
    let bulletData5 = Object.assign({ speedX: 1, speedY: 4 }, posObj);
    if (this.difficulty == Util.difficulty.EASY) {
      this.bullets.push(new BasicEnemyBullet(bulletData));
    } else if (this.difficulty == Util.difficulty.NORMAL) {
      this.bullets.push(new BasicEnemyBullet(bulletData),
        new BasicEnemyBullet(bulletData2), new BasicEnemyBullet(bulletData3));
    }
    else {
      this.bullets.push(new BasicEnemyBullet(bulletData),
        new BasicEnemyBullet(bulletData2), new BasicEnemyBullet(bulletData3),
        new BasicEnemyBullet(bulletData4), new BasicEnemyBullet(bulletData5));
    }
  }

  /**
   * Calls function to render the GruntShip object image and its hitbox at a particular location.
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

export default GruntShip
