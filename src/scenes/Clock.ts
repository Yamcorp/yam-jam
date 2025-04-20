import { BaseScene } from "./abstracts/BaseScene";

export default class Clock extends BaseScene {
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