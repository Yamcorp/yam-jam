export default class ClockSingleton extends Phaser.Scene {
    /**
     * members
     */

    /**
     *
     */
    constructor() {
        super("ClockSingleton");
    }

    //#region optional life cycle methods
    /**
     * init
     */

    /**
     * preload
     */

    /**
     * create
     */
    create() {
        this.events.emit("ready");
    }
    //#endregion
}