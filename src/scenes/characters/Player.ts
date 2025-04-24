import { Game } from '../Game'
import { GrownYam } from '../interactables/GrownYam'
import { ThrownYam } from '../interactables/ThrownYam'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private _wasd?: { [key: string]: Phaser.Input.Keyboard.Key }
  private _speed: number
  private _gameScene: Game
  private _lastDirection: 'front' | 'back' | 'left' | 'right' = 'front';

  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'Player')
    this._gameScene = scene as Game

    this.setScale(2)
    this._gameScene.add.existing(this)
    this._gameScene.physics.add.existing(this)
    this.body?.setSize(16, 16) // the collision shape is now too big

    this._cursors = this._gameScene.input.keyboard?.createCursorKeys()
    this._wasd = this._gameScene.input.keyboard?.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key }

    this._speed = 250

    this.gameScene.input.on('pointerdown', this.throwYam, this);

    this._gameScene.input.keyboard?.on('keydown-E', this.interact, this);
    this._gameScene.input.keyboard?.on('keydown-I', this.growAllYams, this);

  }

  public get gameScene (): Game {
    return this._gameScene;
  }

  public override update () {
    const direction = new Phaser.Math.Vector2(0, 0)
    let moving = false;

    let animation: string | null = null
    if (this._cursors?.left.isDown || this._wasd?.left.isDown) {
      direction.x -= 1
      animation = 'player-walk-side'
      this.setFlipX(true)
      this._lastDirection = 'left'
      moving = true;
    }
    if (this._cursors?.right.isDown || this._wasd?.right.isDown) {
      direction.x += 1
      animation = 'player-walk-side'
      this.setFlipX(false)
      this._lastDirection = 'right'
      moving = true;
    } 
    if (this._cursors?.up.isDown || this._wasd?.up.isDown) {
      direction.y -= 1
      animation = 'player-walk-back'
      this._lastDirection = 'back'
      moving = true;
    } 
    if (this._cursors?.down.isDown || this._wasd?.down.isDown) {
      direction.y += 1
      animation = 'player-walk-front'
      this._lastDirection = 'front'
      moving = true;
    }

    if (!moving) {
      this.anims.stop();
      switch (this._lastDirection) {
        case 'front':
          this.setTexture('PlayerWalkFront', 2);
          break;
        case 'back':
          this.setTexture('PlayerWalkBack', 2);
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
    if (this.gameScene.physics.overlap(this, yam.pickUpZone) && yam.growthState === 'ripe' || yam.growthState === 'harvested') {
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
    
    if (!x || !y) return

    switch (this._lastDirection) {
      case 'front':  
        y += 50
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

    let yam = new GrownYam(this.gameScene, x, y, 'seed');
    this.gameScene.growingYams.push(yam);
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
