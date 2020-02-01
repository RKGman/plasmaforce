import ImageableSingleton from './imageable'

const defaultProps = {
  speedX: 0,
  speedY: 0,
  posX: 0,
  posY: 0
}

/**
 * The is the 'master' class that every moving object in the game will inherit from.
 */
class MovingObject {
  /**
   * Initializes a new instance of the MovingObject class.
   * @param {any} props
   */
  constructor (props = {}) {
    let newProps = Object.assign({}, defaultProps, props);
    this.speedX = newProps.speedX;
    this.speedY = newProps.speedY;
    this.posX = newProps.posX;
    this.posY = newProps.posY;
    this.cleanup = false;
    this.images = new ImageableSingleton();
  }

  /**
   * Defines how the object moves. 
   */
  move() {
    this.posX += this.speedX;
    this.posY += this.speedY;
  }

  /**
   * Marks the moving object for cleanup so that the game's cleanup function can delete it.
   */
  destroySelf () {
    this.cleanup = true;
  }
}

export default MovingObject
