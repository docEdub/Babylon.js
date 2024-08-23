/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode } from "./abstractAudioNode";
import type { AudioNodeType, IAudioNodeOptions } from "./abstractAudioNode";

export interface INamedAudioNodeOptions extends IAudioNodeOptions {
    name?: string;
}

/**
 *
 */
export abstract class AbstractNamedAudioNode extends AbstractAudioNode {
    private _name: string;

    public get name(): string {
        return this._name;
    }

    public constructor(nodeType: AudioNodeType, engine: AbstractAudioEngine, options?: INamedAudioNodeOptions) {
        super(nodeType, engine, options);

        this._name = options?.name ?? "";
    }
}
