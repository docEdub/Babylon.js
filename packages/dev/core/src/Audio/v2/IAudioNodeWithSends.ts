/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioSend } from "./abstractAudioSend";

export interface IAudioNodeWithSends {
    get sends(): ReadonlyArray<AbstractAudioSend>;

    addSend(send: AbstractAudioSend): void;
    removeSend(send: AbstractAudioSend): void;
}
