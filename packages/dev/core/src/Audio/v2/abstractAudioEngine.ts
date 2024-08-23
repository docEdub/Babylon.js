/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioNode } from "./abstractAudioNode";
import type { AbstractMainAudioBus } from "./abstractMainAudioBus";
import type { IAudioNodeParent } from "./IAudioNodeParent";

export abstract class AbstractAudioEngine implements IAudioNodeParent {
    public dispose(): void {
        for (const node of this._childNodes) {
            node.dispose();
        }
        this._childNodes.length = 0;
    }

    private _childNodes = new Array<AbstractAudioNode>();

    public _addChildNode(node: AbstractAudioNode): void {
        if (!this._childNodes) {
            this._childNodes = new Array<AbstractAudioNode>();
        } else if (this._childNodes.includes(node)) {
            return;
        }

        this._childNodes.push(node);
    }

    public _removeChildNode(node: AbstractAudioNode): void {
        if (!this._childNodes) {
            return;
        }

        const index = this._childNodes.indexOf(node);
        if (index < 0) {
            return;
        }

        this._childNodes.splice(index, 1);
    }

    public abstract createDevice(name: string): AbstractAudioDevice;
    public abstract createMainBus(name: string): AbstractMainAudioBus;
}
