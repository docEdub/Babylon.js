/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AudioNodeType } from "./abstractAudioNode";
import { AbstractNamedAudioNode } from "./abstractNamedAudioNode";

export abstract class AbstractSoundSource extends AbstractNamedAudioNode {
    public constructor(engine: AbstractAudioEngine, options?: any) {
        super(AudioNodeType.Output, engine, options);
    }
}
