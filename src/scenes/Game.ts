import Player from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow, CrowSpeed } from './characters/Crow';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    crows: Crow[] = [];
    private player: Player

    constructor () {
      super('Game');
    }

    create () {
        // this.physics.world.gravity.y = 0;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(250, 30, `Yams Remaining: ${this.dataStore.amountOfYams}`, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        const crow = new Crow(this, 100, 100, 'fast');
        crow.setTarget(this.player);
        this.crows.push(crow);

        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
            const speeds: CrowSpeed[] = ['slow', 'medium', 'fast'];
            const randomSpeed = speeds[Phaser.Math.Between(0, speeds.length - 1)];
            const newCrow = new Crow(this, Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), randomSpeed);
          newCrow.setTarget(this.player);
          this.crows.push(newCrow);
            }
        });
    }

    update(_time: number, _delta: number): void {
      this.player.update()
      this.crows.forEach(crow => crow.update());
      this.msg_text.setText(`Yams Remaining: ${this.dataStore.amountOfYams}`);
    }
  
}
