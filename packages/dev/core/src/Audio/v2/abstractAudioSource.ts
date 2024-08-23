import type { AbstractAudioBusNode } from "./abstractAudioBusNode";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AudioNodeType } from "./abstractAudioNode";
import { AbstractSendableAudioNode } from "./abstractSendableAudioNode";
import type { ISendableAudioNodeOptions } from "./abstractSendableAudioNode";
import type { Nullable } from "../../types";

/**
 *
 */
export interface IAudioSourceOptions extends ISendableAudioNodeOptions {}

/**
 *
 */
export abstract class AbstractAudioSource extends AbstractSendableAudioNode {
    private _outputBus: Nullable<AbstractAudioBusNode> = null;

    /**
     *
     */
    public get outputBus(): Nullable<AbstractAudioBusNode> {
        return this._outputBus;
    }

    /**
     *
     * @param outputBus
     */
    public setOutputBus(outputBus: Nullable<AbstractAudioBusNode>) {
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

    /**
     * @param engine
     * @param options
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioSourceOptions) {
        super(AudioNodeType.Output, engine, options);
    }
}
