/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { AbstractSoundSource } from "./abstractSoundSource";

export abstract class AbstractSoundSourceReference extends AbstractAudioNode {
    private _soundSource: AbstractSoundSource;

    public constructor(engine: AbstractAudioEngine, options?: any) {
        super(AudioNodeType.InputOutput, engine, options);
    }
}
