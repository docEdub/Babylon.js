/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioNode } from "./abstractAudioNode";
import type { IDisposable } from "../../scene";

export interface IAudioNodeOwner extends IDisposable {
    addNode(node: AbstractAudioNode): AbstractAudioNode;
    removeNode(node: AbstractAudioNode): void;
}
