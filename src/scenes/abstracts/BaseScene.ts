import DataStorePlugin from "../../plugins/DataStorePlugin";

export abstract class BaseScene extends Phaser.Scene {
  dataStore!: DataStorePlugin

  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload() {
    this.dataStore = this.plugins.get('DataStorePlugin') as DataStorePlugin;
  }
}