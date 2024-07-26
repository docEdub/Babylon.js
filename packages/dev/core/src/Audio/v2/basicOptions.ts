/* eslint-disable */
import { IBasicAudioSourceBackend } from "./basicBackend";

export interface IBasicCommonSoundOptions {
    source?: IBasicAudioSourceBackend;
    sourceUrl?: string;
    sourceUrls?: Array<string>;

    autoplay?: boolean;
    loop?: boolean;
    playbackRate?: number;
    volume?: number;
}

export interface IBasicSoundOptions extends IBasicCommonSoundOptions {
    //
}

export interface IBasicSoundStreamOptions extends IBasicCommonSoundOptions {
    //
}
