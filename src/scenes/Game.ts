import Player from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    private player: Player

    constructor ()
    {
        super('Game');
    }
    
    create ()
    {
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
        this.player = new Player(this)
    }

    update(_time: number, _delta: number): void {
      this.player.update()
      this.msg_text.setText(`Yams Remaining: ${this.dataStore.amountOfYams}`);
    }
  
}
