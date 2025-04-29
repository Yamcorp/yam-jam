import { Scene, GameObjects } from 'phaser';

const TOP_TEXT = `You are Bori, a yam farmer under the Yamco galactic hegemony.`;

const BOTTOM_TEXT = `You must grow and defend your yams to not only provide for yourself and your child--but also to meet your Yamco daily quota.
Nurture your yams and your progeny, lest the Yamco automatons spiritually and physically corrupt your sole begotten.
Can you balance the needs of your family and the demands of Yamco?`;

const CONTINUE_TEXT = `Click to continue... 🍠`;

export class StoryScene extends Scene
{
    background: GameObjects.Image;
    story: GameObjects.Text;

    constructor ()
    {
        super('StoryScene');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.story = this.add.text(512, 330, TOP_TEXT, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center', wordWrap: { width: 600, useAdvancedWrap: true },
        }).setOrigin(0.5);

        this.story = this.add.text(512, 420, BOTTOM_TEXT, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center', wordWrap: { width: 600, useAdvancedWrap: true },
        }).setOrigin(0.5);

        this.story = this.add.text(512, 630, CONTINUE_TEXT, {
            fontFamily: 'Arial Black', fontSize: 12, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center', wordWrap: { width: 600, useAdvancedWrap: true },
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
