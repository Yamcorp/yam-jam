import { GameObjects } from 'phaser';
import { BaseScene } from "./abstracts/BaseScene";
import { Jr } from './characters/Jr'
export class HouseScene extends BaseScene
{
    private title!: GameObjects.Text;
    private _width!: number
    private _height!: number
    private _jr!: Jr
    private _initTextIndex = 0;
    private _initTextEntries: string[] = [];
    private _initTextObj!: Phaser.GameObjects.Text;
    private _initBubble!: Phaser.GameObjects.Graphics;

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
        const boriSprite = new Phaser.Physics.Arcade.Sprite(
            this,
            center.x - this._width * .14,
            center.y + this._width * .2,
            'PlayerWalkBack',
            2
        )
        boriSprite.setTexture('PlayerWalkBack', 2);
        this.add.existing(boriSprite);

        this._addInitText();
    }

    private _createMapAndSetCamera() {
        const map = this.make.tilemap({ key: 'house' });
        if (!map) {
            console.log("No house map")
            return;
        } else {
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


    // ########################
    //   HAND MAIN TEXT SECTION
    // #########################
    private _addInitText() {
        if (this._initTextObj) return; // prevent multiple calls
      
        if (this.dataStore.isHomeInTime) {
          this._initTextEntries = [
            `Yamco let you keep your house after you paid ${this.dataStore.prevYamsNeeded} yams in rent.`,
            `Your yam quota for tomorrow's rent is ${this.dataStore.yamsNeeded} yams.`,
            `You finished the day with enough time to spend the evening with your kid.`,
          ];
        } else {
          this._initTextEntries = [
            `You wake up with no memory of how you got home. You find ${this.dataStore.prevYamsNeeded} yams missing.`,
            `You find a note saying you paid the yam man, and the yam quota for tomorrow's rent is ${this.dataStore.yamsNeeded}.`,
            `As you wander into the kitchen, your kid looks up from his tube plug. What is he doing up at this hour?`,
          ];
        }
      
        const center = this.cameras.main.getWorldPoint(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2
        );
      
        const maxWidth = (this.cameras.main.width / this.cameras.main.zoom) + 400;
      
        this._initTextObj = this.add.text(center.x, center.y, this._initTextEntries[0], {
          fontFamily: 'Arial Black',
          fontSize: 35,
          color: 'dark grey',
          stroke: '#000000',
          strokeThickness: 0,
          align: 'center',
          wordWrap: { width: maxWidth },
        }).setScale(0.01);
        this._initTextObj.setOrigin(0.5);
        this._initTextObj.setScale(0.25);
        this._initTextObj.y -= 60;
      
        const padding =15;
        const bubbleWidth = this._initTextObj.width * 0.25 + padding * 2;
        const bubbleHeight = this._initTextObj.height * 0.25 + padding * 2;
        const bubbleX = this._initTextObj.x - bubbleWidth / 2;
        const bubbleY = this._initTextObj.y - bubbleHeight / 2;
      
        this._initBubble = this.add.graphics();
        this._initBubble.lineStyle(4, 0x000000);
        this._initBubble.fillStyle(0xf0f0f0, 1);
        this._initBubble.fillRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
        this._initBubble.strokeRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
      
        this.add.container(0, 0, [this._initBubble, this._initTextObj]);
      
        // Setup input listener
        this.input.keyboard?.on('keydown-E', this._cycleInteractions, this);
        this.input.on('pointerdown', this._cycleInteractions, this);
      }
      
      private _cycleInteractions() {
        if (!this._initTextObj) return;
    
        if (this._initTextIndex < this._initTextEntries.length - 1) {
            // Advance to next init text
            this._initTextIndex++;
            this._initTextObj.setText(this._initTextEntries[this._initTextIndex]);
            this._initTextObj.setScale(1).setScale(0.25); // Force Phaser to recalculate width/height

            // Resize bubble
            const padding = 15;
            const bubbleWidth = this._initTextObj.width * 0.25 + padding * 2;
            const bubbleHeight = this._initTextObj.height * 0.25 + padding * 2;
            const bubbleX = this._initTextObj.x - bubbleWidth / 2;
            const bubbleY = this._initTextObj.y - bubbleHeight / 2;
    
            this._initBubble.clear();
            this._initBubble.lineStyle(4, 0x000000);
            this._initBubble.fillStyle(0xf0f0f0, 1);
            this._initBubble.fillRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
            this._initBubble.strokeRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
            
    
        } else {
            // Finished all init text
            this.input.keyboard?.off('keydown-E', this._cycleInteractions, this);
            this.input.off('pointerdown', this._cycleInteractions, this);
    
            this._initTextObj.destroy();
            this._initBubble.destroy();
    
            this._addJrText();
    
            // New input handler for starting the game after Jr's text
            this.input.keyboard?.once('keydown-E', () => this.scene.start('Game'));
            this.input.once('pointerdown', () =>
              this.scene.start('Game'));
        }
    }
    


    // ########################
    //  HANDLE JR TEXT SECTION
    // #########################
      private _addJrText() {
        const center = this.cameras.main.getWorldPoint(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );
    
        let jrText: string;
        if (this.dataStore.isHomeInTime) {
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
