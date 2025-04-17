import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene'
import { GrownYam } from '../interactables/GrownYam';

export type CrowSpeed = 'fast' | 'medium' | 'slow';

export class Crow extends NPC {
  private _target: Phaser.GameObjects.Sprite;
  private _wobbleOffset: number = 0;
  private _crowSpeed: CrowSpeed;
  private _heldYam: GrownYam | null;

  constructor(scene: BaseScene, x: number, y: number, speed: CrowSpeed) {
    super(scene, 'Crow', 'Crow', x, y, false);
    this._crowSpeed = speed;
  }
  
  public interact () {
    console.log('The crow got hit with a yam!');
    this.dropYam();
    this.destroy();
  }

  public get target () {
    return this._target;
  }

  public setTarget (target: Phaser.GameObjects.Sprite) {
    this._target = target;
  }

  public update () {
    let speed: number;
    switch (this._crowSpeed) {
      case 'fast': speed = Phaser.Math.Between(150, 225); break;
      case 'medium': speed = Phaser.Math.Between(100, 200); break;
      case 'slow': speed = Phaser.Math.Between(50, 100); break;
      default:
      speed = 100; // Default speed if none is set
    }
    let velocityX = 0;
    let velocityY = 0;

    if (!this._heldYam) {
      const distanceX = this._target.x - this.x;
      const distanceY = this._target.y - this.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
      console.log('target', this._target.name);
      if (distance > 50 || this._target.name === 'Yam') {
        velocityX = (distanceX / distance) * speed;
        velocityY = (distanceY / distance) * speed;
      } else {
        const angle = Math.atan2(distanceY, distanceX) + Math.PI / 2; 
        const orbitSpeed = 50; 
        velocityX = Math.cos(angle) * orbitSpeed;
        velocityY = Math.sin(angle) * orbitSpeed;
      }
    } else {
      const worldBounds = this.scene.physics.world.bounds;
      const distanceToLeft = this.x - worldBounds.left;
      const distanceToRight = worldBounds.right - this.x;
      const distanceToTop = this.y - worldBounds.top;
      const distanceToBottom = worldBounds.bottom - this.y;

      let closestDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

      if (closestDistance === distanceToLeft) {
        velocityX = -speed;
        velocityY = 0;
      } else if (closestDistance === distanceToRight) {
        velocityX = speed;
        velocityY = 0;
      } else if (closestDistance === distanceToTop) {
        velocityX = 0;
        velocityY = -speed;
      } else if (closestDistance === distanceToBottom) {
        velocityX = 0;
        velocityY = speed;
      }
      this._heldYam.setX(this.x);
      this._heldYam.setY(this.y);
      this._heldYam.update();
    }


    this._wobbleOffset += 0.05; // Slower wobble speed for smoother motion
    const wobbleAmplitude = 30; // Reduced wobble amplitude for subtle effect
    velocityX += Math.sin(this._wobbleOffset) * wobbleAmplitude;
    velocityY += Math.cos(this._wobbleOffset) * wobbleAmplitude;

    this.setVelocity(velocityX, velocityY);
  }

  public grabYam (yam: GrownYam) {
    this._heldYam = yam;
    this._crowSpeed = 'slow'
    yam.held = true;
  }

  public dropYam () {
    if (this._heldYam) {
      this._heldYam.held = false;
      this._heldYam = null;
    }
  }
}