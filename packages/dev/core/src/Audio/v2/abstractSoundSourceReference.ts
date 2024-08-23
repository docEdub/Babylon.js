/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { AbstractSoundSource } from "./abstractSoundSource";

export abstract class AbstractSoundSourceReference extends AbstractAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.InputOutput);
    }

    private _soundSource: AbstractSoundSource;

    public get soundSource(): AbstractSoundSource {
        return this._soundSource;
    }
}
