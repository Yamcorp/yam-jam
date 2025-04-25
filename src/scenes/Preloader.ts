import { Scene } from 'phaser';
import ClockSingleton from './Clock';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.spritesheet('Crow', 'crow.png', {
            frameWidth: 48,
            frameHeight: 48,
        });

        this.load.spritesheet('PlayerWalkFront', 'player-walk-front.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('PlayerWalkBack', 'player-walk-back.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('PlayerWalkSide', 'player-walk-side.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('Yam', 'yam.png', {
            frameWidth: 16,
            frameHeight: 20,
        });

        this.load.audio("fart-00", "/audio/fart-00.mp3");
        this.load.audio("yeet", "/audio/yeet.mp3");

        this.load.image('tiles', 'atlas.png');
        this.load.tilemapTiledJSON('tilemap', 'level.json');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        this.anims.create({
            key: 'crow-fly',
            frames: this.anims.generateFrameNumbers('Crow', { start: 8, end: 14 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-walk-front',
            frames: this.anims.generateFrameNumbers('PlayerWalkFront', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-walk-back',
            frames: this.anims.generateFrameNumbers('PlayerWalkBack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-walk-side',
            frames: this.anims.generateFrameNumbers('PlayerWalkSide', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
