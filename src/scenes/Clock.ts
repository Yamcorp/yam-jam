export default class ClockSingleton extends Phaser.Scene {
    /**
     * members
     */

    /**
     *
     */
    constructor() {
        super({ key: "ClockSingleton", active: true });
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
        // console.log("⏰ClockSingleton created & event ready emitted");
        this.events.emit("ready");
    }
    //#endregion
}