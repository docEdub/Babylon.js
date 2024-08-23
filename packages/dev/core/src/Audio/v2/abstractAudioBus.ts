/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import { AbstractAudioBusNode } from "./abstractAudioBusNode";
import type { IAudioBusNodeOptions } from "./abstractAudioBusNode";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { AbstractAudioSend } from "./abstractAudioSend";
import type { AbstractMainAudioBus } from "./abstractMainAudioBus";
import type { IAudioNodeWithSends } from "./IAudioNodeWithSends";
import type { Nullable } from "../../types";

type AbstractAudioBusOutputBus = AbstractMainAudioBus | AbstractAudioBus;

export interface IAudioBusOptions extends IAudioBusNodeOptions {}

export abstract class AbstractAudioBus extends AbstractAudioBusNode implements IAudioNodeWithSends {
    private _outputBus: Nullable<AbstractAudioBusOutputBus> = null;

    public get outputBus(): Nullable<AbstractAudioBusOutputBus> {
        return this._outputBus;
    }

    public setOutputBus(outputBus: Nullable<AbstractAudioBusOutputBus>) {
        if (this._outputBus === outputBus) {
            return;
        }

        if (this._outputBus) {
            this.disconnect(this._outputBus);
        }

        this._outputBus = outputBus;

        if (this._outputBus) {
            this.connect(this._outputBus);
        }
    }

    public constructor(engine: AbstractAudioEngine, options?: IAudioBusOptions) {
        super(engine, options);
    }

    private _sends = new Array<AbstractAudioSend>();

    public get sends(): ReadonlyArray<AbstractAudioSend> {
        return this._sends;
    }

    public addSend(send: AbstractAudioSend): void {
        if (this._sends.includes(send)) {
            return;
        }
        this._sends.push(send);
    }

    public removeSend(send: AbstractAudioSend): void {
        const index = this._sends.indexOf(send);
        if (index !== -1) {
            this._sends.splice(index, 1);
        }
    }
}
