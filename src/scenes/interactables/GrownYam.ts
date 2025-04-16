import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene'

export class GrownYam extends NPC {
  constructor(scene: BaseScene, x: number, y: number) {
    super(scene, 'Yam', 'Yam', x, y, true);
    const text = scene.add.text(x, y, '🍠', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000'
    });
    text.setOrigin(0.5);
  }

  public interact (): void {
    console.log('It is yamming it up');
  }
}