import { GameObjects } from 'phaser';
import { BaseScene } from "./abstracts/BaseScene";
import { Jr } from './characters/Jr'
import { Player } from './characters/Player';
export class HouseScene extends BaseScene
{
    private title!: GameObjects.Text;
    private _map!: Phaser.Tilemaps.Tilemap
    private _width!: number
    private _height!: number

    constructor() {
        super('HouseScene');
    }

    create ()
    {
        this._createMapAndSetCamera()
        this.cameras.main.setBackgroundColor('black');

        const center = this.cameras.main.getWorldPoint(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );

        this.title = this.add.text(
            center.x,
            center.y,
            'Houcene',
            {
              fontFamily: 'Arial Black',
              fontSize: 20,
              color: '#ffffff',
              stroke: '#000000',
              strokeThickness: 4,
              align: 'center'
            }
        );

        this.title.setPosition(center.x, center.y)


        const jr = new Jr(this, center.x, center.y + this._width * .1, this.dataStore.jrState)
        const bori = new Player(this, center.x - this._width * .14, center.y + this._width * .22)
        bori.setTexture('PlayerWalkBack', 2);
    }

    private _createMapAndSetCamera() {
        const map = this.make.tilemap({ key: 'house' });
        if (!map) {
            console.log("No house map")
            return;
        } else {
            this._map = map
            this._width = map.widthInPixels
            this._height = map.heightInPixels
        }
          
        const walls = map.addTilesetImage('walls', 'walls');
        const kitchen = map.addTilesetImage('kitchen-items', 'kitchen-items');
        const kitchenFurniture = map.addTilesetImage('kitchen', 'kitchen');
        const bathroom = map.addTilesetImage('bathroom', 'bathroom');
        if (!walls || !kitchen || !kitchenFurniture || !bathroom) return
      
        const offsetX = (this.cameras.main.width / this.cameras.main.zoom - this._width) / 2;
        const offsetY = (this.cameras.main.height / this.cameras.main.zoom - this._height) / 2;

        map.createLayer('layer1', [walls, kitchen, kitchenFurniture, bathroom], offsetX, offsetY);
        map.createLayer('layer2', [walls, kitchen, kitchenFurniture, bathroom], offsetX, offsetY);
        map.createLayer('layer3', [walls, kitchen, kitchenFurniture, bathroom], offsetX, offsetY);

        this.cameras.main.setZoom(4);
      }
}
