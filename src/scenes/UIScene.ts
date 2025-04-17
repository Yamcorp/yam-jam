import { UPDATE_YAM_COUNT } from "../plugins/DataStorePlugin";
import { BaseScene } from "./abstracts/BaseScene";

export class UIScene extends BaseScene {
  private _yam_amount : Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create() {
    const x = this.cameras.main.width - 10;
    const y = 10;
    this._yam_amount = this.add.text(x, y, `Yams Remaining: ${this.dataStore.amountOfYams}`, {
        fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    });
    this._yam_amount.setOrigin(1, 0);
    this._yam_amount.setScrollFactor(0);

    this.game.events.on(UPDATE_YAM_COUNT, this.updateYamCount, this);
  }

  updateYamCount(amount: number) {
    this._yam_amount.setText(`Yams Remaining: ${amount}`);
  }
}
