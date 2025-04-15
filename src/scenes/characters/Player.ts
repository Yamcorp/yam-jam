import { BaseScene } from '../abstracts/BaseScene'
import { Crow } from './Crow'

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key }
  private speed: number
  private gameScene: BaseScene
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, 'Player')
      this.gameScene = scene as BaseScene

      this.setScale(4) // the player sprite is too small by default
      this.gameScene.add.existing(this)
      this.gameScene.physics.add.existing(this)
      this.body?.setSize(16, 16) // the collision shape is now too big

      this.cursors = this.gameScene.input.keyboard?.createCursorKeys()
      this.wasd = this.gameScene.input.keyboard?.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as { [key: string]: Phaser.Input.Keyboard.Key }

      this.speed = 250

      this.gameScene.input.on('pointerdown', this.throwYam, this);
  }

  update() {
    const direction = new Phaser.Math.Vector2(0, 0)
    if (this.cursors?.left.isDown || this.wasd?.left.isDown) {
        direction.x -= 1
    }
    if (this.cursors?.right.isDown || this.wasd?.right.isDown) {
        direction.x += 1
    }
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) {
        direction.y -= 1
    }
    if (this.cursors?.down.isDown || this.wasd?.down.isDown) {
        direction.y += 1
    }
    direction.normalize().scale(this.speed)
    this.setVelocity(direction.x, direction.y)
  }

  throwYam() {
    if (this.gameScene.dataStore.amountOfYams <= 0) {
      console.log('No more yams to throw!');
      return;
    }
    this.gameScene.dataStore.amountOfYams--;
    console.log('Yam thrown! 🍠');
    const yam = this.gameScene.physics.add.sprite(this.x, this.y, 'yam');
    const pointer = this.gameScene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);

    yam.setRotation(angle);
    this.gameScene.physics.moveTo(yam, pointer.worldX, pointer.worldY, 500);

    this.gameScene.physics.add.overlap(yam, this.gameScene.crows, (yam, crow) => {
      const crowInstance = crow as Crow;
      crowInstance.interact();
      yam.destroy();
    });
    this.gameScene.time.delayedCall(2000, () => {
      console.log('Yam destroyed');
      yam.destroy();
    });
  }
  
}
