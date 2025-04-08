import { getGlobalConfig } from "@tools/test-tools";

export class AudioTestData {
    public result: boolean;
    public soundsUrl = getGlobalConfig().assetsUrl + "/sound/testing/audioV2/";
}

export const CreateAudioEngine = async (options: Partial<BABYLON.IWebAudioEngineOptions> = {}): Promise<void> => {
    options.audioContext = audioContext;
    audioEngine = await BABYLON.CreateAudioEngineAsync(options);
};

export const CreateSound = (url: string, options: Partial<BABYLON.IStaticSoundOptions> = {}): any => {
    return audioEngine.createSoundAsync("", audioTestData.soundsUrl + url, options);
};

export const evaluateAudioV2TestUtils = async () => {
    wait = async (seconds: number): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    };
};
