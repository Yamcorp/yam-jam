import DataStorePlugin from "../../plugins/DataStorePlugin";

export abstract class BaseScene extends Phaser.Scene {
  dataStore!: DataStorePlugin

  constructor(key: string) {
    super(key);
  }

  preload() {
    this.dataStore = this.plugins.get('DataStorePlugin') as DataStorePlugin;
  }
}