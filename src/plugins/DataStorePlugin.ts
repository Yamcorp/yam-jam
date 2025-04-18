import Phaser from 'phaser';

export const UPDATE_YAM_COUNT = 'updateYamCount';

export default class DataStorePlugin extends Phaser.Plugins.BasePlugin {
  public _amountOfYams = 10;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  public get amountOfYams () {
    return this._amountOfYams;
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
