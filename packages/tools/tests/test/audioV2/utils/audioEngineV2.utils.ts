import { getGlobalConfig } from "@tools/test-tools";
import { Page } from "@playwright/test";

declare global {
    interface Window {
        audioEngine: BABYLON.AudioEngineV2;
    }
}

export interface IAudioTestOptions {
    engineOptions?: BABYLON.IWebAudioEngineOptions;
}

export class AudioTest {
    public result: boolean;
    public soundsUrl = getGlobalConfig().assetsUrl + "/sound/testing/audioV2/";
}

export const startAudioTest = async (page: Page, options: IAudioTestOptions = {}): Promise<AudioTest> => {
    await page.goto(getGlobalConfig().baseUrl + `/empty.html`, {
        timeout: 0,
    });

    await page.waitForFunction(() => {
        return window.BABYLON;
    });

    page.setDefaultTimeout(0);

    const audioTest = new AudioTest();

    // @ts-ignore
    await page.evaluate(
        async ({ options }: { options: IAudioTestOptions }) => {
            await BABYLON.CreateAudioEngineAsync(options.engineOptions);
        },
        { options }
    );

    return audioTest;
};
