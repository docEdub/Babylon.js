/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractNamedAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { AbstractSoundSource } from "./abstractSoundSource";

export abstract class AbstractSoundObject extends AbstractNamedAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.InputOutput);
    }

    private _soundSources = new Array<AbstractSoundSource>();

    public get soundSources(): ReadonlyArray<AbstractSoundSource> {
        return this._soundSources;
    }

    public play(): void {
        for (const source of this._soundSources) {
            source.play();
        }
    }
}
