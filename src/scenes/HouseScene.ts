import { Scene, GameObjects } from 'phaser';

export class HouseScene extends Scene
{
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('HouseScene');
    }

    create ()
    {
        this._createMap()

        this.title = this.add.text(512, 460, 'House Scene', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    private _createMap() {
        const map = this.make.tilemap({ key: 'house' });
        if (!map) return;
    
        this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
      
        const walls = map.addTilesetImage('walls', 'tiles', 16);
        const kitchen = map.addTilesetImage('kitchen-items', 'tiles', 8);
        const kitchenFurniture = map.addTilesetImage('kitchen', 'tiles', 16);
        const bathroom = map.addTilesetImage('bathroom', 'tiles', 16);
        if (!walls || !kitchen || !kitchenFurniture || !bathroom) return
      
        map.createLayer('layer1', [walls, kitchen, kitchenFurniture, bathroom], 0, 0);
        map.createLayer('layer2', [walls, kitchen, kitchenFurniture, bathroom], 0, 0);
        map.createLayer('layer3', [walls, kitchen, kitchenFurniture, bathroom], 0, 0);
      }
}
