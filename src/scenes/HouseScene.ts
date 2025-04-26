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
    private _jr!: Jr
    public _isHomeInTimeForSupper = true;

    constructor() {
        super('HouseScene');
    }

    create () {
        this._createMapAndSetCamera()
        this.cameras.main.setBackgroundColor('black');

        const center = this.cameras.main.getWorldPoint(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );


        this._jr = new Jr(this, center.x, center.y + this._width * .04, this.dataStore.jrState)
        const bori = new Player(this, center.x - this._width * .14, center.y + this._width * .2)
        bori.setTexture('PlayerWalkBack', 2);

        this._setText()

        this.input.once('pointerdown', () => {
            // TODO: resume time
            this.clockPlugin.resumeAllEvents();
            this.scene.start('Game');
        });
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
        const farm = map.addTilesetImage('farm', 'tiles');
        if (!walls || !kitchen || !kitchenFurniture || !bathroom || !farm) return

        const offsetX = (this.cameras.main.width / this.cameras.main.zoom - this._width) / 2;
        const offsetY = (this.cameras.main.height / this.cameras.main.zoom - this._height) / 2;

        map.createLayer('layer1', [walls, kitchen, kitchenFurniture, bathroom, farm], offsetX, offsetY);
        map.createLayer('layer2', [walls, kitchen, kitchenFurniture, bathroom, farm], offsetX, offsetY);
        map.createLayer('layer3', [walls, kitchen, kitchenFurniture, bathroom, farm], offsetX, offsetY);

        this.cameras.main.setZoom(3);
      }

      private _setText() {
        const center = this.cameras.main.getWorldPoint(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );

        let jrText: string;
        if (this._isHomeInTimeForSupper) {
            jrText = this._jr.getHealthyDialogue();
        } else {
            jrText = this._jr.getCyborgDialogue();
        }

        const maxWidth = (this.cameras.main.width / this.cameras.main.zoom) + 400;

        // Create the text object
        this.title = this.add.text(center.x, center.y, jrText, {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: maxWidth }
        });
        this.title.setOrigin(0.5);
        this.title.setScale(0.25);

        // Move the text up a bit
        this.title.y -= 40;

        // Calculate bubble dimensions
        const padding = 10;
        const bubbleWidth = this.title.width * 0.25 + padding * 2;
        const bubbleHeight = this.title.height * 0.25 + padding * 2;
        const bubbleX = this.title.x - bubbleWidth / 2;
        const bubbleY = this.title.y - bubbleHeight / 2;

        // Create the speech bubble graphics
        const bubble = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.6 } });

        // Rounded rectangle
        bubble.fillRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);

        // Triangle "tail"
        const triangleWidth = 20;
        const triangleHeight = 10;
        bubble.fillTriangle(
            this.title.x - triangleWidth / 2, bubbleY + bubbleHeight,
            this.title.x + triangleWidth / 2, bubbleY + bubbleHeight,
            this.title.x, bubbleY + bubbleHeight + triangleHeight
        );

        // Group the bubble and text together
        this.add.container(0, 0, [bubble, this.title]);
    }

}
