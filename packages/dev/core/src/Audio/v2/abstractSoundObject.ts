/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { AbstractSoundSourceReference } from "./abstractSoundSourceReference";

export abstract class AbstractSoundObject extends AbstractAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.Output);
    }

    private _soundSourceReferences = new Array<AbstractSoundSourceReference>();

    public get soundSourceReferences(): ReadonlyArray<AbstractSoundSourceReference> {
        return this._soundSourceReferences;
    }
}
