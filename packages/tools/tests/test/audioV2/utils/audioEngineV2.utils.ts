/* eslint-disable babylonjs/available */
/* eslint-disable import/no-internal-modules */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable no-console */

import type { AudioEngineV2, IStaticSoundOptions, IWebAudioEngineOptions } from "@dev/core/AudioV2";
import { test } from "@playwright/test";
import { getGlobalConfig } from "@tools/test-tools";

// Declarations for babylonServer/public/audiov2-test.js
declare global {
    let audioContext: AudioContext;
    let audioEngine: AudioEngineV2;
    let audioTestConfig: AudioTestConfig;
    let audioTestResult: AudioTestResult;

    class AudioV2Test {
        public static CreateAudioEngineAsync(options?: Partial<IWebAudioEngineOptions>): Promise<void>;
        public static CreateSoundAsync(source: string | string[], options?: Partial<IStaticSoundOptions>): Promise<any>;
        public static WaitAsync(seconds: number): Promise<void>;
    }
}

test.beforeEach(async ({ page }) => {
    await page.goto(getGlobalConfig().baseUrl + `/empty.html`, {
        timeout: 0,
    });

    await page.waitForFunction(() => {
        return window.BABYLON;
    });

    page.setDefaultTimeout(0);

    await page.evaluate(
        ({ config }: { config: AudioTestConfig }) => {
            audioTestConfig = config;

            return BABYLON.Tools.LoadScriptAsync(audioTestConfig.baseUrl + "/audiov2-test.js");
        },
        { config: new AudioTestConfig() }
    );

    await page.evaluate(() => {
        audioContext = new AudioContext();
    });
});

test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
        audioContext.close();
    });

    await page.close();
});

export class AudioTestConfig {
    public baseUrl = getGlobalConfig().baseUrl;
    public soundsUrl = getGlobalConfig().assetsUrl + "/sound/testing/audioV2/";
}

export class AudioTestResult {
    public result: boolean;
}
