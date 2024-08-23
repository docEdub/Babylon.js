import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { Observable } from "../../Misc/observable";
import type { IDisposable } from "../../scene";

export enum AudioNodeType {
    /**
     * Input nodes receive audio data from an upstream node.
     */
    Input = 1,

    /**
     * Output nodes send audio data to a downstream node.
     */
    Output = 2,

    /**
     * Input/Output nodes receive audio data from an upstream node and send audio data to a downstream node.
     */
    InputOutput = 3,
}

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
 *  - Keep track of connections to other audio nodes.
 *  - Update audio engine when created and disposed.
 */
export class AbstractAudioNode implements IDisposable {
    private _name: string;

    /**
     * The connected downstream audio nodes.
     *
     * This property is undefined for input nodes.
     */
    public readonly connectedDownstreamNodes?: Array<AbstractAudioNode>;

    /**
     * Triggered after connecting to a downstream audio node.
     *
     * This property is undefined for input nodes.
     */
    public readonly onDownstreamNodeConnected?: Observable<AbstractAudioNode>;

    /**
     * Triggered after disconnecting from a downstream audio node.
     *
     * This property is undefined for input nodes.
     */
    public readonly onDownstreamNodeDisconnected?: Observable<AbstractAudioNode>;

    /**
     * The connected upstream audio nodes.
     *
     * This property is undefined for output nodes.
     */
    public readonly connectedUpstreamNodes?: Array<AbstractAudioNode>;

    /**
     * Triggered after connecting to an upstream audio node.
     *
     * This property is undefined for output nodes.
     */
    public readonly onUpstreamNodeConnected?: Observable<AbstractAudioNode>;

    /**
     * Triggered after disconnecting from an upstream audio node.
     *
     * This property is undefined for output nodes.
     */
    public readonly onUpstreamNodeDisconnected?: Observable<AbstractAudioNode>;

    /**
     * The audio node's audio engine.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * The audio node's name.
     */
    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    /**
     * The audio node's type.
     */
    public get type(): AudioNodeType {
        let type = 0;

        if (this.connectedDownstreamNodes) {
            type |= AudioNodeType.Output;
        }

        if (this.connectedUpstreamNodes) {
            type |= AudioNodeType.Input;
        }

        return type;
    }

    /**
     * Creates a new audio node.
     * @param nodeType - The type of audio node
     * @param engine - The node's audio engine
     * @param options - The node's initial options
     */
    public constructor(nodeType: AudioNodeType, engine: AbstractAudioEngine, options?: IAudioNodeOptions) {
        this.engine = engine;
        this._name = options?.name ?? "";

        if (nodeType | AudioNodeType.Input) {
            this.connectedDownstreamNodes = [];
            this.onDownstreamNodeConnected = new Observable<AbstractAudioNode>();
            this.onDownstreamNodeDisconnected = new Observable<AbstractAudioNode>();
        }

        if (nodeType | AudioNodeType.Output) {
            this.connectedUpstreamNodes = [];
            this.onUpstreamNodeConnected = new Observable<AbstractAudioNode>();
            this.onUpstreamNodeDisconnected = new Observable<AbstractAudioNode>();
        }

        engine.addNode(this);
    }

    /**
     * Releases all held resources.
     */
    public dispose(): void {
        if (this.connectedDownstreamNodes) {
            for (const node of this.connectedDownstreamNodes) {
                this.disconnect(node);
            }
            this.connectedDownstreamNodes.length = 0;
        }

        if (this.connectedUpstreamNodes) {
            for (const node of this.connectedUpstreamNodes) {
                node.disconnect(this);
            }
            this.connectedUpstreamNodes.length = 0;
        }

        this.engine.removeNode(this);
    }

    /**
     * Connects a downstream audio node.
     * @param node - The downstream audio node to connect
     */
    public connect(node: AbstractAudioNode): void {
        if (!this.connectedDownstreamNodes) {
            return;
        }

        if (this.connectedDownstreamNodes.includes(node)) {
            return;
        }

        if (!node._onConnect(this)) {
            return;
        }

        this.connectedDownstreamNodes.push(node);
        this.onDownstreamNodeConnected!.notifyObservers(node);
    }

    /**
     * Disconnects a downstream audio downstream node.
     * @param node - The downstream audio downstream node to disconnect
     */
    public disconnect(node: AbstractAudioNode): void {
        if (!this.connectedDownstreamNodes) {
            return;
        }

        const index = this.connectedDownstreamNodes.indexOf(node);
        if (index < 0) {
            return;
        }

        this.connectedDownstreamNodes.splice(index, 1);
        node._onDisconnect(this);
        this.onDownstreamNodeDisconnected!.notifyObservers(node);
    }

    /**
     * Called when an upstream audio node connects.
     * @param node - The connecting upstream audio node
     * @returns `true` if the connection was successful; otherwise `false`
     */
    protected _onConnect(node: AbstractAudioNode): boolean {
        if (!this.connectedUpstreamNodes) {
            return false;
        }

        if (this.connectedUpstreamNodes.includes(node)) {
            return true;
        }

        this.connectedUpstreamNodes.push(node);
        this.onUpstreamNodeConnected!.notifyObservers(node);

        return true;
    }

    /**
     * Called when an upstream audio node disconnects.
     * @param node - The disconnecting upstream audio node
     */
    protected _onDisconnect(node: AbstractAudioNode): void {
        if (!this.connectedUpstreamNodes) {
            return;
        }

        const index = this.connectedUpstreamNodes.indexOf(node);
        if (index < 0) {
            return;
        }

        this.connectedUpstreamNodes.splice(index, 1);
        this.onUpstreamNodeDisconnected!.notifyObservers(node);
    }
}
