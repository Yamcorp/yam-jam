import { BaseScene } from '../abstracts/BaseScene'

export abstract class NPC extends Phaser.Physics.Arcade.Sprite {
  protected isInteractable: boolean;
  private gameScene: BaseScene

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
    this.gameScene = scene

    // Enable physics for the NPC
    this.gameScene.physics.add.existing(this);
    this.gameScene.add.existing(this)
  }

  /**
   * Abstract method for interaction logic.
   * Must be implemented by subclasses.
   */
  abstract interact(): void;

  /**
   * Checks if the NPC is interactable.
   * @returns True if the NPC can be interacted with, false otherwise.
   */
  canInteract(): boolean {
    return this.isInteractable;
  }

  /**
   * Cleans up resources when the NPC is destroyed.
   */
  destroy(): void {
    super.destroy();
  }
}