import { NPC } from '../abstracts/NPC';
import { Game } from '../Game'

export type YamGrowthState = 'seed' | 'sprout' | 'ripe' | 'harvested';

export class GrownYam extends NPC {
  public held = false;
  public growthState: YamGrowthState | undefined;
  public pickUpZone: Phaser.GameObjects.Zone | undefined;

  constructor(scene: Game, x: number, y: number, growthState: YamGrowthState) {
    super(scene, 'Yam', 'Yam', x, y, true);
    this.setScale(2)

    // set initial growthState
    growthState ? this.growthState = growthState : this.growthState = 'seed'

    // initialize appropriate texture
    this.updateTexture();

    if (scene.player){
      scene.physics.add.collider(scene.player, this);
      // scene.physics.add.overlap(scene.player, this);
    }

    if (this.body) {
      this.body.immovable = true;
    }

    this.pickUpZone = scene.add.zone(this.x, this.y, 40, 50);
    scene.physics.add.existing(this.pickUpZone);
    (this.pickUpZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.pickUpZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    
  }

  public interact (): void {
    // console.log('It is yamming it up');
  }

  public override update() {
    super.update()
    this.setPosition(this.x, this.y);
    this.pickUpZone?.setPosition(this.x, this.y);
  }

  public updateTexture() {
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
      case 'harvested': console.log("You tried to grow a fully grown Yam.."); break;
    }
  }

  public override destroy() {
    this.pickUpZone?.destroy();
    this.gameScene.events.emit("removeFromScene", this)
    super.destroy();
  }
}