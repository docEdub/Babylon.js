import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";
import type { Nullable } from "../../types";

/**
 * The options available when creating audio output busses.
 *
 * Responsibilities:
 *  - Maintain a single connection to an audio device.
 *  - Inform connected audio device when created and disposed.
 */
export interface IAudioOutputBusOptions extends IAudioNodeOptions {
    /**
     * The bus's audio device. Defaults to the audio engine's default device.
     */
    device?: AbstractAudioDevice;
}

/**
 * The base class for audio output busses.
 */
export abstract class AbstractAudioOutputBus extends AbstractAudioNode {
    private _device: AbstractAudioDevice;

    /**
     * The bus's audio device.
     */
    public get device(): AbstractAudioDevice {
        return this._device;
    }

    public set device(value: Nullable<AbstractAudioDevice>) {
        if (this._device == value) {
            return;
        }

        if (this._device) {
            this.disconnect(this._device);
        }

        const device = value ?? this.engine.defaultDevice;

        device.addOutputBus(this);
        this.connect(device);

        this._device = device;
    }

    /**
     * Creates a new audio device.
     * @param engine - The audio engine that owns this device
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioOutputBusOptions) {
        super(engine, options);

        this.device = options?.device ?? engine.defaultDevice;

        this.device.addOutputBus(this);
    }

    /**
     * Releases all held resources.
     */
    public override dispose(): void {
        super.dispose();

        this.device.removeOutputBus(this);
    }

    /**
     * Connects a downstream audio input node.
     * @param inputNode - The downstream audio input node to connect
     */
    public override connect(inputNode: AbstractAudioNode): void {
        if (inputNode === this.device) {
            return;
        }
        super.connect(inputNode);
    }
}
