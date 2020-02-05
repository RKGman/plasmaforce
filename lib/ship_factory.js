import * as Enemies from './enemies/enemy_ships'

/**
 * Defines a constant ShipFactory object with functions for generating enemy ships.
 */
const ShipFactory = {
  // Initialization function
  init: function (game) {
    this.game = game
    this.scores = game.scores
    this.waves = [this.addGrunt, this.addSaucer, this.addTwoSaucers, this.addOculus]
  },

  // Function to spawn enemies.  Each wave is determined by the score.
  spawnEnemies: function () {
    if (this.scores.score < 45) {
      this.addGrunt()
      this.addSuicider();
    } else if (this.scores.score < 145) {
      this.addGrunt()
      this.addGrunt()
    } else if (this.scores.score < 290) {
      this.addGrunt()
      this.addGrunt()
      this.addGrunt()
    } else if (this.scores.score < 400) {
      this.addSaucer()
    } else if (this.scores.score < 700) {
      this.addGrunt()
      this.addSaucer()
    } else if (this.scores.score < 1000) {
      this.addTwoSaucers()
    } else if (this.scores.score < 1400) {
      this.addTwoSaucers()
      this.addGrunt()
    } else if (this.scores.score < 1700) {
      this.addOculus()
    } else if (this.scores.score < 2100) {
      this.addOculus()
      this.addGrunt()
    } else if (this.scores.score < 3200) {
      this.randomWave()
    } else {
      this.randomWave()
      this.randomWave()
    }
  },

  // Adds a Grunt ship to the game.
  addGrunt: function () {
    this.game.enemies.push(new Enemies.GruntShip({ bullets: this.game.bullets }, this.game.difficulty))
  },
  // Adds a Saucer ship to the game
  addSaucer: function () {
    this.game.enemies.push(new Enemies.SaucerShip({ bullets: this.game.bullets }, this.game.difficulty))
  },
  // Adds a Suicider ship to the game.
  addSuicider: function () {
    this.game.enemies.push(new Enemies.Suicider({ bullets: this.game.bullets }, this.game.difficulty))
  },
  // Adds the two types of Saucer ships to the game.
  addTwoSaucers: function () {
    this.game.enemies.push(new Enemies.SaucerShip({ bullets: this.game.bullets, posX: 20 }, this.game.difficulty))
    this.game.enemies.push(new Enemies.SaucerShipV2({ bullets: this.game.bullets, posX: 320, posY: -400 }, this.game.difficulty))
  },
  // Adds an Oculus ship to the game.
  addOculus: function () {
    this.game.enemies.push(new Enemies.OculusShip({ bullets: this.game.bullets }, this.game.difficulty))
  },
  // Generates a random wave of enemies.
  randomWave: function () {
    this.waves[Math.floor(Math.random() * this.waves.length)].call(ShipFactory)
    this.waves[Math.floor(Math.random() * this.waves.length)].call(ShipFactory)
  }
}

export default ShipFactory
