import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { IAudioInputNode, IAudioNode, IAudioOutputNode } from "./abstractAudioInterfaces";

/**
 * The available options when creating an audio device.
 */
export interface IAudioDeviceOptions {
    /**
     * The name of the audio device. Defaults to an empty string.
     */
    name?: string;
}

/**
 * Represents an audio output device such as speakers or headphones.
 *
 * All audio devices are assumed to have 2 channels (left and right). More configurations may be supported later.
 */
export abstract class AbstractAudioDevice implements IAudioInputNode {
    /**
     * The audio engine that owns this device.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * The name of the audio device.
     */
    name: string;

    /**
     * The audio node that owns this device.
     */
    public get owner(): IAudioNode {
        return this.engine;
    }

    /**
     * Creates a new audio device.
     * @param engine - The audio engine that owns this device
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioDeviceOptions) {
        this.engine = engine;
        this.name = options?.name ?? "";
    }

    public abstract onConnect(inputNode: IAudioOutputNode): boolean;
    public abstract onDisconnect(inputNode: IAudioOutputNode): void;
}
