/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractSoundSource } from "./abstractSoundSource";

export abstract class AbstractStreamingSound extends AbstractSoundSource {
    public constructor(engine: AbstractAudioEngine, options?: any) {
        super(engine, options);
    }
}
