import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode } from "./abstractAudioNode";
import type { AudioNodeType, IAudioNodeOptions } from "./abstractAudioNode";

/**
 *
 */
export interface INamedAudioNodeOptions extends IAudioNodeOptions {
    /**
     * The name of the audio node.
     */
    name?: string;
}

/**
 *
 */
export abstract class AbstractNamedAudioNode extends AbstractAudioNode {
    private _name: string;

    /**
     *
     */
    public get name(): string {
        return this._name;
    }

    /**
     *
     * @param nodeType
     * @param engine
     * @param options
     */
    public constructor(nodeType: AudioNodeType, engine: AbstractAudioEngine, options?: INamedAudioNodeOptions) {
        super(nodeType, engine, options);

        this._name = options?.name ?? "";
    }
}
