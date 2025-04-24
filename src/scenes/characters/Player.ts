import { Game } from '../Game'
import { GrownYam } from '../interactables/GrownYam'
import { ThrownYam } from '../interactables/ThrownYam'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private _wasd?: { [key: string]: Phaser.Input.Keyboard.Key }
  private _speed: number
  private _gameScene: Game
  private _lastDirection: 'front' | 'back' | 'left' | 'right' = 'front';
  private _interactZone!: Phaser.GameObjects.Zone;

  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'Player')

    this._gameScene = scene as Game

    this._gameScene.add.existing(this)
    this._gameScene.physics.add.existing(this)

    this._cursors = this._gameScene.input.keyboard?.createCursorKeys()
    this._wasd = this._gameScene.input.keyboard?.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key }

    this._speed = 150

    this.gameScene.input.on('pointerdown', this.throwYam, this);

    this._gameScene.input.keyboard?.on('keydown-E', this.interact, this);
    this._gameScene.input.keyboard?.on('keydown-I', this.growAllYams, this);


    this._interactZone = this.scene.add.zone(this.x, this.y + 16, 16, 16);
    this.scene.physics.add.existing(this._interactZone);
    (this._interactZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this._interactZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
  }

  public get gameScene (): Game {
    return this._gameScene;
  }

  public override update () {
    const direction = new Phaser.Math.Vector2(0, 0);

    let moving = false;

    let animation: string | null = null
    if (this._cursors?.left.isDown || this._wasd?.left.isDown) {
      direction.x -= 1
      animation = 'player-walk-side'
      this.setFlipX(true)
      this._lastDirection = 'left'
      this._interactZone?.setPosition(this.x - 16, this.y + 8);
      console.log('this.y: ', this.y)
      console.log('this.x: ', this.x)
      console.log('this.width: ', this.width)
      console.log('this.height: ', this.height)
      moving = true;
    }
    if (this._cursors?.right.isDown || this._wasd?.right.isDown) {
      direction.x += 1
      animation = 'player-walk-side'
      this.setFlipX(false)
      this._lastDirection = 'right'
      this._interactZone?.setPosition(this.x + 16, this.y + 8);
      moving = true;
    } 
    if (this._cursors?.up.isDown || this._wasd?.up.isDown) {
      direction.y -= 1
      animation = 'player-walk-back'
      this._lastDirection = 'back'
      this._interactZone?.setPosition(this.x, this.y - 8);
      moving = true;
    } 
    if (this._cursors?.down.isDown || this._wasd?.down.isDown) {
      direction.y += 1
      animation = 'player-walk-front'
      this._lastDirection = 'front'
      this._interactZone?.setPosition(this.x, this.y + 24);
      moving = true;
    }

    if (!moving) {
      this.anims.stop();
      switch (this._lastDirection) {
        case 'front':
          this.setTexture('PlayerWalkFront', 2);
          this._interactZone?.setPosition(this.x, this.y + 24);

          break;
        case 'back':
          this.setTexture('PlayerWalkBack', 2);
          this._interactZone?.setPosition(this.x, this.y - 8);

          break;
        case 'left':
          this.setTexture('PlayerWalkSide', 4);
          break;
        case 'right':
          this.setTexture('PlayerWalkSide', 4);
          break;
      }
    } else if (animation) {
      this.anims.play(animation, true)
    }

    direction.normalize().scale(this._speed)
    this.setVelocity(direction.x, direction.y)
    // Use collider to constrain the player 
    // to the world's bounds
    this.setCollideWorldBounds(true);
  }

  public throwYam() {
    if (this.gameScene.dataStore.amountOfYams <= 0) {
      return;
    }
    this.gameScene.dataStore.decreaseYams();
    const yam = new ThrownYam(this.gameScene, this.x, this.y);
    this.gameScene.events.emit('addToScene', yam);
    yam.create();
  }

  public interact() {
    // check if by a ripe yam, and if so harvest some yams
    for (let i=0; i<this.gameScene.growingYams.length; i++){
      const yam = this.gameScene.growingYams[i]
      if (this.harvestYam(yam)) {
        return;
      }
    }

    // otherwise if you have a yam in inventory plant one in front of you
    if (this.gameScene.dataStore.amountOfYams > 0) {
      this.plantYam();
      return;
    }
  }

  private harvestYam(yam: GrownYam) {
    if (this.gameScene.physics.overlap(this._interactZone, yam) && yam.growthState === 'ripe' || yam.growthState === 'harvested') {
      yam.destroy()
      let randomNumber = undefined
      yam.growthState === 'harvested' ? randomNumber = 1 : randomNumber = Math.round(Math.random() * 6);
      this.gameScene.dataStore.increaseYams(randomNumber);
      return true;
    }
  }

  private plantYam() {
    this.gameScene.dataStore.decreaseYams();
    let x = this.body?.center.x;
    let y = this.body?.center.y;
    
    if (!x || !y) return;

    switch (this._lastDirection) {
      case 'front':
        y += 50;
        break;
      case 'left':
        x -= 30;
        break;
      case 'right':
        x += 30;
        break;
      case 'back':
        y -= 50;
        break;
    }

    // Convert world coordinates to tile coordinates
    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);

    // Check if tile is in bounds and available for planting
    const tile = this.gameScene.yamZoneTiles?.[tileY]?.[tileX];
    if (!tile || tile.yam === true) return;

    // Center plant on tile
    const worldX = tileX * 16 + 16 / 2;
    const worldY = tileY * 16 + 16 / 2;

    console.log("worldX, worldY", worldX, worldY)

    const yam = new GrownYam(this.gameScene, worldX, worldY, 'seed');
    this.gameScene.growingYams.push(yam);

    // Mark tile as used
    tile.yam = true;
  }

  public override destroy() {
    this.gameScene.events.emit("removeFromScene", this)
    super.destroy()
  }

    // this function just exists for now to show what the growth cycle looks like
  // TODO: disable
  private growAllYams(): void{
    const unripeYams = this.gameScene.growingYams.filter(
      (yam) => yam.growthState === 'seed' || yam.growthState === 'sprout'
    ) 
    unripeYams.forEach((yam) => yam.growYam());
  }
}
