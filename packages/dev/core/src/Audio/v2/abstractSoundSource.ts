/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";

export abstract class AbstractSoundSource extends AbstractAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.Output);
    }
}
