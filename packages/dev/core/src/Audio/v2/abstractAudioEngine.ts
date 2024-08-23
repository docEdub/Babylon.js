/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import type { AbstractAudioNode } from "./abstractAudioNode";
import type { AbstractMainAudioBus, IMainAudioBusOptions } from "./abstractMainAudioBus";
import type { IAudioNodeOwner } from "./IAudioNodeOwner";

export abstract class AbstractAudioEngine implements IAudioNodeOwner {
    private _nodes = new Array<AbstractAudioNode>();

    public dispose(): void {
        for (const node of this._nodes) {
            node.dispose();
        }
        this._nodes.length = 0;
    }

    public addNode(node: AbstractAudioNode): AbstractAudioNode {
        if (this._nodes.includes(node)) {
            return node;
        }
        this._nodes.push(node);
        return node;
    }

    public removeNode(node: AbstractAudioNode): void {
        const index = this._nodes.indexOf(node);
        if (index > -1) {
            this._nodes.splice(index, 1);
        }
    }

    public abstract createDevice(options?: IAudioDeviceOptions): AbstractAudioDevice;
    public abstract createOutputBus(device: AbstractMainAudioBus, options?: IMainAudioBusOptions): AbstractMainAudioBus;
}
