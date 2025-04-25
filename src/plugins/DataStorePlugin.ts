import Phaser from 'phaser';

export const UPDATE_YAM_COUNT = 'updateYamCount';
export const UPDATE_YAM_REQUIRED = 'updateYamRequired';

const startingRequiredYams = 10;

export default class DataStorePlugin extends Phaser.Plugins.BasePlugin {
  public _amountOfYams = 10;
  private _yamsNeeded = startingRequiredYams;
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
      // TODO: Game Over Logic, game over sound
      // this.game.sound.play('game-over', { volume: 0.2 });
      // this.pluginManager.game.scene.start('GameOver');
      // this.pluginManager.game.scene.stop('Game');
    } else {
      const amtToChange = Math.max(Math.floor(Math.random() * this._day * 2), this._day);
      const sign = Math.random() < 0.3 ? -1 : 1;
      this._yamsNeeded = Math.max(startingRequiredYams + (amtToChange * sign), this._day * 2);
      this._amountOfYams = Math.max(this._amountOfYams - this._yamsNeeded, 0);
      this.pluginManager.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
      this.pluginManager.game.events.emit(UPDATE_YAM_REQUIRED, this._yamsNeeded);
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
