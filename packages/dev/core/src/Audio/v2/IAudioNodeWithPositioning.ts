/* eslint-disable babylonjs/available */
/* eslint-disable jsdoc/require-jsdoc */

import type { Vector3 } from "../../Maths/math.vector";

export interface IAudioNodeWithPositioning {
    position: Vector3;
    orientation: Vector3;
    // etc ...
}
