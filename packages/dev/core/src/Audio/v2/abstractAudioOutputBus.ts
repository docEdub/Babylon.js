import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { IAudioNode } from "./abstractAudioInterfaces";

/**
 * The available options when creating an audio output bus.
 */
export interface IAudioBusOptions {
    /**
     * The audio node that owns this device.
     */
    owner?: IAudioNode;

    /**
     * The name of the audio output bus. Defaults to an empty string.
     */
    name?: string;
}

/**
 * Represents an audio output device such as speakers or headphones.
 *
 * All audio devices are assumed to have 2 channels (left and right). More configurations may be supported later.
 */
export abstract class AbstractAudioOutputBus implements IAudioNode {
    private _owner: IAudioNode;

    /**
     * The name of the audio device.
     */
    name: string;

    /**
     * The audio engine that owns this device.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * Gets the audio node that owns this device.
     */
    public get owner(): IAudioNode {
        return this._owner;
    }

    /**
     * Sets the audio node that owns this device.
     */
    public set owner(value: IAudioNode) {
        this._owner = value;
    }

    /**
     * Creates a new audio device.
     * @param engine - The audio engine that owns this device
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioBusOptions) {
        this._owner = options?.owner ?? engine;
        this.engine = engine;
        this.name = options?.name ?? "";
    }
}
