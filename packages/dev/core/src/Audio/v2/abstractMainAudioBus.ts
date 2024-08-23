import { AbstractAudioBusNode } from "./abstractAudioBusNode";
import type { IAudioBusNodeOptions } from "./abstractAudioBusNode";
import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { Nullable } from "../../types";

/**
 * The options available when creating audio output busses.
 */
export interface IMainAudioBusOptions extends IAudioBusNodeOptions {}

/**
 *
 */
export abstract class AbstractMainAudioBus extends AbstractAudioBusNode {
    private _device: Nullable<AbstractAudioDevice> = null;

    /**
     * The bus's audio device.
     */
    public get device(): Nullable<AbstractAudioDevice> {
        return this._device;
    }

    public set device(device: Nullable<AbstractAudioDevice>) {
        if (this._device == device) {
            return;
        }

        if (this._device) {
            this.disconnect(this._device);
        }

        this._device = device;

        if (device) {
            this.connect(device);
        }
    }

    /**
     * Creates a new audio bus.
     * @param engine - The bus's audio device
     * @param options - The options to use when creating the audio output bus
     */
    public constructor(engine: AbstractAudioEngine, options?: IMainAudioBusOptions) {
        super(engine, options);
    }
}
