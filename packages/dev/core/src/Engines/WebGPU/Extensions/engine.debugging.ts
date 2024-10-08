import { WebGPUEngine } from "../../webgpuEngine";

WebGPUEngine.prototype._debugPushGroup = function (groupName: string, targetObject?: number): void {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }

    if (targetObject === 0 || targetObject === 1) {
        if (targetObject === 1) {
            if (this._currentRenderTarget) {
                this.unBindFramebuffer(this._currentRenderTarget);
            } else {
                this._endCurrentRenderPass();
            }
        }
        this._renderEncoder.pushDebugGroup(groupName);
    } else if (this._currentRenderPass) {
        this._currentRenderPass.pushDebugGroup(groupName);
    } else {
        this._pendingDebugCommands.push(["push", groupName]);
    }
};

WebGPUEngine.prototype._debugPopGroup = function (targetObject?: number): void {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }

    if (targetObject === 0 || targetObject === 1) {
        if (targetObject === 1) {
            if (this._currentRenderTarget) {
                this.unBindFramebuffer(this._currentRenderTarget);
            } else {
                this._endCurrentRenderPass();
            }
        }
        this._renderEncoder.popDebugGroup();
    } else if (this._currentRenderPass) {
        this._currentRenderPass.popDebugGroup();
    } else {
        this._pendingDebugCommands.push(["pop", null]);
    }
};

WebGPUEngine.prototype._debugInsertMarker = function (text: string, targetObject?: number): void {
    if (!this._options.enableGPUDebugMarkers) {
        return;
    }

    if (targetObject === 0 || targetObject === 1) {
        if (targetObject === 1) {
            if (this._currentRenderTarget) {
                this.unBindFramebuffer(this._currentRenderTarget);
            } else {
                this._endCurrentRenderPass();
            }
        }
        this._renderEncoder.insertDebugMarker(text);
    } else if (this._currentRenderPass) {
        this._currentRenderPass.insertDebugMarker(text);
    } else {
        this._pendingDebugCommands.push(["insert", text]);
    }
};

WebGPUEngine.prototype._debugFlushPendingCommands = function (): void {
    for (let i = 0; i < this._pendingDebugCommands.length; ++i) {
        const [name, param] = this._pendingDebugCommands[i];

        switch (name) {
            case "push":
                this._debugPushGroup(param!);
                break;
            case "pop":
                this._debugPopGroup();
                break;
            case "insert":
                this._debugInsertMarker(param!);
                break;
        }
    }
    this._pendingDebugCommands.length = 0;
};
