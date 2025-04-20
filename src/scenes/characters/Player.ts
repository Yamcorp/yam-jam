import { Game } from '../Game'
import { ThrownYam } from '../interactables/ThrownYam'

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private _wasd?: { [key: string]: Phaser.Input.Keyboard.Key }
  private _speed: number
  private _gameScene: Game
  private _lastDirection: 'front' | 'back' | 'side' = 'front';

  
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

  }

  public get gameScene (): Game {
    return this._gameScene;
  }

  public update () {
    const direction = new Phaser.Math.Vector2(0, 0)
    let moving = false;

    if (this._cursors?.left.isDown || this._wasd?.left.isDown) {
      direction.x -= 1
      this.anims.play('player-walk-side', true)
      this.setFlipX(true)
      this._lastDirection = 'side'
      moving = true;
    } else if (this._cursors?.right.isDown || this._wasd?.right.isDown) {
      direction.x += 1
      this.anims.play('player-walk-side', true)
      this.setFlipX(false)
      this._lastDirection = 'side'
      moving = true;
    } else if (this._cursors?.up.isDown || this._wasd?.up.isDown) {
      direction.y -= 1
      this.anims.play('player-walk-back', true)
      this._lastDirection = 'back'
      moving = true;
    } else if (this._cursors?.down.isDown || this._wasd?.down.isDown) {
      direction.y += 1
      this.anims.play('player-walk-front', true)
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
        case 'side':
          this.setTexture('PlayerWalkSide', 4);
          break;
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
    this.gameScene.dataStore.decreaseYams();
    const yam = new ThrownYam(this.gameScene, this.x, this.y);
    this.gameScene.events.emit('addToScene', yam);
    yam.create();
  }

  public interact() {
    // if by a ripe growingYam, harvest some yams
    this.gameScene.growingYams.forEach((yam) => {
      if (this.gameScene.physics.overlap(this, yam.pickUpZone)) {
        yam.destroy()
        
        var randomNumber = undefined
        yam.growthState === 'harvested' ? randomNumber = 1 : randomNumber = Math.round(Math.random() * 6);
        this.gameScene.dataStore.increaseYams(randomNumber);
      }
    })
  }
}
