import type { AbstractAudioEngine } from "./abstractAudioEngine";

/**
 * Represents an audio node in an audio engine's processing graph.
 *
 * Audio nodes can be connected together to create an audio processing graph, and they can own other audio nodes.
 */
export interface IAudioNode {
    /**
     * The audio engine this node belongs to.
     */
    engine: AbstractAudioEngine;

    /**
     * The audio node that owns this node.
     */
    owner: IAudioNode;
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
     * @param outputNode - The node to disconnect from
     */
    disconnect(inputNode: IAudioInputNode): void;
}

/**
 * Represents an audio node that can receive audio data.
 */
export interface IAudioInputNode extends IAudioNode {
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
