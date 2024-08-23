/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AudioNodeType } from "./abstractAudioNode";
import { AbstractNamedAudioNode } from "./abstractNamedAudioNode";
import type { AbstractSoundSourceReference } from "./abstractSoundSourceReference";

export abstract class AbstractSoundObject extends AbstractNamedAudioNode {
    private _soundSourceReferences = new Array<AbstractSoundSourceReference>();

    public constructor(engine: AbstractAudioEngine, options?: any) {
        super(AudioNodeType.Output, engine, options);
    }
}
