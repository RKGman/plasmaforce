import MovingObject from '../moving_object'

/**
 * Defines the base definitions for any enemy ship, a child of MovingOject.
 */
class BaseShip extends MovingObject {
  /**
   * Initializes a new instance of a BaseShip object.
   * @param {any} props
   */
  constructor (props) {
    super(props);
    this.bullets = props.bullets;
  }

  /**
   * Cleans up bullets associated with this ship's instance.
   */
  deleteBullets () {
    this.bullets = this.bullets.filter(bul => !bul.cleanup);
  }

  /**
   * Reverses the direction of a ship when hitting a boundary.
   */
  antiBumpTechnology () {
    this.speedX = -this.speedX;
    this.speedY = -this.speedY;
  }
}
 
export default BaseShip
