/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { ISoundSourceOptions } from "./abstractSoundSource";
import { AbstractSoundSource } from "./abstractSoundSource";

export interface IStaticSoundSourceOptions extends ISoundSourceOptions {
    preload?: "none" | "metadata" | "auto";
}

export abstract class AbstractStreamingSoundSource extends AbstractSoundSource {
    public constructor(name: string, engine: AbstractAudioEngine, options?: IStaticSoundSourceOptions) {
        super(name, engine, options);
    }
}
