import { Player } from './characters/Player';
import { BaseScene } from './abstracts/BaseScene';
import { Crow } from './characters/Crow';
import { GrownYam } from './interactables/GrownYam';
import { ThrownYam } from './interactables/ThrownYam';

export class Game extends BaseScene
{
  public growingYams: GrownYam[] = [];
  public throwingYams: ThrownYam[] = [];
  public player: Player | undefined
  public Crows: Crow[] = [];
  private _camera: Phaser.Cameras.Scene2D.Camera | undefined;
  private _collisionLayer!: Phaser.Tilemaps.TilemapLayer
  private _map!: Phaser.Tilemaps.Tilemap
  private _tileset!: string | Phaser.Tilemaps.Tileset | string[] | Phaser.Tilemaps.Tileset[]
  private _yamZone!: Phaser.GameObjects.Zone

  constructor () {
    super('Game');
  }

  public create () {
    this._createMap()
    this._camera = this.cameras.main;

    this.player = new Player(this, this._map.widthInPixels/ 30 * 51, this._map.heightInPixels / 30 * 13);
    this.player.setBodySize(this.player.width / 2, this.player.height / 2); // set hitbox dimensions
    this.player.setOffset(this.player.width / 4, this.player.height / 2)    //offset hitbox
    
    this._map.createLayer('top layer', this._tileset, 0, 0)?.setScale(2);
    this._registerZones()
    this._camera.startFollow(this.player);

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
  
    map.createLayer('ground layer', tileset, 0, 0)?.setScale(2);
    map.createLayer('world layer', tileset, 0, 0)?.setScale(2);
    map.createLayer('world layer 2', tileset, 0, 0)?.setScale(2);
    map.createLayer('door closed', tileset, 0, 0)?.setScale(2);

  }

  private _registerZones() {
    const collisionLayer = this._map.createLayer('collision', this._tileset, 0, 0)?.setScale(2);
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

    const zoneX = this._map.widthInPixels/30 * 4
    const zoneY = this._map.widthInPixels/30 * 3
    const zoneWidth = this._map.widthInPixels/30 * (56 * 2);
    const zoneHeight = this._map.widthInPixels/30 * (35 * 2);

    const yamzoneLayer = this._map.getLayer('yam zone')?.tilemapLayer;
    if (!yamzoneLayer) return;
  
    this._yamZone = this.add.zone(zoneX, zoneY, zoneWidth, zoneHeight).setOrigin(0).setScale(2);

    for (let i = 0; i < Phaser.Math.Between(5, 10); i++) {
      const x = Phaser.Math.Between(0, zoneWidth);
      const y = Phaser.Math.Between(0, zoneHeight);
      const yam = new GrownYam(this, x, y, 'ripe');
      this.growingYams.push(yam);
    }
  }
}
