import { NPC } from '../abstracts/NPC';
import { Game } from '../Game';
import { UIScene } from '../UIScene';


export class Door extends NPC {
  public transitionZone: Phaser.GameObjects.Zone | undefined;
  public interactZone: Phaser.GameObjects.Zone | undefined;
  public playerNear: boolean = false;
  private isDoorOpen = false;
  // private openDoorSprite;

  constructor(scene: Game, x: number, y: number) {
    super(scene, undefined, "Door", x, y, true);
    this.setVisible(false); // Make door invisible

    // Create interaction zone
    this.interactZone = scene.add.zone(x, y, 32, 16);
    scene.physics.add.existing(this.interactZone, true);

    // Enable overlap detection
    scene.physics.add.overlap(
      this.interactZone,
      scene.player,
      () => { this.playerNear = true; },
      undefined,
      this
    );

  //  this._makeSprite(); // make open door sprite
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
    if (this.playerNear && this.interactZone) {
      if (this.gameScene.dataStore.hasEnoughYams) {
        console.log("open door")
        this.gameScene.sound.play("fart", { volume: 0.2 });
        this.gameScene.sound.stopByKey("running");
      this.gameScene.dataStore.isHomeInTime = true;
      this.gameScene.scene.start('HouseScene');
        // this.toggleDoorOpen()
      } else {
        const uiScene = this.gameScene.scene.get('UIScene') as UIScene;
        uiScene.shakeYamsRequired();
      }

    }
  }

  public override destroy(): void {
    this.gameScene.events.emit('removeFromScene', this);
    super.destroy();
  }

  // private _makeSprite() {
  //   const { x, y } = this.interactZone!;
  //   this.gameScene.add.sprite(x, y-24, 'door');
  //   this.gameScene.player.setDepth(0)
  // }

  // private toggleDoorOpen() {
  //   // close door
  //   if (this.openDoorSprite && this.isDoorOpen) {
  //     this.openDoorSprite.setVisible(false)
  //     this.gameScene.player.setDepth(0)
  //     // open door
  //   } else {
  //     this.isDoorOpen = true
  //     this.gameScene.player.setDepth(1)
  //   }
  // }
}
