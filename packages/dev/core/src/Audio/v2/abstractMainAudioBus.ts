/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import { AbstractAudioBusNode } from "./abstractAudioBusNode";
import type { IAudioBusNodeOptions } from "./abstractAudioBusNode";
import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { Nullable } from "../../types";

export interface IMainAudioBusOptions extends IAudioBusNodeOptions {}

export abstract class AbstractMainAudioBus extends AbstractAudioBusNode {
    private _device: Nullable<AbstractAudioDevice> = null;

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

    public constructor(engine: AbstractAudioEngine, options?: IMainAudioBusOptions) {
        super(engine, options);
    }
}
