import ClockSingleton from "../scenes/Clock";
import DataStorePlugin from "./DataStorePlugin";

export const CLOCK_CONSTANTS = {
    CYCLE_LENGTH: 12000,
    DAY_LENGTH: 6000,
    NIGHT_LENGTH: 6000,
    SUNSET_WARNING: 4500
};

export default class ClockPlugin extends Phaser.Plugins.BasePlugin {
    public gameClock!: Phaser.Time.Clock;
    private _clockSceneSingleton!: Phaser.Scene;
    private _isDay: boolean = true;
    private _isNight: boolean = false;

    /**
     * Audio
     */
    private _morningSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private _nightSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private _warningSoundPlayed: boolean = false;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // -----------------------------------------------------
    //#region Lifecycle ------------------------------------
    // -----------------------------------------------------

    override init(): void {
        // console.log("ClockPlugin initialized");
        this.game.scene.add("ClockSingleton", new ClockSingleton());
        this._clockSceneSingleton = this.pluginManager.game.scene.getScene("ClockSingleton");
    }

    override start(): void {
        if (!this._clockSceneSingleton) {
            console.error("ClockSingleton scene not found!");
            return;
        }

        this._morningSound = this._clockSceneSingleton.sound.add("morning", { volume: 0.08 });
        this._nightSound = this._clockSceneSingleton.sound.add("night", { volume: 0.07 });

        if (this._clockSceneSingleton.sys.isActive()) {
        //   console.log("Clock Singleton is active! \n --starting logger--");
            this.gameClock = this._clockSceneSingleton.time;
            this.startDayNightCycle();
            // this.startLogger();
        } else {
            console.warn("Clock Singleton not active! \n --waiting for it to emit ready--");
            this._clockSceneSingleton.events.once("ready", () => this.startDayNightCycle());
        }
    }

    // TODO: Not sure about these impl. details...
    override stop(): void {
        this.pluginManager.game.scene.remove("ClockSingleton");
        this.destroy();
    }

    // -----------------------------------------------------s
    //#endregion Lifecycle ---------------------------------

    // -----------------------------------------------------
    //#region Public API -----------------------------------
    // -----------------------------------------------------

    // --~~~~~~~~~~~~~~~
    // -- Events --------
    // --~~~~~~~~~~~~~~~

    startDayNightCycle(): void {
        this._morningSound.play();
        this.gameClock.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                const timeInCycle = this.getTimeInCycle();
                // logs
                // console.log(`Time in cycle: ${timeInCycle}`);
                // console.log(`Elapsed Time: ${this.getElapsedTime()}`);

                // Day to Night
                if (timeInCycle >= CLOCK_CONSTANTS.DAY_LENGTH && this._isDay) {
                    this._clockSceneSingleton.events.emit("dayCycleEnd");
                    this._isDay = false;
                    this._isNight = true;
                    this._warningSoundPlayed = false;

                    console.log("🌙Night has fallen!");

                    this.startNight();
                }

                // Night to Day
                if (timeInCycle < CLOCK_CONSTANTS.DAY_LENGTH && this._isNight) {
                    this._clockSceneSingleton.events.emit("nightCycleEnd");
                    this._isDay = true;
                    this._isNight = false;
                    this._warningSoundPlayed = false;
                    console.log("☀️Day has broken!🐤");

                    this.startDay();
                }

                // Sunset Warning 3/4 Day
                if (timeInCycle >= CLOCK_CONSTANTS.SUNSET_WARNING
                    && timeInCycle < CLOCK_CONSTANTS.DAY_LENGTH
                    && this._isDay && !this._isNight) {
                    this._clockSceneSingleton.events.emit("sunsetWarning");
                    console.log("🌅Sunset warning!");

                    // this._clockSceneSingleton.sound.play("sunset", { volume: 0.25 });
                    this._warningSoundPlayed = true;
                }
            },
        });
    }

    /**
     * this method will simultaneously start the day and end the night cycles
     */
    startDay() {
      this._morningSound.play();
      this._clockSceneSingleton.scene.stop("NightScene");
      const dataStore = this.pluginManager.get('DataStorePlugin') as DataStorePlugin || null;
      if (dataStore) {
        dataStore.dayPassed();
      }
    }

    /**
     * this method will simultaneously start the night and end the day cycles
     */
    startNight() {
        this._nightSound.play();
        this._clockSceneSingleton.scene.launch("NightScene");
    }

    // --~~~~~~~~~~~~~~~
    // -- Utility -------
    // --~~~~~~~~~~~~~~~

    public getTime(): number {
        return this.gameClock.now;
    }

    getElapsedTime(): number {
        return Math.floor(this.gameClock.now - this.gameClock.startTime);
    }

    getTimeInCycle(): number {
        return this.getElapsedTime() % CLOCK_CONSTANTS.CYCLE_LENGTH;
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

    // -----------------------------------------------------
    //#endregion Public API --------------------------------

}