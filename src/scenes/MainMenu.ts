import { Scene, GameObjects } from 'phaser';

const TITLE_TEXT = `YAMBORI`;
const SUBTITLE_TEXT = 'Click to Start';
const CONTROLS_TEXT = 'Controls: Arrow keys to move, Mouse to aim and throw, E to plant and harvest yams';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Text;
    title: GameObjects.Text;
    controls: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.text(512, 300, TITLE_TEXT, {
            fontFamily: 'Arial Black', fontSize: 78, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.logo.setShadow(4, 2, '#000000', 0, true, true );
        // this.logo.setInteractive();

        this.title = this.add.text(512, 460, SUBTITLE_TEXT, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.controls = this.add.text(512, 630, CONTROLS_TEXT, {
            fontFamily: 'Arial Black', fontSize: 12, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
