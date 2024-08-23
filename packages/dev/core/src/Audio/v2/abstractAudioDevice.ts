/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

export interface IAudioDeviceOptions extends IAudioNodeOptions {}

export abstract class AbstractAudioDevice extends AbstractAudioNode {
    public constructor(engine: AbstractAudioEngine, options?: IAudioDeviceOptions) {
        super(AudioNodeType.Input, engine, options);
    }
}
