import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene'

export type YamGrowthState = 'seed' | 'sprout' | 'ripe' | 'harvested';

export class GrownYam extends NPC {
  public held = false;
  public growthState: YamGrowthState = 'seed'

  constructor(scene: BaseScene, x: number, y: number, growthState: YamGrowthState) {
    super(scene, 'Yam', 'Yam', x, y, true);
    this.updateTexture();
    this.setScale(2)
    if (growthState) this.growthState = growthState
  }

  public interact (): void {
    console.log('It is yamming it up');
  }

  public update() {
    super.update()
    this.setPosition(this.x, this.y);
  }

  private updateTexture() {
    switch (this.growthState) {
      case 'seed': this.setTexture('Yam', 1); break;
      case 'sprout': this.setTexture('Yam', 2); break;
      case 'ripe': this.setTexture('Yam', 3); break;
      case 'harvested': this.setTexture('Yam', 4); break;
    }
  }

  public growYam() {
    switch (this.growthState) {
      case 'seed': {
        this.growthState = 'sprout';
        this.updateTexture();
      }; break;
      case 'sprout': {
        this.growthState = 'ripe';
        this.updateTexture();
      }; break;
      case 'ripe': {
        this.growthState = 'harvested';
        this.updateTexture();
      }; break;
      case 'harvested': console.log("You tried to grow a yam that was already harvested..."); break;
    }
  }


}