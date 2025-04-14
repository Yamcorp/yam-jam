import { BaseScene } from "./BaseScene"

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key }
  private speed: number
  private gameScene: BaseScene
  
  constructor(scene: Phaser.Scene) {
      super(scene, scene.scale.width / 2, scene.scale.height / 2, 'player')
      this.gameScene = scene as BaseScene

      this.setScale(4) // the player sprite is too small by default
      this.scene.add.existing(this)
      this.scene.physics.add.existing(this)

      this.body?.setSize(16, 16) // the collision shape is now too big

      this.cursors = scene.input.keyboard?.createCursorKeys()
      this.wasd = scene.input.keyboard?.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as { [key: string]: Phaser.Input.Keyboard.Key }

      this.speed = 250

      this.scene.input.on('pointerdown', this.throwYam, this);
  }

  update() {
    let direction = new Phaser.Math.Vector2(0, 0)
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
    const yam = this.scene.physics.add.sprite(this.x, this.y, 'yam');
    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);

    yam.setRotation(angle);
    this.scene.physics.moveTo(yam, pointer.worldX, pointer.worldY, 500);
    this.scene.time.delayedCall(2000, () => {
      console.log('Yam destroyed');
      yam.destroy();
    });
  }
  
}
