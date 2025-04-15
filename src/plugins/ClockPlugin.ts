export default class ClockPlugin extends Phaser.Plugins.BasePlugin {
    private clockSceneSingleton!: Phaser.Scene;
    private clock!: Phaser.Time.Clock;
    // TODO: define private variables like time events and time scale

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // -----------------------------------------------------
    //#region Phaser Lifecycle -----------------------------
    // -----------------------------------------------------

    init(): void {
        // TODO: this is breaking... create Singleton Class
        // elsewhere and import it here...
        // newing up a Scene here causes a race condition to
        // when i am trying to register the event in the start method
        console.log("ClockPlugin initialized");
        this.clockSceneSingleton = new Phaser.Scene("ClockSceneSingleton");
        this.pluginManager.game.scene.add("ClockSceneSingleton", this.clockSceneSingleton, true);
    }

    start(): void {

        this.clockSceneSingleton.events.once("create", () => {
            this.clock = this.clockSceneSingleton.time;

            this.clock.addEvent({
                delay: 1000,
                loop: true,
                callback: () => console.log("Global Clock Tick")
            });
        });
    }

    // TODO: Not sure about these impl. details...
    stop(): void {
        this.pluginManager.game.scene.remove("ClockSceneSingleton");
        this.destroy();
    }

    // -----------------------------------------------------
    //#endregion -------------------------------------------

    // -----------------------------------------------------
    //#region Public API -----------------------------------
    // -----------------------------------------------------

    getTime(): number {
        return this.clock.now;
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

    // -----------------------------------------------------
    //#endregion -------------------------------------------

}