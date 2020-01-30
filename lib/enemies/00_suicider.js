import BaseShip from './base' 

/**
 * The defines the enemy ship that "just suicides into the enemy". * 
 */
class Suicider extends BaseShip {
  /**
   * Initializes a new instance of the Suicider object.
   * @param {any} props
   */
  constructor(props) {    
    super(props)
    this.sprite = this.images.enemySuicider
    this.tickCount = 0
    this.posX = Math.abs(Math.floor((Math.random() * 300))) 
    this.hp = 5
    this.hitboxW = 16
    this.hitboxH = 38
    this.sprites = []
    for (let i = 0; i <= 3; i++) {
      this.sprites.push([this.sprite, i * 16, 0, 16, 38])
    }
    for (let i = 3; i >= 0; i--) {
      this.sprites.push([this.sprite, i * 16, 0, 16, 38])
    }
  }

  /**
   * Specifies logic for how the Suicider ship moves.
   */
  move() {
    this.posY += 2
  }

  /**
   * Calls function to render the Suicider object image and its hitbox at a particular location.
   * @param {any} ctx
   */
  render(ctx) {
    this.move()
    ctx.drawImage(...this.getSprite(), this.posX, this.posY, this.hitboxW, this.hitboxH)
  }

  /**
   * Returns the sprite for a specific tick count
   */
  getSprite () {
    if (this.tickCount >= 40) {
      this.tickCount = 0
    }

    let result = this.sprites[Math.floor(this.tickCount / 10)]
    this.tickCount++
    return result
  }
}

export default Suicider
