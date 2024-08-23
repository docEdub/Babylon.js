/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";

export abstract class AbstractAudioBusNode extends AbstractAudioNode {
    public constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine, AudioNodeType.InputOutput);
    }
}
