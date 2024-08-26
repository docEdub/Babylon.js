/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { AbstractSoundSource } from "./abstractSoundSource";
import { Observable } from "core/Misc";

export abstract class AbstractSoundInstance extends AbstractAudioNode {
    public constructor(source: AbstractSoundSource) {
        super(source.engine, AudioNodeType.Output);
    }

    public readonly onEndedObservable = new Observable<AbstractSoundInstance>();

    public abstract get currentTime(): number;

    public abstract play(): void;
    public abstract pause(): void;
    public abstract resume(): void;
    public abstract stop(): void;
}
