import Player from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow, CrowSpeed } from './characters/Crow';
import { GrownYam } from './interactables/GrownYam';
import { ThrownYam } from './interactables/ThrownYam';

export class Game extends BaseScene
{
  private _camera: Phaser.Cameras.Scene2D.Camera;
  private _background: Phaser.GameObjects.Image;
  private _crows: Crow[] = [];
  private _growingYams: GrownYam[] = [];
  private _thownYams: ThrownYam[] = [];
  private _player: Player
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

    this._player = new Player(this, this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2);
    this._camera.startFollow(this._player);

    for (let i = 0; i < Phaser.Math.Between(5, 10); i++) {
      const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
      const y = Phaser.Math.Between(0, this.physics.world.bounds.height);
      const yam = new GrownYam(this, x, y);
      this._growingYams.push(yam);
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
      const randomTargets = [this._player, ...this._growingYams];
      const randomTarget = randomTargets[Phaser.Math.Between(0, randomTargets.length - 1)];
      newCrow.setTarget(randomTarget);
      this._crows.push(newCrow);
    }
    this.time.addEvent({ delay: 2000, loop: true, callback: spawnCrow });
    
    
    this.listenForEvents();
    this.scene.launch('UIScene');
  }

  public update (_time: number, _delta: number): void {
    this._player.update()
    this._crows.forEach((crow) => crow.update());
  }

  private listenForEvents () {
    this.events.on('removeFromScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this._crows = this._crows.filter((crow) => crow !== entity);
      } else if (entity instanceof GrownYam) {
        this._growingYams = this._growingYams.filter((yam) => yam !== entity);
      } else if (entity instanceof ThrownYam) {
        this._thownYams = this._thownYams.filter((yam) => yam !== entity);
      }
    });

    this.events.on('addToScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this._crows.push(entity);
      } else if (entity instanceof GrownYam) {
        this._growingYams.push(entity);
      } else if (entity instanceof ThrownYam) {
        this._thownYams.push(entity);
        this.physics.add.overlap(entity, this._crows, (yam, crow) => {
          const crowInstance = crow as Crow;
          crowInstance.interact();
          yam.destroy();
        });
      }
    });
  }
}
