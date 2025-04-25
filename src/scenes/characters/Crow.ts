import { Game } from '../Game'
import { GrownYam } from '../interactables/GrownYam';
import { BaseScene } from '../abstracts/BaseScene';

export type CrowSpeed = 'fast' | 'medium' | 'slow' | 'hover';

export class Crow extends Phaser.Physics.Arcade.Sprite {
  private _target: Phaser.GameObjects.Sprite | undefined;
  private _wobbleOffset: number = 0;
  public crowSpeed: CrowSpeed;
  private _heldYam: GrownYam | null | undefined;
  private _shadow: Phaser.GameObjects.Graphics;
  public isOverYam: boolean = false;
  private _gameScene: Game

  /**
   * Audio
   */
  private _deathSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private _flyingSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  /**
   * Crow Constructor
   * @param scene
   * @param x
   * @param y
   * @param speed
   */
  constructor(scene: BaseScene, x: number, y: number, speed: CrowSpeed | undefined = undefined) {
    super(scene, x, y, 'Crow');
    this.setScale(0.5)
    this._gameScene = scene as Game
    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (!speed) {
      const speeds: CrowSpeed[] = ['slow', 'medium', 'fast'];
      speed = speeds[Phaser.Math.Between(0, speeds.length - 1)];
    }
    this.crowSpeed = speed;

    this.play('crow-fly');

    this._assignTarget()

    // Add a collision between the New Crow and all Growing Yams
    const harvestableYams = this._gameScene.growingYams.filter(
      (yam) => yam.growthState === 'ripe' || yam.growthState === 'harvested'
    )
    this.scene.physics.add.overlap(this, harvestableYams, (crow, yam) => {
      const yamInstance = yam as GrownYam;

      // If the Yam is already held do nothing
      if (yamInstance.held) return
      const crowInstance = crow as Crow;
      // if the crow is over the yam and the crow is within 10 spaces (vertically) of the spot 20 spaces above the yam
      if (!crowInstance.isOverYam && (Math.abs(crowInstance.y + 20 - yamInstance.y) < 10)) {
        crowInstance.isOverYam = true;
        crowInstance.crowSpeed = 'hover';
        this.scene.time.delayedCall(Phaser.Math.Between(759, 1000), () => {

          // yam no longer exists previously destroyed
          if (!yamInstance.active || !yamInstance.body) {
            return
            // crow should also pick a new target eventually
          };
          // Have the Crow grab the Yam
          crowInstance.grabYam(yamInstance);
          crowInstance.isOverYam = false;
          crowInstance.crowSpeed = 'slow';
        })
      }
      // // Iterate through all the crows and if any of them are targeting this.scene yam
      // //    they should start targeting a new yam
      // this.scene.Crows.forEach((crow) => {
      //   if (crow === crowInstance) return
      //   if (crow.target === yamInstance) {
      //     const potentialYamTargets = this.scene.growingYams.filter((yam) => !yam.held && yam !== yamInstance && (yam.growthState === 'ripe' || yam.growthState === 'harvested'));
      //     const potentialNewTargets = [this.scene.player, ...potentialYamTargets];
      //     if (potentialNewTargets.length > 0) {
      //       const newTarget = potentialNewTargets[Phaser.Math.Between(0, potentialNewTargets.length - 1)]
      //       crow.setTarget(newTarget);
      //     }
      //   }
      // })
    });

    // Add shadow
    this._shadow = this.scene.add.graphics();
    this._shadow.fillStyle(0x000000, 0.05);  // Black shadow with 30% opacity
    this._shadow.fillCircle(0, 15, 7);
    this._shadow.setDepth(10);

    // Initially position the shadow
    this.updateShadowPosition();
    this._deathSound = this._gameScene.sound.add("crow-hit", { volume: 0.10, loop: false });
    this._flyingSound = this._gameScene.sound.add("crow", {
      volume: 0.25,
      loop: true,
      detune: (Math.floor(Math.random() * 601) - 300),
      source: { follow: this }
    });
  }

  public interact () {
    this.dropYam();
    this.scene.events.emit("removeFromScene", this)
    this.destroy();
  }

  public override update () {
    this._handleMovement()
  }

  public override destroy() {
    // Remove the shadow when the crow is destroyed
    if (this._shadow) {
      this._shadow.destroy();
    }
    this._flyingSound.stop();
    this._flyingSound.destroy();
    this._deathSound.play();
    this.scene.events.emit("removeFromScene", this)
    super.destroy();
  }

  public get target () {
    return this._target;
  }

  private updateShadowPosition() {
    this._shadow.setPosition(this.x, this.y + 10);  // Adjust vertical position to place shadow under the crow
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
    if (yam.growthState === 'ripe' || yam.growthState === 'harvested') {
      this._heldYam = yam;
      this.crowSpeed = 'slow'
      yam.held = true;
      yam.growYam()
    } else {
      this._assignTarget()
    }
  }

  public dropYam () {
    if (this._heldYam) {
      this._heldYam.held = false;
      this._heldYam = null;
    }
  }

  private _handleMovement() {
    if (!this._flyingSound.isPlaying) {
      this._flyingSound.play("", { delay: 0.1 });
    }
    let speed: number;
    switch (this.crowSpeed) {
      case 'fast': speed = Phaser.Math.Between(120, 170); break;
      case 'medium': speed = Phaser.Math.Between(60, 140); break;
      case 'slow': speed = Phaser.Math.Between(40, 60); break;
      case 'hover': speed = 0; break;
      default:
      speed = 100; // Default speed if none is set
    }

    if (!this._heldYam) {
      this._flyToTarget(speed)
    } else {
      this._flyAway(speed)
    }

    // Update shadow position based on crow's position
    this.updateShadowPosition();
  }

  private _flyAway (speed: number, velocityX = 0, velocityY = 0) {
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
    if (this._heldYam) {
      this._heldYam.setX(this.x);
      this._heldYam.setY(this.y + 20);
      this._heldYam.update();
    }

    [velocityX, velocityY] = this._addWobble(velocityX, velocityY)
    this.setVelocity(velocityX, velocityY);
  }

  private _flyToTarget(speed: number, velocityX = 0, velocityY = 0) {
    var distanceX;
    var distanceY
    var distance;

    if (this._target?.body) {
      distanceX = this._target?.x - this.x;
      distanceY = this._target?.y - this.y - 15;
      distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    } else {
      this._assignTarget()
    }


    if (distance && distanceX && distanceY) {
      if (distance > 25 || this._target?.name === 'Yam') {
        velocityX = (distanceX / distance) * speed;
        velocityY = (distanceY / distance) * speed;

      this.setSpriteDirection(velocityX)
      } else {
        const angle = Math.atan2(distanceY, distanceX) + Math.PI / 2;
        const orbitSpeed = 25;
        velocityX = Math.cos(angle) * orbitSpeed;
        velocityY = Math.sin(angle) * orbitSpeed;
        this.setSpriteDirection(velocityX)
      }
    }
    [velocityX, velocityY] = this._addWobble(velocityX, velocityY)
    this.setVelocity(velocityX, velocityY);
  }

  private _addWobble(velocityX: number, velocityY: number){
    this._wobbleOffset += 0.05; // Slower wobble speed for smoother motion
    const wobbleAmplitude = 30; // Reduced wobble amplitude for subtle effect
    velocityX += Math.sin(this._wobbleOffset) * wobbleAmplitude;
    velocityY += Math.cos(this._wobbleOffset) * wobbleAmplitude;
    return [velocityX, velocityY]
  }

  private _assignTarget(){
    const possibleYamTargets = this._gameScene.growingYams.filter((yam) => !yam.held && (yam.growthState === 'ripe' || yam.growthState === 'harvested'));
    const randomTargets = [this._gameScene.player, ...possibleYamTargets];
    const randomTarget = randomTargets[Phaser.Math.Between(0, randomTargets.length - 1)];
    this._target = randomTarget;
  }
}
