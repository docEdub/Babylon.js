import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { Observable } from "../../Misc/observable";
import type { IDisposable } from "../../scene";

/**
 * Represents an audio node in an audio engine's processing graph.
 *
 * Audio nodes can be connected together to create an audio processing graph, and they can own other audio nodes.
 */
export interface IAudioNode extends IDisposable {
    /**
     * The audio engine this node belongs to.
     */
    engine: AbstractAudioEngine;
}

/**
 * Represents an audio node that can output audio data.
 */
export interface IAudioOutputNode extends IAudioNode {
    /**
     * Connects this node to another audio node.
     * @param inputNode - The node to connect to
     * @returns `true` if the connection was made, or `false` if the connection failed
     */
    connect(inputNode: IAudioInputNode): boolean;

    /**
     * Disconnects this node from another audio node.
     * @param inputNode - The node to disconnect from
     */
    disconnect(inputNode: IAudioInputNode): void;

    /**
     * Triggered after this node is connected to an audio input node.
     */
    onInputNodeConnected: Observable<IAudioInputNode>;

    /**
     * Triggered after this node is disconnected from an audio input node.
     */
    onInputNodeDisonnected: Observable<IAudioInputNode>;
}

/**
 * Represents an audio node that can receive audio data.
 */
export interface IAudioInputNode extends IAudioNode {
    /**
     * Triggered after this node is connected to an audio output node.
     */
    onOutputNodeConnected: Observable<IAudioOutputNode>;

    /**
     * Triggered after this node is disconnected from an audio output node.
     */
    onOutputNodeDisonnected: Observable<IAudioOutputNode>;

    /**
     * Called when an audio output node connects to this node.
     * @param outputNode - The node connecting to this node
     * @returns `true` if the connection was accepted, or `false` if the connection was denied
     */
    onConnect(outputNode: IAudioOutputNode): boolean;

    /**
     * Called when an audio output node disconnects from this node.
     * @param outputNode - The node disconnecting from this node
     */
    onDisconnect(outputNode: IAudioOutputNode): void;
}
