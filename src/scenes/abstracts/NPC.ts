import { BaseScene } from '../abstracts/BaseScene'

export abstract class NPC extends Phaser.Physics.Arcade.Sprite {
  private isInteractable: boolean;
  private _gameScene: BaseScene

  constructor(
    scene: BaseScene,
    texture: string = 'Npc',
    name: string,
    x: number,
    y: number,
    isInteractable: boolean,
  ) {
    super(scene, x, y, texture);
    this.name = name;
    this.isInteractable = isInteractable;
    this._gameScene = scene

    // Enable physics for the NPC
    this.gameScene.physics.add.existing(this);
    this.gameScene.add.existing(this)
  }

  public get gameScene (): BaseScene {
    return this._gameScene;
  }

  /**
   * Abstract method for interaction logic.
   * Must be implemented by subclasses.
   */
  abstract interact (): void;

  /**
   * Checks if the NPC is interactable.
   * @returns True if the NPC can be interacted with, false otherwise.
   */
  public canInteract (): boolean {
    return this.isInteractable;
  }

  /**
   * Cleans up resources when the NPC is destroyed.
   */
  public override destroy (): void {
    this.gameScene.events.emit('removeFromScene', this);
    super.destroy();
  }
}