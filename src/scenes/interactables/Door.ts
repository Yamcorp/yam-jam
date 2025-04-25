import { NPC } from '../abstracts/NPC';
import { Game } from '../Game'


export class Door extends NPC {
  public transitionZone: any;
  public interactZone: any;

  constructor(scene: Game, x: number, y: number) {
    super(scene, undefined, "Door", x, y, true);

    this.transitionZone = undefined;
    this.interactZone = undefined;

  }

  public interact (): void {
    return;
  }

  public override destroy (): void {
    this.gameScene.events.emit('removeFromScene', this);
    super.destroy();
  }
}