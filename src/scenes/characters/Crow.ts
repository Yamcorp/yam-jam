import { NPC } from '../abstracts/NPC';

export type CrowSpeed = 'fast' | 'medium' | 'slow';

export class Crow extends NPC {
  protected target: Phaser.GameObjects.Sprite;
  private wobbleOffset: number = 0;
  private crowSpeed: CrowSpeed;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: CrowSpeed) {
    super(scene, 'Crow', 'Crow', x, y, false);
    this.crowSpeed = speed;
  }
  
  interact() {
    console.log('The crow got hit with a yam!');
    // Additional logic for interaction can be added here
  }

  setTarget(target: Phaser.GameObjects.Sprite) {
    this.target = target;
  }

  update() {
    let speed: number;
    switch (this.crowSpeed) {
      case 'fast': speed = Phaser.Math.Between(150, 225); break;
      case 'medium': speed = Phaser.Math.Between(100, 200); break;
      case 'slow': speed = Phaser.Math.Between(50, 100); break;
      default:
      speed = 100; // Default speed if none is set
    }

    const distanceX = this.target.x - this.x;
    const distanceY = this.target.y - this.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    let velocityX: number;
    let velocityY: number;
    if (distance > 50) {
      velocityX = (distanceX / distance) * speed;
      velocityY = (distanceY / distance) * speed;
    } else {
      const angle = Math.atan2(distanceY, distanceX) + Math.PI / 2; 
      const orbitSpeed = 50; 
      velocityX = Math.cos(angle) * orbitSpeed;
      velocityY = Math.sin(angle) * orbitSpeed;
    }

    this.wobbleOffset += 0.05; // Slower wobble speed for smoother motion
    const wobbleAmplitude = 30; // Reduced wobble amplitude for subtle effect
    velocityX += Math.sin(this.wobbleOffset) * wobbleAmplitude;
    velocityY += Math.cos(this.wobbleOffset) * wobbleAmplitude;

    this?.setVelocity(velocityX, velocityY);
  }

  hitByYam() {
    console.log('The crow has been hit by a yam and is destroyed!');
    this.gameScene.crows = this.gameScene.crows.filter(crow => crow !== this);
    this.destroy();
  }
}