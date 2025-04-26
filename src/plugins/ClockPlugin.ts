import ClockSingleton from "../scenes/Clock";
import DataStorePlugin from "./DataStorePlugin";

export const CLOCK_CONSTANTS = {
    CYCLE_LENGTH: 48000,
    DAY_LENGTH: 2400,
    NIGHT_LENGTH: 24000,
    SUNSET_WARNING: 4500
};

export default class ClockPlugin extends Phaser.Plugins.BasePlugin {
    public gameClock!: Phaser.Time.Clock;
    private _clockSceneSingleton!: Phaser.Scene;
    private _isDay: boolean = true;
    private _isNight: boolean = false;
    private _currentTime!: number;
    private _pausedTime!: number;

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
        this.game.scene.add("ClockSingleton", new ClockSingleton());
        this._clockSceneSingleton = this.pluginManager.game.scene.getScene("ClockSingleton");
    }

    override start(): void {
        if (!this._clockSceneSingleton) {
            console.error("ClockSingleton scene not found!");
            return;
        }

        this._morningSound = this._clockSceneSingleton.sound.add("morning", { volume: 0.08 });
        this._nightSound = this._clockSceneSingleton.sound.add("night", { volume: 0.05 });

        if (this._clockSceneSingleton.sys.isActive()) {
            this.gameClock = this._clockSceneSingleton.time;
            this.startDayNightCycle();
        } else {
            console.warn("Clock Singleton not active! \n --waiting for it to emit ready--");
            this._clockSceneSingleton.events.once("ready", () => this.startDayNightCycle());
        }
    }

    override stop(): void {
        this.pluginManager.game.scene.remove("ClockSingleton");
        this.destroy();
    }

    // -----------------------------------------------------
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
                console.log(`Time in cycle: ${timeInCycle}`);
                console.log(`Elapsed Time: ${this.getElapsedTime()}`);
                console.log(`this.gameClock.now: ${this.gameClock.now}`);

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

    getElapsedTime(): number {
        return Math.floor(this.gameClock.now - this.gameClock.startTime);
    }

    getTimeInCycle(): number {
        return this.getElapsedTime() % CLOCK_CONSTANTS.CYCLE_LENGTH;
    }

    pauseAllEvents(): void {
        console.log("SDFSADFASDFASDFSD:");
        console.log(this._currentTime);
        this._currentTime = this.gameClock.now;
        this.gameClock.paused = true;
    }

    resumeAllEvents(): void {
        this.gameClock.now = this._currentTime;
        this.gameClock.paused = false;
    }

    scheduleOnce(delay: number, callback: () => void) {
        this.gameClock.delayedCall(delay, callback);
    }

    // -----------------------------------------------------
    //#endregion Public API --------------------------------

}