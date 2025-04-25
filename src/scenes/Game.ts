import { Player } from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow } from './characters/Crow';
import { GrownYam, YamTile } from './interactables/GrownYam';
import { ThrownYam } from './interactables/ThrownYam';
import { Door } from './interactables/Door'
export class Game extends BaseScene
{
  public growingYams: GrownYam[] = [];
  public throwingYams: ThrownYam[] = [];
  public Crows: Crow[] = [];
  private _camera: Phaser.Cameras.Scene2D.Camera | undefined;
  private _collisionLayer!: Phaser.Tilemaps.TilemapLayer
  private _map!: Phaser.Tilemaps.Tilemap
  public _tileset!: string | Phaser.Tilemaps.Tileset | string[] | Phaser.Tilemaps.Tileset[]
  public yamZoneTiles: YamTile[] = []
  public door!: Door


  constructor () {
    super('Game');
  }

  public create () {
    this._createMap()
    this._camera = this.cameras.main;
    this._camera.setZoom(2);

    this.player = new Player(this, this._map.widthInPixels/ 60 * 51, this._map.heightInPixels / 60 * 13);

    this.player.setBodySize(this.player.width / 2, this.player.height / 2); // set hitbox dimensions
    this.player.setOffset(this.player.width / 4, this.player.height / 2); 
    
    this._map.createLayer('top layer', this._tileset, 0, 0);
    this._registerZones()
    this.cameras.main.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels);
    this._camera.startFollow(this.player);

    this.door = new Door(this, 816, 152)

    this._initializeYams()

    // Function to spawn a Crow every 2 seconds
    //  Add the new Crow to the scene and the Crows array
    const spawnCrow = () => {
      const edge = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
      let x = 0, y = 0;

      switch (edge) {
        case 0: // Top
          x = Phaser.Math.Between(0, this.physics.world.bounds.width);
          y = -50;
          break;
        case 1: // Right
          x = this.physics.world.bounds.width + 50;
          y = Phaser.Math.Between(0, this.physics.world.bounds.height);
          break;
        case 2: // Bottom
          x = Phaser.Math.Between(0, this.physics.world.bounds.width);
          y = this.physics.world.bounds.height + 50;
          break;
        case 3: // Left
          x = -50;
          y = Phaser.Math.Between(0, this.physics.world.bounds.height);
          break;
      }

      const newCrow = new Crow(this, x, y);
      this.Crows.push(newCrow);
    }

    this.time.addEvent({ delay: 2000, loop: true, callback: spawnCrow });
    this._listenForEvents();
    this.scene.launch('UIScene');
  }

  public override update (_time: number, _delta: number): void {
    this.player?.update()
    this.Crows.forEach((crow) => crow.update());
    this.growingYams.forEach((yam) => yam.update());
    this.door.update()
  }

  private _listenForEvents () {
    this.events.on('removeFromScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this.Crows = this.Crows.filter((crow) => crow !== entity);
      } else if (entity instanceof GrownYam) {
        this.growingYams = this.growingYams.filter((yam) => yam !== entity);
      } else if (entity instanceof ThrownYam) {
        this.throwingYams = this.throwingYams.filter((yam) => yam !== entity);
      }
    });

    this.events.on('addToScene', (entity: Crow | GrownYam | ThrownYam) => {
      if (entity instanceof Crow) {
        this.Crows.push(entity);
      } else if (entity instanceof GrownYam) {
        this.growingYams.push(entity);
      } else if (entity instanceof ThrownYam) {
        this.throwingYams.push(entity);
        this.physics.add.overlap(entity, this.Crows, (yam, crow) => {
          const crowInstance = crow as Crow;
          crowInstance.interact();
          yam.destroy();
        });
      }
    });
  }

  private _createMap() {
    const map = this.make.tilemap({ key: 'tilemap' });
    if (!map) return;
    else this._map = map;

    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
  
    const tileset = map.addTilesetImage('atlas', 'tiles');
    if (!tileset) return
    else this._tileset = tileset
  
    map.createLayer('ground layer', tileset, 0, 0);
    map.createLayer('world layer', tileset, 0, 0);
    map.createLayer('world layer 2', tileset, 0, 0);
  }

  private _registerZones() {
    const collisionLayer = this._map.createLayer('collision', this._tileset, 0, 0);
    if (!collisionLayer) return;
  
    collisionLayer.setCollision([1768]);
    collisionLayer.setVisible(false); // Hide layer
  
    this._collisionLayer = collisionLayer;
  
    if (this.player) {
      this.physics.add.collider(this.player, this._collisionLayer);
    }
  }

  private _initializeYams() {
    // Spawn a bunch of yams randomly

    const yamZoneLayer = this._map.createLayer('yam zone', this._tileset, 0, 0);
    if (!yamZoneLayer) {
      console.log("yamZoneLayer error loading")
      return
    }
    yamZoneLayer.setVisible(false); // Hide layer

    // UNCOMMENT TO SEE YAMZONE LAYER (AND UNCOMMENT GRAPHICS STROKE BELLOW)
    // const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xff0000 } });
    yamZoneLayer.forEachTile((tile) => {
      if (tile.index === 1768) {
        const tileX = tile.getLeft() / 16; // Tile X-index in the world map
        const tileY = tile.getTop() / 16; // Tile Y-index in the world map
        
        // UNCOMMENT TO SEE YAMZONE LAYER (AND UNCOMMENT GRAPHICS DECLARATION ABOVE)
        // graphics.strokeRect(tile.getCenterX() - (tile.width / 2), tile.getCenterY() - (tile.height / 2), tile.width, tile.height);

        this.yamZoneTiles.push({ x: tileX, y: tileY, hasYam: false });
      }
    });

    const spawnCount = 7;
    for (let i = 0; i < spawnCount && this.yamZoneTiles.length > 0; i++) {

      const tile = Phaser.Utils.Array.GetRandom(this.yamZoneTiles);
      tile.hasYam = true
      const yam = new GrownYam(this, tile.x * 16 + 8, tile.y * 16 + 8, 'ripe');
      this.growingYams.push(yam);
    }
  }
}
