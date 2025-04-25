import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene';

export type YamGrowthState = 'seed' | 'sprout' | 'ripe' | 'harvested';
export type YamTile = {
  x: number;
  y: number;
  hasYam: boolean;
};

export class GrownYam extends NPC {
  public held = false;
  public growthState: YamGrowthState | undefined;
  private _collider

  constructor(scene: BaseScene, x: number, y: number, growthState: YamGrowthState) {
    super(scene, 'Yam', 'Yam', x, y, true);

    // set initial growthState
    growthState ? this.growthState = growthState : this.growthState = 'seed'

    // initialize appropriate texture
    this._updateTexture();

    if (scene.player && this.growthState === 'ripe'){
      this._collider = scene.physics.add.collider(scene.player, this);
    }

    if (this.body) {
      this.body.immovable = true;
      this.setBodySize(16, 16); // set hitbox dimensions
    }

    if (this.growthState === 'ripe' || this.growthState === 'harvested'){
    }
  }

  public interact (): void {
    // console.log('It is yamming it up');
  }

  public override update() {
    super.update()
    this.setPosition(this.x, this.y);
  }

  private _updateTexture() {
    switch (this.growthState) {
      case 'seed': this.setTexture('Yam', 2); break;
      case 'sprout': this.setTexture('Yam', 3); break;
      case 'ripe': this.setTexture('Yam', 4); break;
      case 'harvested': this.setTexture('Yam', 1); break;
    }
  }

  public growYam() {
    switch (this.growthState) {
      case 'seed': {
        this.growthState = 'sprout';
        this._updateTexture();
      }; break;
      case 'sprout': {
        this.growthState = 'ripe';
        if (this.gameScene.player) {
            this._collider = this.scene.physics.add.collider(this.gameScene.player, this);
        }
        this._updateTexture();
      }; break;
      case 'ripe': {
        this.growthState = 'harvested';
        this._collider?.destroy();
        this._updateTexture();
      }; break;
      case 'harvested': console.log("You tried to grow a fully grown Yam.."); break;
    }
  }

  public override destroy() {
    // this.pickUpZone?.destroy();
    this.gameScene.events.emit("removeFromScene", this)
    super.destroy();
  }
}