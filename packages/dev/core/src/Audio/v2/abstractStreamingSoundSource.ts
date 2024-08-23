/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractSoundSource } from "./abstractSoundSource";

export abstract class AbstractStreamingSoundSource extends AbstractSoundSource {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine);
    }
}
