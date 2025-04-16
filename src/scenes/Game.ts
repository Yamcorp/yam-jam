import Player from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow, CrowSpeed } from './characters/Crow';
import { GrownYam } from './interactables/GrownYam';
import { ThrownYam } from './interactables/ThrownYam';

export class Game extends BaseScene
{
  private _camera: Phaser.Cameras.Scene2D.Camera;
  private _background: Phaser.GameObjects.Image;
  private _msg_text : Phaser.GameObjects.Text;
  private _crows: Crow[] = [];
  private _growingYams: GrownYam[] = [];
  private _thownYams: ThrownYam[] = [];
  private _player: Player

  constructor () {
    super('Game');
  }

  public create () {
    this._camera = this.cameras.main;
    this._camera.setBackgroundColor(0x00ff00);
  
    this._background = this.add.image(512, 384, 'background');
    this._background.setAlpha(0.5);

    this._msg_text = this.add.text(250, 30, `Yams Remaining: ${this.dataStore.amountOfYams}`, {
        fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    });
    this._msg_text.setOrigin(0.5);
    this._player = new Player(this, this.scale.width / 2, this.scale.height / 2);
    const crow = new Crow(this, 100, 100, 'fast');
    crow.setTarget(this._player);
    this._crows.push(crow);
    const yam = new GrownYam(this, 200, 200);
    this._growingYams.push(yam);

    const spawnCrow = () => {
      const speeds: CrowSpeed[] = ['slow', 'medium', 'fast'];
      const randomSpeed = speeds[Phaser.Math.Between(0, speeds.length - 1)];
      const newCrow = new Crow(this, Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), randomSpeed);
      const randomTargets = [this._player, ...this._growingYams];
      const randomTarget = randomTargets[Phaser.Math.Between(0, randomTargets.length - 1)];
      newCrow.setTarget(randomTarget);
      this._crows.push(newCrow);
    }
    this.listenForEvents();

    this.time.addEvent({ delay: 2000, loop: true, callback: spawnCrow });
  }

  public update (_time: number, _delta: number): void {
    this._player.update()
    this._crows.forEach((crow) => crow.update());
    this._msg_text.setText(`Yams Remaining: ${this.dataStore.amountOfYams}`);
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
