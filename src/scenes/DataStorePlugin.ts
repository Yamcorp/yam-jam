import Phaser from 'phaser';

export default class DataStorePlugin extends Phaser.Plugins.BasePlugin {
  public amountOfYams = 10;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

  }

}
