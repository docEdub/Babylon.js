/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractNamedAudioNode, AudioNodeType } from "./abstractAudioNode";

export abstract class AbstractAudioBusNode extends AbstractNamedAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.InputOutput);
    }
}
