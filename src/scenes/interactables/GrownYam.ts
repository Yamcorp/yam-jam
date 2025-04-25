import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene';
import { CLOCK_CONSTANTS } from '../../plugins/ClockPlugin';

export type YamGrowthState = 'seed' | 'sprout' | 'ripe' | 'harvested';
export type YamTile = {
  x: number;
  y: number;
  hasYam: boolean;
};

const numberOfGrowthStages = 3;

// It should take a Full Day to grow a Yam
const timeForStage = CLOCK_CONSTANTS.CYCLE_LENGTH / numberOfGrowthStages;

export class GrownYam extends NPC {
  public held = false;
  private _growthState: YamGrowthState;
  private _collider;
  private _grownAt: number; // This is the last time the yam was grown

  public get growthState (): YamGrowthState {
    return this._growthState;
  }

  public set growthState (value: YamGrowthState) {
    this._growthState = value;
    this._updateTexture(); 
  } 

  constructor(scene: BaseScene, x: number, y: number, growthState: YamGrowthState) {
    super(scene, 'Yam', 'Yam', x, y, true);
    this._grownAt = this.gameScene.clockPlugin.getElapsedTime();
    // set initial growthState
    growthState ? this._growthState = growthState : this._growthState = 'seed'
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
    const dontGrowStages: YamGrowthState[] = ['ripe', 'harvested']
    if (dontGrowStages.includes(this.growthState)) return
    const currentTime = this.gameScene.clockPlugin.getElapsedTime();
    if (currentTime - this._grownAt >= timeForStage) {
      this._grownAt = currentTime
      this.growYam()
    }
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
      case 'seed':
        this.growthState = 'sprout';
        this._updateTexture();
        break;
      case 'sprout':
        this.growthState = 'ripe';
        if (this.gameScene.player) {
            this._collider = this.scene.physics.add.collider(this.gameScene.player, this);
        }
        this._updateTexture();
        break;
      case 'ripe':
        this.growthState = 'harvested';
        this._collider?.destroy();
        this._updateTexture();
        break;
      case 'harvested': console.log("You tried to grow a fully grown Yam.."); break;
    }
  }

  public override destroy() {
    // this.pickUpZone?.destroy();
    this.gameScene.events.emit("removeFromScene", this)
    super.destroy();
  }
}