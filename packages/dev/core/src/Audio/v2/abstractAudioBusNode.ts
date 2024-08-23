/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";
import { AbstractNamedAudioNode } from "./abstractNamedAudioNode";

export interface IAudioBusNodeOptions extends IAudioNodeOptions {}

export abstract class AbstractAudioBusNode extends AbstractNamedAudioNode {
    public constructor(engine: AbstractAudioEngine, options?: IAudioBusNodeOptions) {
        super(AudioNodeType.InputOutput, engine, options);
    }
}
