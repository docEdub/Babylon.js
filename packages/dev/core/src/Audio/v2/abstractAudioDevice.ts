import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";
import type { AbstractAudioOutputBus } from "./abstractAudioOutputBus";

/**
 * The options available when creating audio devices.
 */
export interface IAudioDeviceOptions extends IAudioNodeOptions {
    /**
     * The audio output bus to use as the default.
     */
    defaultOutputBus?: AbstractAudioOutputBus;
}

/**
 * The base class for audio devices. Represents an audio output device such as speakers or headphones.
 *
 * Responsibilties:
 *  - Maintain an array of connected audio output busses.
 *
 * Note that audio devices are currently assumed to have 2 channels (left and right). More configurations may be
 * supported later.
 */
export abstract class AbstractAudioDevice extends AbstractAudioNode {
    private _outputBusses = new Array<AbstractAudioOutputBus>();

    /**
     * The default audio output bus.
     */
    public get defaultOutputBus(): AbstractAudioOutputBus {
        if (this._outputBusses.length === 0) {
            this.addOutputBus(this.engine.createOutputBus({ name: "Default", device: this }));
        }
        return this._outputBusses[0];
    }

    /**
     * The connected audio output busses.
     */
    public get outputBusses(): ReadonlyArray<AbstractAudioOutputBus> {
        return this._outputBusses;
    }

    /**
     * Creates an audio device.
     * @param engine - The audio device's owning audio engine
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioDeviceOptions) {
        super(engine, options);

        if (options?.defaultOutputBus) {
            this.addOutputBus(options.defaultOutputBus);
        }
    }

    /**
     * Releases all held resources.
     */
    public override dispose(): void {
        super.dispose();

        for (const outputBus of this._outputBusses) {
            this.removeOutputBus(outputBus);
        }
    }

    /**
     * Adds an audio output bus.
     * @param outputBus - The audio output bus to add
     * @returns The given audio output bus
     */
    public addOutputBus(outputBus: AbstractAudioOutputBus): AbstractAudioOutputBus {
        if (this._outputBusses.includes(outputBus)) {
            return outputBus;
        }

        this._outputBusses.push(outputBus);
        outputBus.device = this;

        return outputBus;
    }

    /**
     * Removes an audio output bus.
     * @param outputBus - The audio output bus to remove
     */
    public removeOutputBus(outputBus: AbstractAudioOutputBus): void {
        const index = this._outputBusses.indexOf(outputBus);
        if (index > -1) {
            this._outputBusses.splice(index, 1);
            outputBus.device = null;
        }
    }
}
