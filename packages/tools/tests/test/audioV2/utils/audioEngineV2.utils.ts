import { getGlobalConfig } from "@tools/test-tools";
import { Page, test } from "@playwright/test";

export interface IEvaluateAudioTestOptions {
    engineOptions: BABYLON.IWebAudioEngineOptions;
}

export class AudioTest {
    public result: boolean;
    public soundsUrl = getGlobalConfig().assetsUrl + "/sound/testing/audioV2/";
}

export function testAudio(name: string, callback: ({ page }: { page: Page }) => Promise<void>) {
    test(name, async ({ page }) => {
        await page.goto(getGlobalConfig().baseUrl + `/empty.html`, {
            timeout: 0,
        });

        await page.waitForFunction(() => {
            return window.BABYLON;
        });

        page.setDefaultTimeout(0);

        await callback({ page });

        await page.close();
    });
}

declare global {
    interface Window {
        audioEngine: BABYLON.AudioEngineV2;
    }
}

export const evaluateCreateAudioTest = async (options: Partial<IEvaluateAudioTestOptions> = {}): Promise<AudioTest> => {
    const audioTest = new AudioTest();
    await BABYLON.CreateAudioEngineAsync(options.engineOptions);
    return audioTest;
};

const evaluateInitAudioEngine = async (options: Partial<IEvaluateAudioTestOptions> = {}): Promise<void> => {
    window.audioEngine = await BABYLON.CreateAudioEngineAsync(options.engineOptions);
};

export const createAudioTest = async (page: Page, options: Partial<IEvaluateAudioTestOptions> = {}): Promise<AudioTest> => {
    const audioTest = new AudioTest();

    await page.evaluate(evaluateInitAudioEngine, options);

    return audioTest;
};

export const runAudioTestScript = async (page: Page, audioTest: AudioTest, callback: (audioTest: AudioTest) => Promise<AudioTest>) => {
    return await page.evaluate(callback, audioTest);
};
