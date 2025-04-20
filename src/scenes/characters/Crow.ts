import { NPC } from '../abstracts/NPC';
import { BaseScene } from '../abstracts/BaseScene'
import { GrownYam } from '../interactables/GrownYam';

export type CrowSpeed = 'fast' | 'medium' | 'slow' | 'hover';

export class Crow extends NPC {
  private _target: Phaser.GameObjects.Sprite | undefined;
  private _wobbleOffset: number = 0;
  public crowSpeed: CrowSpeed;
  private _heldYam: GrownYam | null | undefined;
  private _shadow: Phaser.GameObjects.Graphics; 
  public isOverYam: boolean = false;


  constructor(scene: BaseScene, x: number, y: number, speed: CrowSpeed) {
    super(scene, 'Crow', 'Crow', x, y, false);
    this.crowSpeed = speed;
    this.play('crow-fly');

    // Add shadow
    this._shadow = this.scene.add.graphics();
    this._shadow.fillStyle(0x000000, 0.05);  // Black shadow with 30% opacity
    this._shadow.fillCircle(0, 30, 15);
    this._shadow.setDepth(20);

    // Initially position the shadow
    this.updateShadowPosition();
  }
  
  public interact () {
    this.dropYam();
    this.destroy();
  }

  public override destroy() {
    // Remove the shadow when the crow is destroyed
    if (this._shadow) {
      this._shadow.destroy();
    }
  
    super.destroy();
  }

  public get target () {
    return this._target;
  }

  public setTarget (target: Phaser.GameObjects.Sprite) {
    this._target = target;
  }

  private updateShadowPosition() {
    this._shadow.setPosition(this.x, this.y + 10);  // Adjust vertical position to place shadow under the crow
  }

  public override update () {
    let speed: number;
    switch (this.crowSpeed) {
      case 'fast': speed = Phaser.Math.Between(150, 225); break;
      case 'medium': speed = Phaser.Math.Between(100, 200); break;
      case 'slow': speed = Phaser.Math.Between(50, 100); break;
      case 'hover': speed = 0; break;
      default:
      speed = 100; // Default speed if none is set
    }
    let velocityX = 0;
    let velocityY = 0;

    if (!this._heldYam) {
      var distanceX;
      var distanceY
      var distance;
      if (this._target) {
        distanceX = this._target?.x - this.x;
        distanceY = this._target?.y - this.y - 30;
        distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      }
  
      if (distance && distanceX && distanceY) {

        if (distance > 50 || this._target?.name === 'Yam') {
          velocityX = (distanceX / distance) * speed;
          velocityY = (distanceY / distance) * speed;

        this.setSpriteDirection(velocityX)
        } else {
          const angle = Math.atan2(distanceY, distanceX) + Math.PI / 2; 
          const orbitSpeed = 50; 
          velocityX = Math.cos(angle) * orbitSpeed;
          velocityY = Math.sin(angle) * orbitSpeed;
          
          this.setSpriteDirection(velocityX)
        }
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
      this._heldYam.setY(this.y + 20);
      this._heldYam.update();
    }


    this._wobbleOffset += 0.05; // Slower wobble speed for smoother motion
    const wobbleAmplitude = 30; // Reduced wobble amplitude for subtle effect
    velocityX += Math.sin(this._wobbleOffset) * wobbleAmplitude;
    velocityY += Math.cos(this._wobbleOffset) * wobbleAmplitude;

    this.setVelocity(velocityX, velocityY);

    // Update shadow position based on crow's position
    this.updateShadowPosition();
  }

  private setSpriteDirection (velocityX: number) {
    // Flip the crow if moving left
    if (!this.isOverYam){
      if (velocityX < 0) {
        this.setFlipX(true);  // Flip the crow to face left
      } else {
        this.setFlipX(false); // Keep it facing right
      }
    }
  }
  

  public grabYam (yam: GrownYam) {
    this._heldYam = yam;
    this.crowSpeed = 'slow'
    yam.held = true;
    yam.growYam()
  }

  public dropYam () {
    if (this._heldYam) {
      this._heldYam.held = false;
      this._heldYam = null;
    }
  }
}