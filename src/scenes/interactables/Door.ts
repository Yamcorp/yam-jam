import { NPC } from '../abstracts/NPC';
import { Game } from '../Game';

export class Door extends NPC {
  public transitionZone: Phaser.GameObjects.Zone | undefined;
  public interactZone: Phaser.GameObjects.Zone | undefined;
  public playerNear: boolean = false;

  constructor(scene: Game, x: number, y: number) {
    super(scene, undefined, "Door", x, y, true);

    // Create interaction zone
    this.interactZone = scene.add.zone(x, y, 16, 16);
    scene.physics.add.existing(this.interactZone, true);

    // Enable overlap detection
    scene.physics.add.overlap(
      this.interactZone,
      scene.player,
      () => { this.playerNear = true; },
      undefined,
      this
    );
  }

  public override update(): void {
    this.playerNear = false;

    // Phaser will set `playerNear` to true if overlap is detected this frame
    this.gameScene.physics.world.overlap(
      this.interactZone!,
      this.gameScene.player,
      () => { this.playerNear = true; },
      undefined,
      this
    );
  }

  public interact(): void {
    if (this.playerNear) {
      console.log('Interacted with door');
    }
  }

  public override destroy(): void {
    this.gameScene.events.emit('removeFromScene', this);
    super.destroy();
  }
}
