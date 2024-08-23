import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode } from "./abstractAudioNode";
import type { IAudioNodeOptions, AudioNodeType } from "./abstractAudioNode";
import type { AbstractAudioSend } from "./abstractAudioSend";

/**
 *
 */
export interface ISendableAudioNodeOptions extends IAudioNodeOptions {}

/**
 *
 */
export abstract class AbstractSendableAudioNode extends AbstractAudioNode {
    private _sends = new Array<AbstractAudioSend>();

    /**
     *
     */
    public get sends(): ReadonlyArray<AbstractAudioSend> {
        return this._sends;
    }

    /**
     *
     * @param nodeType
     * @param engine
     * @param options
     */
    public constructor(nodeType: AudioNodeType, engine: AbstractAudioEngine, options?: ISendableAudioNodeOptions) {
        super(nodeType, engine, options);
    }

    /**
     *
     * @param send
     */
    public addSend(send: AbstractAudioSend): void {
        if (this._sends.includes(send)) {
            return;
        }
        this._sends.push(send);
    }

    /**
     *
     * @param send
     */
    public removeSend(send: AbstractAudioSend): void {
        const index = this._sends.indexOf(send);
        if (index !== -1) {
            this._sends.splice(index, 1);
        }
    }
}
