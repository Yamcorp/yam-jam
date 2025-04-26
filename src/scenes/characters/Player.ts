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

  /**
   * Audio
   */
  private _runSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private _throwSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private _harvestSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private _plantSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;


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

    this._runSound = this._gameScene.sound.add("running", { volume: 0.35, loop: true });
    this._throwSound = this._gameScene.sound.add("throw", { volume: 0.3 });
    this._harvestSound = this._gameScene.sound.add("harvest", { volume: 0.22 });
    this._plantSound = this._gameScene.sound.add("planting", { volume: 0.20 });
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
          this._interactZone?.setPosition(this.x - 16, this.y + 8);
          break;
        case 'right':
          this.setTexture('PlayerWalkSide', 4);
          this._interactZone?.setPosition(this.x + 16, this.y + 8);
          break;
      }
      if (this._runSound.isPlaying) {
        this._runSound.stop();
      }
    } else if (animation) {
      this.anims.play(animation, true)
      if (!this._runSound.isPlaying) {
        this._runSound.play('', { detune: Math.floor(Math.random() * 601) - 300 });
      }
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
    this._throwSound.play();
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

    // else if by the door, open or close the door
    if (this.gameScene.door.playerNear) {
      this.gameScene.door.interact()
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
      this._harvestSound.play();
      this.gameScene.dataStore.increaseYams(randomNumber);
      return true;
    }
  }

  private plantYam() {
    let x = this._interactZone?.x; // get players interact zone location (I think x is the middle)
    let y = this._interactZone?.y; // get players interact zone location

    if (!x || !y) return;

    // Convert world coordinates units to tile units
    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);

    console.log("tileX, tileY", tileX, tileY)
    // Check if tile is in bounds and available for planting
    const tile = this.gameScene.yamZoneTiles.find((tile) => tile.x === tileX && tile.y === tileY);
    if (!tile) {
      console.log("cant plant here")
      return;
    }
    else if (tile.hasYam) {
      console.log("already a yam here")
      return;
    }


    // Center plant on tile
    const worldX = tileX * 16 + 8;
    const worldY = tileY * 16 + 8;

    const yam = new GrownYam(this.gameScene, worldX, worldY, 'seed');
    this.gameScene.growingYams.push(yam);

    // Mark tile as used
    tile.hasYam = true;
    this._plantSound.play();
    this.gameScene.dataStore.decreaseYams();
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
