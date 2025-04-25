import { Game } from '../Game'

export class Jr extends Phaser.Physics.Arcade.Sprite {
  private _gameScene: Game

  constructor(scene: Phaser.Scene, x: number, y: number, state: number) {
    super(scene, x, y, 'Jr0', state)

    this._gameScene = scene as Game

    this._gameScene.add.existing(this)
    this._gameScene.physics.add.existing(this)
    this.anims.play(`jr${state}`, true)
  }

  public get gameScene (): Game {
    return this._gameScene;
  }

  public interact() {
      return;
  }

  public getCyborgDialogue() {
    let dialogue;
    switch (this.state) {
      case 1: {
        dialogue = "Hey dad, I replaced my arm with this legacy ipod. It's so corny. Want to see?"
        break;
      }
      case 2: {
        dialogue = "Hey daddo, I traded some yams for this starcraft thing that lets you hook up to VRDO 45/7. "
          + "I had to throw out some of my grey matter to hook it up, but like so worth."
        break;
        }
      case 3: {
        dialogue = "Biorods are for losers. JimJam says hot chrome is top foam. What!? You don't know JimJam?? Dad, I don't know if I can respect you."
        break;
      }
      case 4: {
        dialogue = "Daaaad I know you said Tubi is rottin my head yams, but l was so squelshin for some mod pods enhancements. I'm cleavage."
        break;
      }
      case 5: {
        dialogue = "Yoooooo, mah bod! Wazzzzuupppp"
        break;
      }
      default: {
        console.log(`Jr's value of ${this.state} did not match expected values for cy input`)
          break;
      }
    }
    return dialogue;
  }
}
