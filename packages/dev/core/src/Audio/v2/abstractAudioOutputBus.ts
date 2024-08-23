import type { AbstractAudioDevice } from "./abstractAudioDevice";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

/**
 * The options available when creating audio output busses.
 */
export interface IAudioOutputBusOptions extends IAudioNodeOptions {}

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

    public set device(device: AbstractAudioDevice) {
        if (this._device == device) {
            return;
        }

        if (this._device) {
            this.disconnect(this._device);
        }

        this._device = device;

        this.connect(device);
    }

    /**
     * Creates a new audio bus.
     * @param device - The bus's audio device
     * @param options - The options to use when creating the audio output bus
     */
    public constructor(device: AbstractAudioDevice, options?: IAudioOutputBusOptions) {
        super(AudioNodeType.InputOutput, device.engine, options);

        this.device = device;
    }
}
