import ClockPlugin from "../../plugins/ClockPlugin";
import DataStorePlugin from "../../plugins/DataStorePlugin";
import { Player } from '../characters/Player';

export abstract class BaseScene extends Phaser.Scene {
  public dataStore!: DataStorePlugin;
  public clockPlugin!: ClockPlugin;
  public player!: Player;

  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload() {
    this.dataStore = this.plugins.get('DataStorePlugin') as DataStorePlugin;
    this.clockPlugin = this.plugins.get('ClockPlugin') as ClockPlugin;
  }
}