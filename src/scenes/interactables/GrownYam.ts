import { NPC } from '../abstracts/NPC';
import { Game } from '../Game'

export type YamGrowthState = 'seed' | 'sprout' | 'ripe' | 'harvested';

export class GrownYam extends NPC {
  public held = false;
  public growthState: YamGrowthState | undefined;
  // public pickUpZone: Phaser.GameObjects.Zone | undefined;
  private _collider

  constructor(scene: Game, x: number, y: number, growthState: YamGrowthState) {
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
    }

    if (this.growthState === 'ripe' || this.growthState === 'harvested'){
      // this._addPickUpZone()
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

  // private _addPickUpZone() {
  //   this.pickUpZone = this.scene.add.zone(this.x, this.y, 20, 25);

  //   this.scene.physics.add.existing(this.pickUpZone);
  //   (this.pickUpZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  //   (this.pickUpZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
  // }

  public growYam() {
    switch (this.growthState) {
      case 'seed': {
        this.growthState = 'sprout';
        this._updateTexture();
      }; break;
      case 'sprout': {
        this.growthState = 'ripe';
        this._collider = this.scene.physics.add.collider(this.scene.player, this);
        // this._addPickUpZone();
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