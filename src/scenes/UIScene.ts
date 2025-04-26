import { UPDATE_YAM_COUNT, UPDATE_YAM_REQUIRED } from "../plugins/DataStorePlugin";
import { BaseScene } from "./abstracts/BaseScene";

const WHITE_COLOR = '#ffffff';
const RED_COLOR = '#ff0000';
const GREEN_COLOR = '#00ff00';

export class UIScene extends BaseScene {
  private _yamAmount!: Phaser.GameObjects.Text;
  private _yamRequired!: Phaser.GameObjects.Text;
  private _yamRequiredOriginalX!: number
  private _shaking = false

  constructor() {
    super('UIScene');
  }

  create () {
    const x = this.cameras.main.width - 10;
    const y = 10;
    this._yamAmount = this.add.text(x, y, `Yams Remaining: ${this.dataStore.amountOfYams}`, {
        fontFamily: 'Arial Black', fontSize: 38, color: WHITE_COLOR,
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    });
    this._yamAmount.setOrigin(1, 0);
    this._yamAmount.setScrollFactor(0);

    this._yamRequired = this.add.text(x, y, `Yams Required: ${this.dataStore.amountOfYams}`, {
      fontFamily: 'Arial Black', fontSize: 38, color: WHITE_COLOR,
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    });
    this._yamRequired.setOrigin(1, -1);
    this._yamRequired.setScrollFactor(0);

    this.game.events.on(UPDATE_YAM_COUNT, this.updateYamCount, this);
    this.game.events.on(UPDATE_YAM_REQUIRED, this.updateYamRequired, this);
    this._yamRequiredOriginalX = x;

  }

  public updateYamCount (amount: number) {
    this._yamAmount.setText(`Yams Remaining: ${amount}`);
    if (amount < this.dataStore.yamsNeeded) {
      this._yamRequired.setColor(RED_COLOR);
    } else if (amount > this.dataStore.yamsNeeded) {
      this._yamRequired.setColor(GREEN_COLOR);
    } else {
      this._yamRequired.setColor(WHITE_COLOR);
    }
  }

  private updateYamRequired (amount: number) {
    this._yamRequired.setText(`Yams Required: ${amount}`);
    if (amount > this.dataStore.amountOfYams) {
      this._yamRequired.setColor(RED_COLOR);
    } else if (amount < this.dataStore.amountOfYams) {
      this._yamRequired.setColor(GREEN_COLOR);
    } else {
      this._yamRequired.setColor(WHITE_COLOR);
    }
  }

  public shakeYamsRequired() {
    if (this._shaking) return;
  
    this._shaking = true;
    this.tweens.add({
      targets: this._yamRequired,
      x: '+=5',
      duration: 50,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this._yamRequired.x = this._yamRequiredOriginalX;
        this._shaking = false;
      }
    });
  }
}
