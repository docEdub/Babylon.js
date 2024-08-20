import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { Observable } from "../../Misc/observable";
import type { IDisposable } from "../../scene";
import type { Nullable } from "../../types";

/**
 * The options available when creating audio nodes.
 */
export interface IAudioNodeOptions {
    /**
     * The name of the audio device. Defaults to an empty string.
     */
    name?: string;
}

/**
 * The base class for audio nodes.
 *
 * Responsibilities:
 *  - Track connections to other audio nodes.
 *  - Inform audio engine when created and disposed.
 */
export class AbstractAudioNode implements IDisposable {
    private _name: string;
    private _connectedDownstreamNodes: Nullable<Array<AbstractAudioNode>>;
    private _connectedUpstreamNodes: Nullable<Array<AbstractAudioNode>>;
    private _onDownstreamNodeConnected: Nullable<Observable<AbstractAudioNode>>;
    private _onDownstreamNodeDisconnected: Nullable<Observable<AbstractAudioNode>>;
    private _onUpstreamNodeConnected: Nullable<Observable<AbstractAudioNode>>;
    private _onUpstreamNodeDisconnected: Nullable<Observable<AbstractAudioNode>>;

    /**
     * The audio engine the node belongs to.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * The name of the audio node.
     */
    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    /**
     * The connected downstream audio nodes.
     */
    public get connectedDownstreamNodes(): Array<AbstractAudioNode> {
        if (!this._connectedDownstreamNodes) {
            this._connectedDownstreamNodes = new Array<AbstractAudioNode>();
        }
        return this._connectedDownstreamNodes;
    }

    /**
     * The connected upstream audio nodes.
     */
    public get connectedUpstreamNodes(): Array<AbstractAudioNode> {
        if (!this._connectedUpstreamNodes) {
            this._connectedUpstreamNodes = new Array<AbstractAudioNode>();
        }
        return this._connectedUpstreamNodes;
    }

    /**
     * Triggered after connecting to a downstream audio node.
     */
    public get onDownstreamNodeConnected(): Observable<AbstractAudioNode> {
        if (!this._onDownstreamNodeConnected) {
            this._onDownstreamNodeConnected = new Observable<AbstractAudioNode>();
        }
        return this._onDownstreamNodeConnected;
    }

    /**
     * Triggered after disconnecting from a downstream audio node.
     */
    public get onDownstreamNodeDisconnected(): Observable<AbstractAudioNode> {
        if (!this._onDownstreamNodeDisconnected) {
            this._onDownstreamNodeDisconnected = new Observable<AbstractAudioNode>();
        }
        return this._onDownstreamNodeDisconnected;
    }

    /**
     * Triggered after connecting to an upstream audio node.
     */
    public get onUpstreamNodeConnected(): Observable<AbstractAudioNode> {
        if (!this._onUpstreamNodeConnected) {
            this._onUpstreamNodeConnected = new Observable<AbstractAudioNode>();
        }
        return this._onUpstreamNodeConnected;
    }

    /**
     * Triggered after disconnecting from an upstream audio node.
     */
    public get onUpstreamNodeDisconnected(): Observable<AbstractAudioNode> {
        if (!this._onUpstreamNodeDisconnected) {
            this._onUpstreamNodeDisconnected = new Observable<AbstractAudioNode>();
        }
        return this._onUpstreamNodeDisconnected;
    }

    /**
     * Creates a new audio node.
     * @param engine - The node's owning audio engine
     * @param options - The node's initial options
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioNodeOptions) {
        this.engine = engine;
        this._name = options?.name ?? "";

        engine.addNode(this);
    }

    /**
     * Releases all held resources.
     */
    public dispose(): void {
        if (this._connectedDownstreamNodes) {
            for (const node of this._connectedDownstreamNodes) {
                this.disconnect(node);
            }
            this._connectedDownstreamNodes.length = 0;
            this._connectedDownstreamNodes = null;
        }

        if (this._connectedUpstreamNodes) {
            for (const node of this._connectedUpstreamNodes) {
                node.disconnect(this);
            }
            this._connectedUpstreamNodes.length = 0;
            this._connectedUpstreamNodes = null;
        }

        this.engine.removeNode(this);
    }

    /**
     * Connects a downstream audio node.
     * @param node - The downstream audio node to connect
     */
    public connect(node: AbstractAudioNode): void {
        node._onConnect(this);
        this.connectedDownstreamNodes.push(node);
        this.onDownstreamNodeConnected.notifyObservers(node);
    }

    /**
     * Disconnects a downstream audio downstream node.
     * @param node - The downstream audio downstream node to disconnect
     */
    public disconnect(node: AbstractAudioNode): void {
        node._onDisconnect(this);

        if (!this._connectedDownstreamNodes) {
            return;
        }

        this._connectedDownstreamNodes = this._connectedDownstreamNodes.filter((node) => node !== node);
        this.onDownstreamNodeDisconnected.notifyObservers(node);
    }

    /**
     * Called when an upstream audio node connects.
     * @param node - The connecting upstream audio node
     */
    protected _onConnect(node: AbstractAudioNode): void {
        this.connectedUpstreamNodes.push(node);
        this.onUpstreamNodeConnected.notifyObservers(node);
    }

    /**
     * Called when an upstream audio node disconnects.
     * @param node - The disconnecting upstream audio node
     */
    protected _onDisconnect(node: AbstractAudioNode): void {
        if (!this._connectedUpstreamNodes) {
            return;
        }

        this._connectedUpstreamNodes = this._connectedUpstreamNodes.filter((node) => node !== node);
        this.onUpstreamNodeDisconnected.notifyObservers(node);
    }
}
