export default class ClockPlugin extends Phaser.Plugins.BasePlugin {
    private clockSceneSingleton!: Phaser.Scene;
    private clock!: Phaser.Time.Clock;
    // TODO: define private variables like time events and time scale

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // -----------------------------------------------------
    //#region Lifecycle ------------------------------------
    // -----------------------------------------------------

    override init(): void {
        // TODO: maybe start the clock here? (else it starts at main menu)
        console.log("ClockPlugin initialized");
    }

    override start(): void {
        console.log("~~clock plugin started~~");
        this.clockSceneSingleton = this.pluginManager.game.scene.getScene("ClockSingleton");

        if (!this.clockSceneSingleton) {
            console.error("ClockSingleton scene not found!");
            return;
        }

        if (this.clockSceneSingleton.sys.isActive()) {
            console.log("Clock Singleton is active! \n --starting logger--");
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
        return this.clock.now;
    }

    getElapsedTime(): number {
        return this.clock.startTime - this.clock.now;
    }

    pauseTime(): void {
        this.clock.paused = true;
    }

    resumeTime(): void {
        this.clock.paused = false;
    }

    scheduleOnce(delay: number, callback: () => void) {
        this.clock.delayedCall(delay, callback);
    }

    pauseAllEvents() {
        this.clock.paused = true;
    }

    resumeAllEvents() {
        this.clock.paused = false;
    }

    /**
     * this is a test method to log the clock ticks to the console
     */
    startLogger() {
        this.clock = this.clockSceneSingleton.time;
        console.dir(this.clock);

        this.clock.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                console.log(`Global Clock Tick : @ ${this.clock.now} \n Elapsed: ${this.getElapsedTime().toFixed(1)}`);
                console.dir(this.clock);
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