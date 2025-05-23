import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { UIScene } from './scenes/UIScene'
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { StoryScene } from './scenes/StoryScene';
import { NightScene } from './scenes/NightScene';
import { Preloader } from './scenes/Preloader';
import { HouseScene } from './scenes/HouseScene';
import DataStorePlugin from './plugins/DataStorePlugin';
import ClockPlugin from './plugins/ClockPlugin';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false, // shows the collision shape and velocity
      }
    },
    plugins: {
        global: [
          { key: 'DataStorePlugin', plugin: DataStorePlugin, start: true },
          { key: 'ClockPlugin', plugin: ClockPlugin }
        ]
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        StoryScene,
        MainGame,
        GameOver,
        UIScene,
        NightScene,
        HouseScene
    ]
};

export default new Game(config);
