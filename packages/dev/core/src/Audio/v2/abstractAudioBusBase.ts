import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

/**
 * The options available when creating audio output busses.
 */
export interface IAudioBusBaseOptions extends IAudioNodeOptions {}

/**
 * The base class for audio output busses.
 */
export abstract class AbstractAudioBusBase extends AbstractAudioNode {
    /**
     *
     * @param engine
     * @param options
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioBusBaseOptions) {
        super(AudioNodeType.InputOutput, engine, options);
    }
}
