import MovingObject from './moving_object'
import ImageableSingleton from './imageable'
// import {canvasHeight, canvasWidth} from './util'

/**
 * Defines the Background class for the moving background in the game; this is a child of MovingObject. 
 */
class Background extends MovingObject {
  constructor () {
    super({speedY: 2})
    let images = new ImageableSingleton()
    this.backgroundImg = images.backgroundImg
    this.tick = 0
  }

  /**
   * Renders the background image onto the context object.
   * @param {any} ctx
   */
  render (ctx) {
    if (this.tick % 2 === 0) {
      ctx.drawImage(this.backgroundImg, this.posX, this.posY);
      ctx.drawImage(this.backgroundImg, this.posX, this.posY - this.backgroundImg.height);
      this.posY += this.speedY;
      this.posY >= this.backgroundImg.height && (this.posY = 0);
      this.tick > 300 && (this.tick = 0);
    }
    this.tick++;
  }
}

export default Background
