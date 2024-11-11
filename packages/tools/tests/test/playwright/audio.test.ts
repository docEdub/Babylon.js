import * as fs from "fs";
import * as path from "path";

import { expect, Page, test } from "@playwright/test";
import { getGlobalConfig } from "@tools/test-tools";
import "babylonjs";

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    interface Window {
        audioContext: AudioContext | null;
        Whisper: any;
        whisper: any;
    }

    const audioContext: AudioContext;
    const Whisper: any;
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
        await page.goto(getGlobalConfig({ root: config.root }).baseUrl + `/empty-audio.html`, {
            // waitUntil: "load", // for chrome should be "networkidle0"
            timeout: 0,
        });

        await page.evaluate(async () => {
            console.log("");
            const whisper = new Whisper();
            await whisper.init();
            window.whisper = whisper;
            console.log("");
        });

        await page.waitForFunction(() => {
            return window.BABYLON && window.Whisper;
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
    test.describe("R+D", () => {
        test("can an AudioBuffer be returned?", async () => {
            const audioArray = await page.evaluate(async () => {
                async function soundEnded(sound: BABYLON.AbstractSound): Promise<void> {
                    return new Promise<void>((resolve) => {
                        if (audioContext instanceof OfflineAudioContext) {
                            resolve();
                        } else if (audioContext instanceof AudioContext || audioContext === undefined) {
                            sound.onEndedObservable.addOnce(() => {
                                resolve();
                            });
                        }
                    });
                }

                const engine = (await BABYLON.CreateAudioEngineAsync({ audioContext: audioContext! })) as BABYLON.WebAudioEngine;

                // Start audio capture.
                const webAudioMainOutput = engine.mainOutput as BABYLON.WebAudioMainOutput;
                const nodeToCapture = webAudioMainOutput.webAudioInputNode;
                const recorderDestination = new MediaStreamAudioDestinationNode(audioContext);
                const recorder = new MediaRecorder(recorderDestination.stream);
                nodeToCapture.connect(recorderDestination);
                recorder.start();

                const sound = await BABYLON.CreateSoundAsync("", "https://amf-ms.github.io/AudioAssets/testing/3-count.mp3", engine, { autoplay: true });

                await soundEnded(sound);

                // Get captured audio.
                let renderedBuffer: AudioBuffer;

                await new Promise<void>((resolve) => {
                    recorder.addEventListener(
                        "dataavailable",
                        async (event) => {
                            const arrayBuffer = await event.data.arrayBuffer();
                            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                            // Convert audio buffer to 16kHz sample rate required by whisper.cpp.
                            const offlineAudioContext = new OfflineAudioContext(2, audioBuffer.duration * 16000, 16000);
                            const source = new AudioBufferSourceNode(offlineAudioContext, { buffer: audioBuffer });
                            source.connect(offlineAudioContext.destination);
                            source.start();
                            renderedBuffer = await offlineAudioContext.startRendering();

                            recorderDestination.disconnect();

                            resolve();
                        },
                        { once: true }
                    );
                    recorder.stop();
                });

                if (!(renderedBuffer! instanceof AudioBuffer)) {
                    throw new Error("No buffer rendered.");
                }

                if (renderedBuffer.length === 0) {
                    throw new Error("No audio data to transcribe.");
                }

                return renderedBuffer.getChannelData(0);
            });

            expect(audioArray.length).toBeGreaterThan(0);

            // console.log("");
            // const whisper = new Whisper();
            // await whisper.init();
            // console.log("");

            // const result = await whisper.transcribe(audioArray);

            // let sttOutput = await whisper.getText();
            // console.log("raw sttOutput:", sttOutput);

            // // Remove the trailing [BLANK_AUDIO] added by whisper.
            // sttOutput = sttOutput.replace("[BLANK_AUDIO]", "");

            // // Remove spaces.
            // sttOutput = sttOutput.replace(/\s+/g, "");

            // // Remove punctuation, hyphens and parenthesis added by whisper.
            // sttOutput = sttOutput.replace(/(\,|\.|\-|\(|\))/g, "");
            // sttOutput = sttOutput.toLowerCase();

            // console.log("sttOutput:", sttOutput);
        });
    });
};

evaluatePlaywrightAudioTests();
