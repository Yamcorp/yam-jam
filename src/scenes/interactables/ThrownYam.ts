import { BaseScene } from '../abstracts/BaseScene'

export class ThrownYam extends Phaser.Physics.Arcade.Sprite {
  private _gameScene: BaseScene

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, x, y, 'Yam');
    this._gameScene = scene
    this.setTexture('Yam', 1)
  }

  public get gameScene (): BaseScene {
    return this._gameScene;
  }

  public create () {
    this._gameScene.add.existing(this)
    this._gameScene.physics.add.existing(this)
    const pointer = this.gameScene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);

    this.setRotation(angle);
    this.gameScene.physics.moveTo(this, pointer.worldX, pointer.worldY, 300);

    this.gameScene.time.delayedCall(2000, () => {
      this.destroy();
    });
  }

  public override destroy (): void {
    this.gameScene.events.emit('removeFromScene', this);
    super.destroy();
  }
}