import Player from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow, CrowSpeed } from './characters/Crow';
import { GrownYam } from './interactables/GrownYam';
import { ThrownYam } from './interactables/ThrownYam';

export class Game extends BaseScene
{
  public growingYams: GrownYam[] = [];
  public throwingYams: ThrownYam[] = [];
  public player: Player
  private _camera: Phaser.Cameras.Scene2D.Camera;
  private _background: Phaser.GameObjects.Image;
  private _crows: Crow[] = [];
  private _worldWidth = 1024;
  private _worldHeight = 1024;

  constructor () {
    super('Game');
  }

  public create () {
    this.cameras.main.setBounds(0, 0, this._worldWidth, this._worldHeight);
    this._camera = this.cameras.main;
    this._camera.setBackgroundColor(0x00ff00);
    
    this.physics.world.setBounds(0, 0, this._worldWidth, this._worldHeight);
    
    this._background = this.add.image(512, 384, 'background');
    this._background.setAlpha(0.5);

    this.player = new Player(this, this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2);
    this._camera.startFollow(this.player);

    // Spawn a bunch of yams randomly
    for (let i = 0; i < Phaser.Math.Between(5, 10); i++) {
      const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
      const y = Phaser.Math.Between(0, this.physics.world.bounds.height);
      const yam = new GrownYam(this, x, y, 'ripe');
      this.growingYams.push(yam);
    }

    // Function to spawn a Crow every 2 seconds
    //  Randomly select a speed from the array
    //  Randomly select a target from the array of targets
    //  Add the new Crow to the scene and the _crows array
    const spawnCrow = () => {
      const speeds: CrowSpeed[] = ['slow', 'medium', 'fast'];
      const randomSpeed = speeds[Phaser.Math.Between(0, speeds.length - 1)];
      const edge = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
      let x = 0, y = 0;

      switch (edge) {
        case 0: // Top
          x = Phaser.Math.Between(0, this.physics.world.bounds.width);
          y = -50;
          break;
        case 1: // Right
          x = this.physics.world.bounds.width + 50;
          y = Phaser.Math.Between(0, this.physics.world.bounds.height);
          break;
        case 2: // Bottom
          x = Phaser.Math.Between(0, this.physics.world.bounds.width);
          y = this.physics.world.bounds.height + 50;
          break;
        case 3: // Left
          x = -50;
          y = Phaser.Math.Between(0, this.physics.world.bounds.height);
          break;
      }

      const newCrow = new Crow(this, x, y, randomSpeed);
      const unheldYams = this.growingYams.filter((yam) => !yam.held);
      const randomTargets = [this.player, ...unheldYams];
      const randomTarget = randomTargets[Phaser.Math.Between(0, randomTargets.length - 1)];
      newCrow.setTarget(randomTarget);


      // Add a collision between the New Crow and all Growing Yams
      this.physics.add.overlap(newCrow, this.growingYams, (crow, yam) => {
        const yamInstance = yam as GrownYam;
        // If the Yam is already held do nothing
        if (yamInstance.held) return
        const crowInstance = crow as Crow;
        // Have the Crow grab the Yam
        if (crowInstance.y < yamInstance.y - 20) {
          crowInstance.isOverYam = true;
          crowInstance.crowSpeed = 'hover';
          this.time.delayedCall(Phaser.Math.Between(759, 1000), () => {
            crowInstance.grabYam(yamInstance);
            crowInstance.isOverYam = false;
            crowInstance.crowSpeed = 'slow';
          })
        }
        // Iterate through all the crows and if any of them are targeting this yam
        //    they should start targeting a new yam
        this._crows.forEach((crow) => {
          if (crow === crowInstance) return
          if (crow.target === yamInstance) {
            const unheldYams = this.growingYams.filter((y) => !y.held && y !== yamInstance);
            const potentialNewTargets = [this.player, ...unheldYams];
            if (potentialNewTargets.length > 0) {
              const newTarget = potentialNewTargets[Phaser.Math.Between(0, potentialNewTargets.length - 1)]
              crow.setTarget(newTarget);
            }
          }
        })
      });
    this._crows.push(newCrow);
    }
    this.time.addEvent({ delay: 2000, loop: true, callback: spawnCrow });

    this._listenForEvents();
    this.scene.launch('UIScene');
  }

  public update (_time: number, _delta: number): void {
    this.player.update()
    this._crows.forEach((crow) => crow.update());
  }

  private _listenForEvents () {
    this.events.on('removeFromScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this._crows = this._crows.filter((crow) => crow !== entity);
      } else if (entity instanceof GrownYam) {
        this.growingYams = this.growingYams.filter((yam) => yam !== entity);
      } else if (entity instanceof ThrownYam) {
        this.throwingYams = this.throwingYams.filter((yam) => yam !== entity);
      }
    });

    this.events.on('addToScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this._crows.push(entity);
      } else if (entity instanceof GrownYam) {
        this.growingYams.push(entity);
      } else if (entity instanceof ThrownYam) {
        this.throwingYams.push(entity);
        this.physics.add.overlap(entity, this._crows, (yam, crow) => {
          const crowInstance = crow as Crow;
          crowInstance.interact();
          yam.destroy();
        });
      }
    });
  }
}
