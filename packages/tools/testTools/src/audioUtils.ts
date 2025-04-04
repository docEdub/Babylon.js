// /* eslint-disable no-console */
// /* eslint-disable @typescript-eslint/naming-convention */
// declare const BABYLON: typeof window.BABYLON;

// import * as path from "path";

// import type { Page } from "@playwright/test";
// import { test } from "@playwright/test";

// /**
//  * Class representing the result of an audio engine test.
//  */
// export class AudioEngineV2TestResult {}

// /**
//  * Evaluate the audio engine test.
//  * @param globalConfig - The global configuration object.
//  * @param options - The options for the test.
//  * @param testFunction - The test function to execute.
//  * @returns A promise that resolves to the test result.
//  */
// export const evaluateAudioEngineTest = async (
//     globalConfig: { assetsUrl: string; baseUrl: string },
//     options: {
//         audioEngineOptions?: {};
//     },
//     testFunction: () => Promise<void>
// ): Promise<AudioEngineV2TestResult> => {
//     let page: Page;

//     test.beforeAll(async ({ browser }) => {
//         page = await browser.newPage();

//         await page.goto(globalConfig.baseUrl + `/empty.html`, {
//             timeout: 0,
//         });

//         await page.waitForFunction(() => {
//             return window.BABYLON;
//         });
//         page.setDefaultTimeout(0);
//     });

//     test.afterAll(async () => {
//         await page.close();
//     });

//     const result = await page.evaluate(async (): Promise<AudioEngineV2TestResult> => {
//         const options = await (window as any).options;
//         const engine = await BABYLON.CreateAudioEngineAsync(options.audioEngineOptions);

//         await testFunction();

//         engine.dispose();

//         const result = new AudioEngineV2TestResult();

//         return new Promise((resolve) => {
//             resolve(result);
//         });
//     });

//     await page.close();

//     return result;
// };

// /**
//  * Get the base URL for audio engine V2 test sounds.
//  * @param globalConfig - The global configuration object.
//  * @returns The base URL for audio engine V2 test sounds.
//  */
// export function getAudioEngineV2TestSoundsBaseUrl(globalConfig: { assetsUrl: string }): string {
//     return path.resolve(globalConfig.assetsUrl, "sound/testing/audioV2");
// }
