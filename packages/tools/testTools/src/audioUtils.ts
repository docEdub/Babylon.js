/* eslint-disable babylonjs/available */
/* eslint-disable import/no-internal-modules */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable no-console */

import { getGlobalConfig } from "./config";
import type { IStaticSoundOptions, IWebAudioEngineOptions } from "core/AudioV2";

declare const BABYLON: typeof window.BABYLON;

export class AudioTestData {
    public result: boolean;
    public soundsUrl = getGlobalConfig().assetsUrl + "/sound/testing/audioV2/";
}

export const CreateAudioEngine = async (options: Partial<IWebAudioEngineOptions> = {}): Promise<void> => {
    options.audioContext = audioContext;
    audioEngine = await BABYLON.CreateAudioEngineAsync(options);
};

export const CreateSound = (url: string, options: Partial<IStaticSoundOptions> = {}): any => {
    return audioEngine.createSoundAsync("", audioTestData.soundsUrl + url, options);
};
