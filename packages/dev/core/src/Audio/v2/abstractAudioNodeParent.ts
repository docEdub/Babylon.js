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

    protected static _InternalClass = class {
        public impl: AbstractAudioNodeParent;

        public constructor(impl: AbstractAudioNodeParent) {
            this.impl = impl;
        }

        public get children(): Set<AbstractAudioNode> {
            return this.impl._children;
        }
    };

    public get internal() {
        return new AbstractAudioNodeParent._InternalClass(this);
    }
}
