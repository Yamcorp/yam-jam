import Phaser from 'phaser';
import { UIScene } from '../scenes/UIScene';


export const UPDATE_YAM_COUNT = 'updateYamCount';
export const UPDATE_YAM_REQUIRED = 'updateYamRequired';

const startingRequiredYams = 5;

export default class DataStorePlugin extends Phaser.Plugins.BasePlugin {
  public _amountOfYams = 1000;
  private _yamsNeeded = startingRequiredYams;
  private _day = 1;
  private _jrState = 5;
  private _isHomeInTime = false;
  private _prevYamsNeeded = 0;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }


  public set isHomeInTime(b) {
    this._isHomeInTime = b
  }

  public get isHomeInTime() {
    return this._isHomeInTime
  }

  public get hasEnoughYams() {
    return this._amountOfYams >= this._yamsNeeded
  }

  public get amountOfYams () {
    return this._amountOfYams;
  }

  public get prevYamsNeeded () {
    return this._prevYamsNeeded;
  }

  public get yamsNeeded () {
    return this._yamsNeeded;
  }

  public get day () {
    return this._day;
  }

  public get jrState () {
    return this._jrState;
  }

  public dayPassed (callback?: () => void) {
    this._day += 1;
    // this.game
    // this.pluginManager.get("ClockPlugin").pauseAllEvents();
    // TODO: this.clockPlugin.pauseAllEvents();
    if (callback) callback();
    if (this._yamsNeeded > this._amountOfYams) {

      // You don't have enough yams, game over
      this.game.sound.play('game-over', { volume: 0.2 });
      this.pluginManager.game.scene.start('GameOver');
      this.pluginManager.game.scene.stop('Game');
    } else {
      // You end the day but jr loses a life
      this._prevYamsNeeded = this._yamsNeeded
      const newYamCount = this._amountOfYams - this._yamsNeeded;
      this._amountOfYams = newYamCount;

      const delta = Math.max(Math.floor(Math.random() * this._day * 2), this._day);
      const newYamQuota = Math.max(startingRequiredYams + delta, this._day * 2);

      this._yamsNeeded = newYamQuota;

      this.pluginManager.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
      this.pluginManager.game.events.emit(UPDATE_YAM_REQUIRED, this._yamsNeeded);

      // Setup house scene state
      this._isHomeInTime = false;
      this.decreaseJrHealth()

      // Start house scene
      this.pluginManager.game.scene.start('HouseScene');
    }
  }

  updateYamUI() {
    this.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
    this.pluginManager.game.events.emit(UPDATE_YAM_REQUIRED, this._yamsNeeded);
  }

  decreaseYams (amount = 1) {
    this._amountOfYams -= amount;
    this.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
  }

  increaseYams (amount = 1) {
    this._amountOfYams += amount;
    this.game.events.emit(UPDATE_YAM_COUNT, this._amountOfYams);
  }

  decreaseJrHealth () {
    this._jrState -= 1;
  }

  getNextYamRequirement(): number {
    const amtToChange = Math.max(Math.floor(Math.random() * this._day * 2), this._day);
    const delta = amtToChange;
    return Math.max(startingRequiredYams + delta, this._day * 2);
  }
}
