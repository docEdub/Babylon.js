/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import { AbstractAudioBusNode } from "./abstractAudioBusNode";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { AbstractAudioSend } from "./abstractAudioSend";
import type { AbstractMainAudioBus } from "./abstractMainAudioBus";
import type { IAudioNodeWithSends } from "./IAudioNodeWithSends";
import type { Nullable } from "../../types";

export abstract class AbstractAudioBus extends AbstractAudioBusNode implements IAudioNodeWithSends {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine);
    }

    private _outputBus: Nullable<AbstractMainAudioBus | AbstractAudioBus> = null;

    public get outputBus(): Nullable<AbstractMainAudioBus | AbstractAudioBus> {
        return this._outputBus;
    }

    public setOutputBus(outputBus: Nullable<AbstractMainAudioBus | AbstractAudioBus>) {
        if (this._outputBus === outputBus) {
            return;
        }

        if (this._outputBus) {
            this._disconnect(this._outputBus);
        }

        this._outputBus = outputBus;

        if (this._outputBus) {
            this._connect(this._outputBus);
        }
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
