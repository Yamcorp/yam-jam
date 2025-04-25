import { CLOCK_CONSTANTS } from "../plugins/ClockPlugin";

export class NightScene extends Phaser.Scene {
  constructor() {
    super('NightScene');
  }

  create() {
    console.log('NightScene created');
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    const nightOverlay = this.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000);

    nightOverlay.setOrigin(0);
    nightOverlay.alpha = 0.1;
    nightOverlay.fillColor = 0x000033;

    this.tweens.add({
      targets: nightOverlay,
      alpha: 0.7,
      duration: CLOCK_CONSTANTS.NIGHT_LENGTH / 2,
      ease: 'Cubic.easeInOut',
      yoyo: true
    });
  }
}
