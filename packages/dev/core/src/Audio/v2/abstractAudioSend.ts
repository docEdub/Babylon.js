/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";
import type { AbstractAuxilliaryAudioBus } from "./abstractAuxilliaryAudioBus";
import type { Nullable } from "../../types";

export enum AudioSendType {
    PostFader,
    PreFader,
}

export interface IAudioSendOptions extends IAudioNodeOptions {
    sendType?: AudioSendType;
}

export abstract class AbstractAudioSend extends AbstractAudioNode {
    private _outputBus: Nullable<AbstractAuxilliaryAudioBus> = null;

    public get outputBus(): Nullable<AbstractAuxilliaryAudioBus> {
        return this._outputBus;
    }

    public setOutputBus(outputBus: Nullable<AbstractAuxilliaryAudioBus>) {
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

    private _sendType: AudioSendType;

    /**
     * The type of send.
     */
    public get sendType(): AudioSendType {
        return this._sendType;
    }

    /**
     *
     * @param sendType
     */
    public setSendType(sendType: AudioSendType) {
        if (this._sendType === sendType) {
            return;
        }

        this._sendType = sendType;
    }

    /**
     *
     * @param engine
     * @param options
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioSendOptions) {
        super(AudioNodeType.InputOutput, engine, options);

        this._sendType = options?.sendType ?? AudioSendType.PostFader;
    }
}
