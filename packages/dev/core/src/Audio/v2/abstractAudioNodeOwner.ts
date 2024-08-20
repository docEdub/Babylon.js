import type { AbstractAudioNode } from "./abstractAudioNode";
import type { IDisposable } from "../../scene";

/**
 * The base class for audio node owners.
 */
export abstract class AbstractAudioNodeOwner implements IDisposable {
    private _nodes = new Array<AbstractAudioNode>();

    /** @internal */
    public dispose(): void {
        for (const node of this._nodes) {
            node.dispose();
        }
        this._nodes.length = 0;
    }

    /** @internal */
    public addNode(node: AbstractAudioNode): AbstractAudioNode {
        if (this._nodes.includes(node)) {
            return node;
        }
        this._nodes.push(node);
        return node;
    }

    /** @internal */
    public removeNode(node: AbstractAudioNode): void {
        const index = this._nodes.indexOf(node);
        if (index > -1) {
            this._nodes.splice(index, 1);
        }
    }
}
