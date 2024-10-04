/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { AbstractAudioNode } from "./abstractAudioNode";
import type { IDisposable } from "../../scene";

export class AbstractAudioNodeParent implements IDisposable {
    public readonly _children = new Set<AbstractAudioNode>();

    public dispose(): void {
        if (this._children) {
            for (const node of this._children) {
                node.dispose();
            }
            this._children.clear();
        }
    }

    private _internalClass = class {
        public internalClass: AbstractAudioNodeParent["_internalClass"];

        public impl: AbstractAudioNodeParent;

        public constructor(impl: AbstractAudioNodeParent) {
            this.impl = impl;
        }

        public get children(): Set<AbstractAudioNode> {
            return this.impl._children;
        }
    };

    public internal() {
        return new this._internalClass(this);
    }
}
