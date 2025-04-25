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

  public getHealthyDialogue() {
    const dialogueList = [
      "I love you dad.",
      "I think farming is kinda cool.",
      "I want to make some irl friends... How do I do that?",
      "I made you some yam pie. I hope you like it.",
      "I chased off some crows today to try to help with our yam debt.",
      "I miss mom.",
      "I'm tired of eating yams all the time. Remember that one time we had corn??",
      "This rock isn't so bad when we're hanging out together...",
      "I found some ice cream! No, don't eat it! It's fake ice cream from the well.",
      "My imaginary friend Bento was pretty angry with me today.",
      "My imaginary friend Bento told me the funniest joke earlier. I can't remember it but maybe he can tell you sometime.",
      "Dad, what's a baseball?",
      "Dad, do you remember that doll I used to have? What ever happened to it?",
      "Can we pretend to go the beach sometime?",
      "Television sounds so weird compared to TubeStream",
      "What's a cake? Oh! Maybe if you're not so busy one of these days, we can make one!",
      "Dad, will you tuck me in?",
      "Dad, will you tell me a story?",
      "What was the rock that you grew up on like?",
      "So you didn't have to eat yams when you were younger...?",
      "...from a book? No way, that's crazy!",
      "Let's play a game! I know you're tired, but pleassse???.",
    ]

    const randomIndex = Math.floor(Math.random() * dialogueList.length)
    return dialogueList[randomIndex]
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
