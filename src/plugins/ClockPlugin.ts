import ClockSingleton from "../scenes/Clock";

export default class ClockPlugin extends Phaser.Plugins.BasePlugin {
    private clockSceneSingleton!: Phaser.Scene;
    public gameClock!: Phaser.Time.Clock;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // -----------------------------------------------------
    //#region Lifecycle ------------------------------------
    // -----------------------------------------------------

    override init(): void {
        console.log("ClockPlugin initialized");
        this.game.scene.add("ClockSingleton", new ClockSingleton());
        this.clockSceneSingleton = this.pluginManager.game.scene.getScene("ClockSingleton");
    }

    override start(): void {
        if (!this.clockSceneSingleton) {
            console.error("ClockSingleton scene not found!");
            return;
        }

        if (this.clockSceneSingleton.sys.isActive()) {
            this.startLogger();
        } else {
            console.warn("Clock Singleton not active! \n --waiting for it to emit ready--");
            this.clockSceneSingleton.events.once("ready", () => this.startLogger());
        }


    }

    // TODO: Not sure about these impl. details...
    override stop(): void {
        this.pluginManager.game.scene.remove("ClockSingleton");
        this.destroy();
    }

    // -----------------------------------------------------
    //#endregion Lifecycle ---------------------------------

    // -----------------------------------------------------
    //#region Public API -----------------------------------
    // -----------------------------------------------------

    getTime(): number {
        return this.gameClock.now;
    }

    getElapsedTime(): number {
        return this.gameClock.now - this.gameClock.startTime;
    }

    pauseTime(): void {
        this.gameClock.paused = true;
    }

    resumeTime(): void {
        this.gameClock.paused = false;
    }

    scheduleOnce(delay: number, callback: () => void) {
        this.gameClock.delayedCall(delay, callback);
    }

    pauseAllEvents() {
        this.gameClock.paused = true;
    }

    resumeAllEvents() {
        this.gameClock.paused = false;
    }

    /**
     * this is a test method to log the clock ticks to the console
     */
    startLogger() {
        this.gameClock = this.clockSceneSingleton.time;
        console.log(`logger started at -> ${this.gameClock.now}`);
        console.dir(this.gameClock);

        this.gameClock.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                console.log(`Global Clock Tick : @ ${this.gameClock.now} \n Elapsed: ${this.getElapsedTime().toFixed(1)}`);
                console.dir(this.gameClock);
            },
        });
    }

    /**
     * this method will simultaneously start the day and end the night cycles
     */
    startDay() {
        // TODO: begin day cycle
    }

    /**
     * this method will simultaneously start the night and end the day cycles
     */
    startNight() {
        // TODO: begin night cycle
    }

    // -----------------------------------------------------
    //#endregion Public API --------------------------------

}