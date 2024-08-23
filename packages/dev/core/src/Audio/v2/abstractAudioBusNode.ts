import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

/**
 * The options available when creating audio busses.
 */
export interface IAudioBusNodeOptions extends IAudioNodeOptions {}

/**
 *
 */
export abstract class AbstractAudioBusNode extends AbstractAudioNode {
    /**
     *
     * @param engine
     * @param options
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioBusNodeOptions) {
        super(AudioNodeType.InputOutput, engine, options);
    }
}
