import * as fs from "fs";
import * as path from "path";

import { expect, Page, test } from "@playwright/test";
import { getGlobalConfig } from "@tools/test-tools";
import "babylonjs";
import "chai";

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    interface Window {
        audioContext: AudioContext | null;
    }

    const audioContext: AudioContext;
}

const evaluatePlaywrightAudioTests = async (engineType = "webaudio", testFileName = "config", debug = false, debugWait = false, logToConsole = true, logToFile = false) => {
    debug = process.env.DEBUG === "true" || debug;

    const timeout = process.env.TIMEOUT ? +process.env.TIMEOUT : 0;

    if (process.env.TEST_FILENAME) {
        testFileName = process.env.TEST_FILENAME;
    }

    if (process.env.LOG_TO_CONSOLE) {
        logToConsole = process.env.LOG_TO_CONSOLE === "true";
    }

    const config = {
        root: "https://cdn.babylonjs.com",
    };

    const logPath = path.resolve(__dirname, `${testFileName}_${engineType}_log.txt`);

    function log(msg: any, title?: string) {
        const titleToLog = title ? `[${title}]` : "";
        if (logToConsole) {
            if (msg.type === "error") {
                console.error(titleToLog, msg);
            } else {
                console.log(titleToLog, msg);
            }
        }
        if (logToFile) {
            fs.appendFileSync(logPath, titleToLog + " " + msg + "\n", "utf8");
        }
    }

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(getGlobalConfig({ root: config.root }).baseUrl + `/empty.html`, {
            // waitUntil: "load", // for chrome should be "networkidle0"
            timeout: 0,
        });

        await page.waitForFunction(() => {
            return window.BABYLON;
        });
        page.setDefaultTimeout(0);
    });

    test.afterAll(async () => {
        await page.close();
    });

    test.beforeEach(async () => {
        page.on("console", log);
        test.setTimeout(timeout);

        await page.evaluate(async () => {
            window.audioContext = new AudioContext();
        });
    });

    test.afterEach(async () => {
        await page.evaluate(async () => {
            window.audioContext?.close();
            window.audioContext = null;
        });

        page.off("console", log);
    });

    test.describe("CreateAudioEngineAsync", () => {
        test("returns a valid audio engine when called with no parameters", async () => {
            const engine = await page.evaluate(async () => {
                const engine = await BABYLON.CreateAudioEngineAsync({ audioContext: audioContext! });
                return engine;
            });
            expect(engine).toBeTruthy();
        });
    });
};

evaluatePlaywrightAudioTests();
