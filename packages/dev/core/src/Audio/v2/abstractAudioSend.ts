import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

export enum AudioSendType {
    PostFader,
    PreFader,
}

/**
 *
 */
export interface IAudioSendOptions extends IAudioNodeOptions {
    /**
     *
     */
    sendType?: AudioSendType;
}

/**
 *
 */
export abstract class AbstractAudioSend extends AbstractAudioNode {
    private _sendType: AudioSendType = AudioSendType.PostFader;

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
    public constructor(engine: AbstractAudioEngine, options?: IAudioNodeOptions) {
        super(AudioNodeType.InputOutput, engine, options);
    }
}
