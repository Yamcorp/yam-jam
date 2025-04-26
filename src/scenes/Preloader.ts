import { Scene } from 'phaser';

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
        this.load.image('tiles', 'atlas.png');
        this.load.image('door', 'door.png');
        this.load.image('jrdead', 'jr/jrdead.png')

        this.load.spritesheet('Crow', 'crow.png', {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet('PlayerWalkFront', 'player/player-walk-front.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('PlayerWalkBack', 'player/player-walk-back.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('PlayerWalkSide', 'player/player-walk-side.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('Yam', 'yam.png', {
            frameWidth: 16,
            frameHeight: 20,
        });
        this.load.spritesheet('Jr0', 'jr/jr0.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('Jr1', 'jr/jr1.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('Jr2', 'jr/jr2.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('Jr3', 'jr/jr3.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('Jr4', 'jr/jr4.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('Jr5', 'jr/jr5.png', {
            frameWidth: 32,
            frameHeight: 32
        })

        this.load.audio("sunset", "/audio/tok-tok-tok.mp3");
        this.load.audio("morning", "/audio/amogus-00.mp3");
        this.load.audio("running", "/audio/walking-00.mp3");
        this.load.audio("throw", "/audio/pull-00.mp3")
        this.load.audio("crow-hit", "/audio/quack.mp3");
        this.load.audio("harvest", "/audio/pull-01.mp3");
        this.load.audio("night", "/audio/crickets.mp3");
        this.load.audio("crow", "/audio/crow-03.mp3");
        this.load.audio("planting", "/audio/bamboo-hit.mp3");
        this.load.audio("game-over", "/audio/titanic-fail.mp3");
        this.load.audio("fart", "/audio/fart-00.mp3");

        this.load.tilemapTiledJSON('tilemap', 'maps/level.json');
        this.load.tilemapTiledJSON('house', 'maps/house.json');

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
        this.anims.create({
            key: 'jr0',
            frames: this.anims.generateFrameNumbers('Jr0', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'jr1',
            frames: this.anims.generateFrameNumbers('Jr1', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'jr2',
            frames: this.anims.generateFrameNumbers('Jr2', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'jr3',
            frames: this.anims.generateFrameNumbers('Jr3', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'jr4',
            frames: this.anims.generateFrameNumbers('Jr4', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });        this.anims.create({
            key: 'jr5',
            frames: this.anims.generateFrameNumbers('Jr5', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
