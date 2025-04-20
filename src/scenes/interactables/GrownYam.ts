import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene'

export class GrownYam extends NPC {
  private _yamText: Phaser.GameObjects.Text;
  public held = false;

  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, 'Yam', 'Yam', x, y, true);
    this._yamText = scene.add.text(x, y, '🍠', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000'
    });
    this._yamText.setOrigin(0.5);
  }

  public interact (): void {
    console.log('It is yamming it up');
  }

  public update() {
    super.update()
    this._yamText.setPosition(this.x, this.y);
  }
}