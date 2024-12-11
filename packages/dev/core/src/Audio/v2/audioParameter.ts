import type { Nullable } from "../../types";

const MinExponentialValue = 0.000001;

export enum RampType {
    Linear = "linear",
    Exponential = "exponential",
    Custom = "custom",
}

/** @internal */
export function _setAudioParameterRamp(
    audioContext: AudioContext,
    parameter: AudioParam,
    value: number,
    duration: number,
    rampType: Nullable<RampType> = RampType.Exponential,
    customCurve: Nullable<Array<number>> = null
): void {
    if (rampType === RampType.Linear) {
        parameter.linearRampToValueAtTime(value, audioContext.currentTime + duration);
    } else if (rampType === RampType.Exponential) {
        value = Math.max(MinExponentialValue, value);
        parameter.value = Math.max(MinExponentialValue, parameter.value);
        parameter.exponentialRampToValueAtTime(value, audioContext.currentTime + duration);
    } else if (rampType === RampType.Custom) {
        if (!customCurve) {
            throw new Error("Custom curve is required for custom ramp type");
        }
        if (customCurve.length < 2) {
            throw new Error("Custom curve must have at least 2 values");
        }
        parameter.setValueCurveAtTime(customCurve, audioContext.currentTime, audioContext.currentTime + duration);
    } else {
        throw new Error("Invalid ramp type");
    }
}
