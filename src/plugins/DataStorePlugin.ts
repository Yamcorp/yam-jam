import Phaser from 'phaser';

export const UPDATE_YAM_COUNT = 'updateYamCount';

export default class DataStorePlugin extends Phaser.Plugins.BasePlugin {
  public _amountOfYams = 10;
  private _yamsNeeded = 10;
  private _day = 1;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  public get amountOfYams () {
    return this._amountOfYams;
  }

  public get yamsNeeded () {
    return this._yamsNeeded;
  }
  
  public get day () {
    return this._day;
  }

  public dayPassed () {
    this._day += 1;
    if (this._yamsNeeded > this._amountOfYams) {
      this.pluginManager.game.scene.start('GameOver');
    } else {
      this._yamsNeeded += Math.floor(Math.random() * this._day * 2) - this._day;
      this._amountOfYams = Math.max(this._amountOfYams - this._yamsNeeded, 0);
      this.pluginManager.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
    }
  }

  decreaseYams (amount = 1) {
    this._amountOfYams -= amount;
    this.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
  }

  increaseYams (amount = 1) {
    this._amountOfYams += amount;
    this.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
  }
}
