import type { Observer } from "../Misc/observable";
import { Observable } from "../Misc/observable";
import { Logger } from "../Misc/logger";
import type { Nullable } from "../types";
import type { PointerInfo } from "../Events/pointerEvents";
import type { Scene } from "../scene";
import { Quaternion, Matrix, Vector3, TmpVectors } from "../Maths/math.vector";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import { Mesh } from "../Meshes/mesh";
import { CreateBox } from "../Meshes/Builders/boxBuilder";
import { CreateLines } from "../Meshes/Builders/linesBuilder";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior";
import type { IGizmo } from "./gizmo";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import { StandardMaterial } from "../Materials/standardMaterial";
import { PivotTools } from "../Misc/pivotTools";
import { Color3 } from "../Maths/math.color";
import type { LinesMesh } from "../Meshes/linesMesh";
import { Epsilon } from "../Maths/math.constants";
import type { IPointerEvent } from "../Events/deviceInputEvents";
import { TransformNode } from "../Meshes/transformNode";

/**
 * Interface for bounding box gizmo
 */
export interface IBoundingBoxGizmo extends IGizmo {
    /**
     * If child meshes should be ignored when calculating the bounding box. This should be set to true to avoid perf hits with heavily nested meshes.
     */
    ignoreChildren: boolean;
    /**
     * Returns true if a descendant should be included when computing the bounding box. When null, all descendants are included. If ignoreChildren is set this will be ignored.
     */
    includeChildPredicate: Nullable<(abstractMesh: AbstractMesh) => boolean>;
    /** The size of the rotation anchors attached to the bounding box */
    rotationSphereSize: number;
    /** The size of the scale boxes attached to the bounding box */
    scaleBoxSize: number;
    /**
     * If set, the rotation anchors and scale boxes will increase in size based on the distance away from the camera to have a consistent screen size
     * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
     */
    fixedDragMeshScreenSize: boolean;
    /**
     * If set, the rotation anchors and scale boxes will increase in size based on the size of the bounding box
     * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
     */
    fixedDragMeshBoundsSize: boolean;
    /**
     * The distance away from the object which the draggable meshes should appear world sized when fixedDragMeshScreenSize is set to true
     */
    fixedDragMeshScreenSizeDistanceFactor: number;
    /** True when a rotation anchor or scale box or a attached mesh is dragged */
    readonly isDragging: boolean;
    /** Fired when a rotation anchor or scale box is dragged */
    onDragStartObservable: Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>;
    /** Fired when the gizmo mesh hovering starts*/
    onHoverStartObservable: Observable<void>;
    /** Fired when the gizmo mesh hovering ends*/
    onHoverEndObservable: Observable<void>;
    /** Fired when a scale box is dragged */
    onScaleBoxDragObservable: Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>;
    /** Fired when a scale box drag is ended */
    onScaleBoxDragEndObservable: Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>;
    /** Fired when a rotation anchor is dragged */
    onRotationSphereDragObservable: Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>;
    /** Fired when a rotation anchor drag is ended */
    onRotationSphereDragEndObservable: Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>;
    /** Relative bounding box pivot used when scaling the attached node. */
    scalePivot: Nullable<Vector3>;
    /** Scale factor vector used for masking some axis */
    axisFactor: Vector3;
    /** Scale factor scalar affecting all axes' drag speed */
    scaleDragSpeed: number;
    /**
     * Sets the color of the bounding box gizmo
     * @param color the color to set
     */
    setColor(color: Color3): void;
    /** Returns an array containing all boxes used for scaling (in increasing x, y and z orders) */
    getScaleBoxes(): AbstractMesh[];
    /** Updates the bounding box information for the Gizmo */
    updateBoundingBox(): void;
    /**
     * Enables rotation on the specified axis and disables rotation on the others
     * @param axis The list of axis that should be enabled (eg. "xy" or "xyz")
     */
    setEnabledRotationAxis(axis: string): void;
    /**
     * Enables/disables scaling
     * @param enable if scaling should be enabled
     * @param homogeneousScaling defines if scaling should only be homogeneous
     */
    setEnabledScaling(enable: boolean, homogeneousScaling?: boolean): void;
    /** Enables a pointer drag behavior on the bounding box of the gizmo */
    enableDragBehavior(): void;
    /**
     * Force release the drag action by code
     */
    releaseDrag(): void;

    /** Default material used to render when gizmo is not disabled or hovered */
    coloredMaterial: StandardMaterial;
    /** Material used to render when gizmo is hovered with mouse*/
    hoverMaterial: StandardMaterial;

    /** Drag distance in babylon units that the gizmo will snap scaling to when dragged */
    scalingSnapDistance: number;
    /** Drag distance in babylon units that the gizmo will snap rotation to when dragged */
    rotationSnapDistance: number;
}

/**
 * Dragging operation in observable
 */
export const enum DragOperation {
    Rotation,
    Scaling,
}

/**
 * Bounding box gizmo
 */
export class BoundingBoxGizmo extends Gizmo implements IBoundingBoxGizmo {
    protected _lineBoundingBox: TransformNode;
    protected _rotateAnchorsParent: TransformNode;
    protected _scaleBoxesParent: TransformNode;
    protected _boundingDimensions = new Vector3(1, 1, 1);
    protected _renderObserver: Nullable<Observer<Scene>> = null;
    protected _pointerObserver: Nullable<Observer<PointerInfo>> = null;
    protected _scaleDragSpeed = 0.2;
    protected _rotateAnchorsDragBehaviors: Array<PointerDragBehavior> = [];
    protected _scaleBoxesDragBehaviors: Array<PointerDragBehavior> = [];
    /**
     * boolean updated when a rotation anchor or scale box is dragged
     */
    protected _dragging = false;

    private _tmpQuaternion = new Quaternion();
    private _tmpVector = new Vector3(0, 0, 0);
    private _tmpRotationMatrix = new Matrix();
    private _incrementalStartupValue = Vector3.Zero();
    private _incrementalAnchorStartupValue = Vector3.Zero();

    /**
     * If child meshes should be ignored when calculating the bounding box. This should be set to true to avoid perf hits with heavily nested meshes (Default: false)
     */
    public ignoreChildren = false;
    /**
     * Returns true if a descendant should be included when computing the bounding box. When null, all descendants are included. If ignoreChildren is set this will be ignored. (Default: null)
     */
    public includeChildPredicate: Nullable<(abstractMesh: AbstractMesh) => boolean> = null;

    /**
     * The size of the rotation anchors attached to the bounding box (Default: 0.1)
     */
    public rotationSphereSize = 0.1;
    /**
     * The size of the scale boxes attached to the bounding box (Default: 0.1)
     */
    public scaleBoxSize = 0.1;
    /**
     * If set, the rotation anchors and scale boxes will increase in size based on the distance away from the camera to have a consistent screen size (Default: false)
     * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
     */
    public fixedDragMeshScreenSize = false;
    /**
     * If set, the rotation anchors and scale boxes will increase in size based on the size of the bounding box
     * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
     */
    public fixedDragMeshBoundsSize = false;
    /**
     * The distance away from the object which the draggable meshes should appear world sized when fixedDragMeshScreenSize is set to true (default: 10)
     */
    public fixedDragMeshScreenSizeDistanceFactor = 10;
    /**
     * Drag distance in babylon units that the gizmo will snap scaling to when dragged
     */
    public scalingSnapDistance = 0;
    /**
     * Drag distance in babylon units that the gizmo will snap rotation to when dragged
     */
    public rotationSnapDistance = 0;
    /**
     * Fired when a rotation anchor or scale box is dragged
     */
    public onDragStartObservable = new Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>();
    /**
     * Fired when the gizmo mesh hovering starts
     */
    public onHoverStartObservable = new Observable<void>();
    /**
     * Fired when the gizmo mesh hovering ends
     */
    public onHoverEndObservable = new Observable<void>();
    /**
     * Fired when a scale box is dragged
     */
    public onScaleBoxDragObservable = new Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>();
    /**
     * Fired when a scale box drag is ended
     */
    public onScaleBoxDragEndObservable = new Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>();
    /**
     * Fired when a rotation anchor is dragged
     */
    public onRotationSphereDragObservable = new Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>();
    /**
     * Fired when a rotation anchor drag is ended
     */
    public onRotationSphereDragEndObservable = new Observable<{ dragOperation: DragOperation; dragAxis: Vector3 }>();
    /**
     * Relative bounding box pivot used when scaling the attached node. When null object with scale from the opposite corner. 0.5,0.5,0.5 for center and 0.5,0,0.5 for bottom (Default: null)
     */
    public scalePivot: Nullable<Vector3> = null;
    /**
     * Scale factor used for masking some axis
     */
    protected _axisFactor = new Vector3(1, 1, 1);

    /**
     * Incremental snap scaling (default is false). When true, with a snapDistance of 0.1, scaling will be 1.1,1.2,1.3 instead of, when false: 1.1,1.21,1.33,...
     */
    public incrementalSnap = false;

    /**
     * Sets the axis factor
     * @param factor the Vector3 value
     */
    public set axisFactor(factor: Vector3) {
        this._axisFactor = factor;
        // update scale cube visibility
        const scaleBoxes = this._scaleBoxesParent.getChildMeshes();
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    const zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                    if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                        continue;
                    }
                    if (scaleBoxes[index]) {
                        const dragAxis = new Vector3(i - 1, j - 1, k - 1);
                        dragAxis.multiplyInPlace(this._axisFactor);
                        scaleBoxes[index].setEnabled(dragAxis.lengthSquared() > Epsilon);
                    }
                    index++;
                }
            }
        }
    }

    /**
     * Gets the axis factor
     * @returns the Vector3 factor value
     */
    public get axisFactor(): Vector3 {
        return this._axisFactor;
    }

    /**
     * Sets scale drag speed value
     * @param value the new speed value
     */
    public set scaleDragSpeed(value: number) {
        this._scaleDragSpeed = value;
    }

    /**
     * Gets scale drag speed
     * @returns the scale speed number
     */
    public get scaleDragSpeed(): number {
        return this._scaleDragSpeed;
    }

    /**
     * Mesh used as a pivot to rotate the attached node
     */
    protected _anchorMesh: TransformNode;

    protected _existingMeshScale = new Vector3();

    // Dragging
    protected _dragMesh: Nullable<Mesh> = null;
    protected _pointerDragBehavior = new PointerDragBehavior();

    protected _coloredMaterial: StandardMaterial;
    protected _hoverColoredMaterial: StandardMaterial;

    // HL2 style corner mesh
    protected _cornerMesh: Nullable<Mesh> = null;

    /** Default material used to render when gizmo is not disabled or hovered */
    public get coloredMaterial() {
        return this._coloredMaterial;
    }

    /** Material used to render when gizmo is hovered with mouse*/
    public get hoverMaterial() {
        return this._hoverColoredMaterial;
    }
    /**
     * Get the pointerDragBehavior
     */
    public get pointerDragBehavior(): PointerDragBehavior {
        return this._pointerDragBehavior;
    }

    /** True when a rotation anchor or scale box or a attached mesh is dragged */
    public get isDragging() {
        return this._dragging || this._pointerDragBehavior.dragging;
    }

    /**
     * Sets the color of the bounding box gizmo
     * @param color the color to set
     */
    public setColor(color: Color3) {
        this._coloredMaterial.emissiveColor = color;
        this._hoverColoredMaterial.emissiveColor = color.clone().add(new Color3(0.3, 0.3, 0.3));
        const children = this._lineBoundingBox.getChildren();
        for (const l of children) {
            if ((l as LinesMesh).color) {
                (l as LinesMesh).color = color;
            }
        }
    }
    /**
     * Creates an BoundingBoxGizmo
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(color: Color3 = Color3.Gray(), gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultKeepDepthUtilityLayer) {
        super(gizmoLayer);

        // Do not update the gizmo's scale so it has a fixed size to the object its attached to
        this.updateScale = false;

        this._anchorMesh = new TransformNode("anchor", gizmoLayer.utilityLayerScene);
        // Create Materials
        this._coloredMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        this._coloredMaterial.disableLighting = true;
        this._hoverColoredMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        this._hoverColoredMaterial.disableLighting = true;

        // Build bounding box out of lines
        this._lineBoundingBox = new TransformNode("", gizmoLayer.utilityLayerScene);
        this._lineBoundingBox.rotationQuaternion = new Quaternion();
        const lines = [];
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(this._boundingDimensions.x, 0, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(0, this._boundingDimensions.y, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(0, 0, this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(this._boundingDimensions.x, 0, 0), new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, 0)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(this._boundingDimensions.x, 0, 0), new Vector3(this._boundingDimensions.x, 0, this._boundingDimensions.z)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(0, this._boundingDimensions.y, 0), new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, 0)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(0, this._boundingDimensions.y, 0), new Vector3(0, this._boundingDimensions.y, this._boundingDimensions.z)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(0, 0, this._boundingDimensions.z), new Vector3(this._boundingDimensions.x, 0, this._boundingDimensions.z)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                { points: [new Vector3(0, 0, this._boundingDimensions.z), new Vector3(0, this._boundingDimensions.y, this._boundingDimensions.z)] },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                {
                    points: [
                        new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, this._boundingDimensions.z),
                        new Vector3(0, this._boundingDimensions.y, this._boundingDimensions.z),
                    ],
                },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                {
                    points: [
                        new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, this._boundingDimensions.z),
                        new Vector3(this._boundingDimensions.x, 0, this._boundingDimensions.z),
                    ],
                },
                gizmoLayer.utilityLayerScene
            )
        );
        lines.push(
            CreateLines(
                "lines",
                {
                    points: [
                        new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, this._boundingDimensions.z),
                        new Vector3(this._boundingDimensions.x, this._boundingDimensions.y, 0),
                    ],
                },
                gizmoLayer.utilityLayerScene
            )
        );
        for (const l of lines) {
            l.color = color;
            l.position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
            l.isPickable = false;
            this._lineBoundingBox.addChild(l);
        }
        this._rootMesh.addChild(this._lineBoundingBox);

        this.setColor(color);

        // Create rotation anchors
        this._rotateAnchorsParent = new TransformNode("", gizmoLayer.utilityLayerScene);
        this._rotateAnchorsParent.rotationQuaternion = new Quaternion();
        for (let i = 0; i < 12; i++) {
            const anchor = CreateBox("", { width: i < 4 || i >= 8 ? 1.6 : 0.4, height: i >= 4 && i < 8 ? 1.6 : 0.4, depth: 0.4 }, gizmoLayer.utilityLayerScene);
            anchor.rotation.x = i < 4 || i >= 8 ? Math.PI * 0.25 : 0;
            anchor.rotation.y = i >= 4 && i < 8 ? Math.PI * 0.25 : 0;
            anchor.bakeTransformIntoVertices(anchor.computeWorldMatrix(true));
            anchor.rotationQuaternion = new Quaternion();
            anchor.material = this._coloredMaterial;
            anchor.isNearGrabbable = true;

            // Drag behavior
            const rotateAnchorsDragBehavior = new PointerDragBehavior({});
            rotateAnchorsDragBehavior.moveAttached = false;
            rotateAnchorsDragBehavior.updateDragPlane = false;
            anchor.addBehavior(rotateAnchorsDragBehavior);
            const startingTurnDirection = new Vector3(1, 0, 0);
            let totalTurnAmountOfDrag = 0;
            let previousProjectDist = 0;
            rotateAnchorsDragBehavior.onDragStartObservable.add(() => {
                startingTurnDirection.copyFrom(anchor.forward);
                totalTurnAmountOfDrag = 0;
                previousProjectDist = 0;
            });
            const computeAxis = function () {
                const dragAxisIndex = Math.floor(i / 4);
                TmpVectors.Vector3[0].set(dragAxisIndex == 0 ? 1 : 0, dragAxisIndex == 1 ? 1 : 0, dragAxisIndex == 2 ? 1 : 0);
                return TmpVectors.Vector3[0];
            };
            rotateAnchorsDragBehavior.onDragObservable.add((event) => {
                this.onRotationSphereDragObservable.notifyObservers({ dragOperation: DragOperation.Rotation, dragAxis: computeAxis().clone() });
                if (this.attachedMesh) {
                    const originalParent = this.attachedMesh.parent;
                    if (originalParent && (originalParent as Mesh).scaling && (originalParent as Mesh).scaling.isNonUniformWithinEpsilon(0.001)) {
                        Logger.Warn("BoundingBoxGizmo controls are not supported on child meshes with non-uniform parent scaling");
                        return;
                    }
                    PivotTools._RemoveAndStorePivotPoint(this.attachedMesh);

                    const worldDragDirection = startingTurnDirection;

                    // Project the world right on to the drag plane
                    const toSub = event.dragPlaneNormal.scale(Vector3.Dot(event.dragPlaneNormal, worldDragDirection));
                    const dragAxis = worldDragDirection.subtract(toSub).normalizeToNew();

                    // project drag delta on to the resulting drag axis and rotate based on that
                    let projectDist = Vector3.Dot(dragAxis, event.delta) < 0 ? Math.abs(event.delta.length()) : -Math.abs(event.delta.length());

                    // Make rotation relative to size of mesh.
                    projectDist = (projectDist / this._boundingDimensions.length()) * this._anchorMesh.scaling.length();

                    // Rotate based on axis
                    if (!this.attachedMesh.rotationQuaternion) {
                        this.attachedMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(
                            this.attachedMesh.rotation.y,
                            this.attachedMesh.rotation.x,
                            this.attachedMesh.rotation.z
                        );
                    }
                    if (!this._anchorMesh.rotationQuaternion) {
                        this._anchorMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(
                            this._anchorMesh.rotation.y,
                            this._anchorMesh.rotation.x,
                            this._anchorMesh.rotation.z
                        );
                    }

                    // Do not allow the object to turn more than a full circle
                    totalTurnAmountOfDrag += projectDist;
                    if (Math.abs(totalTurnAmountOfDrag) <= 2 * Math.PI) {
                        if (this.rotationSnapDistance > 0) {
                            const dragSteps = Math.floor(Math.abs(totalTurnAmountOfDrag) / this.rotationSnapDistance) * (totalTurnAmountOfDrag < 0 ? -1 : 1);
                            const angle = this.rotationSnapDistance * dragSteps;
                            projectDist = angle - previousProjectDist;
                            previousProjectDist = angle;
                        }
                        if (i >= 8) {
                            Quaternion.RotationYawPitchRollToRef(0, 0, projectDist, this._tmpQuaternion);
                        } else if (i >= 4) {
                            Quaternion.RotationYawPitchRollToRef(projectDist, 0, 0, this._tmpQuaternion);
                        } else {
                            Quaternion.RotationYawPitchRollToRef(0, projectDist, 0, this._tmpQuaternion);
                        }

                        // if using pivot, move anchor so mesh will be at relative (0,0,0) when parented
                        if (this.attachedMesh.isUsingPivotMatrix()) {
                            this._anchorMesh.position.copyFrom(this.attachedMesh.position);
                        }
                        // Rotate around center of bounding box
                        this._anchorMesh.addChild(this.attachedMesh);
                        if (this._anchorMesh.getScene().useRightHandedSystem) {
                            this._tmpQuaternion.conjugateInPlace();
                        }
                        this._tmpQuaternion.normalize();
                        this._anchorMesh.rotationQuaternion.multiplyToRef(this._tmpQuaternion, this._anchorMesh.rotationQuaternion);
                        this._anchorMesh.rotationQuaternion.normalize();
                        this._anchorMesh.removeChild(this.attachedMesh);
                        this.attachedMesh.setParent(originalParent);
                    }
                    this.updateBoundingBox();

                    PivotTools._RestorePivotPoint(this.attachedMesh);
                }
                this._updateDummy();
            });

            // Selection/deselection
            rotateAnchorsDragBehavior.onDragStartObservable.add(() => {
                this.onDragStartObservable.notifyObservers({ dragOperation: DragOperation.Rotation, dragAxis: computeAxis().clone() });
                this._dragging = true;
                this._selectNode(anchor);
            });
            rotateAnchorsDragBehavior.onDragEndObservable.add((event) => {
                this.onRotationSphereDragEndObservable.notifyObservers({ dragOperation: DragOperation.Rotation, dragAxis: computeAxis().clone() });
                this._dragging = false;
                this._selectNode(null);
                this._updateDummy();
                this._unhoverMeshOnTouchUp(event.pointerInfo, anchor);
            });

            this._rotateAnchorsDragBehaviors.push(rotateAnchorsDragBehavior);

            this._rotateAnchorsParent.addChild(anchor);
        }
        this._rootMesh.addChild(this._rotateAnchorsParent);

        // Create scale cubes
        this._scaleBoxesParent = new TransformNode("", gizmoLayer.utilityLayerScene);
        this._scaleBoxesParent.rotationQuaternion = new Quaternion();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    // create box for relevant axis
                    const zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                    if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                        continue;
                    }

                    const box = zeroAxisCount === 2 ? CreateBox("", { size: 1 }, gizmoLayer.utilityLayerScene) : this._getCornerMesh(gizmoLayer);
                    if (zeroAxisCount === 0) {
                        box.rotationQuaternion = Quaternion.FromEulerAngles(j * 0.25 * Math.PI, (k + 3 * i - i * k) * 0.25 * Math.PI, 0);
                    }

                    box.material = this._coloredMaterial;
                    box._internalMetadata = zeroAxisCount === 2; // None homogenous scale handle
                    box.isNearGrabbable = true;

                    // box is oriented so, transform world desired axis to local one
                    TmpVectors.Vector3[0].set(i - 1, j - 1, k - 1);
                    TmpVectors.Vector3[0].normalize();
                    box.computeWorldMatrix(true).invertToRef(TmpVectors.Matrix[0]);
                    const dragAxis = Vector3.TransformCoordinates(TmpVectors.Vector3[0], TmpVectors.Matrix[0]);
                    dragAxis.normalize();

                    // Dragging logic
                    const scaleBoxesDragBehavior = new PointerDragBehavior({ dragAxis: dragAxis });
                    scaleBoxesDragBehavior.updateDragPlane = false;
                    scaleBoxesDragBehavior.moveAttached = false;
                    let totalRelativeDragDistance = 0;
                    let previousScale = 0;
                    box.addBehavior(scaleBoxesDragBehavior);
                    scaleBoxesDragBehavior.onDragObservable.add((event) => {
                        this.onScaleBoxDragObservable.notifyObservers({ dragOperation: DragOperation.Scaling, dragAxis: new Vector3(i - 1, j - 1, k - 1) });
                        if (this.attachedMesh) {
                            const originalParent = this.attachedMesh.parent;
                            if (originalParent && (originalParent as Mesh).scaling && (originalParent as Mesh).scaling.isNonUniformWithinEpsilon(0.001)) {
                                Logger.Warn("BoundingBoxGizmo controls are not supported on child meshes with non-uniform parent scaling");
                                return;
                            }
                            PivotTools._RemoveAndStorePivotPoint(this.attachedMesh);
                            let relativeDragDistance = (event.dragDistance / this._boundingDimensions.length()) * this._anchorMesh.scaling.length();
                            totalRelativeDragDistance += relativeDragDistance;
                            if (this.scalingSnapDistance > 0) {
                                const dragSteps = Math.floor(Math.abs(totalRelativeDragDistance) / this.scalingSnapDistance) * (totalRelativeDragDistance < 0 ? -1 : 1);
                                const scale = this.scalingSnapDistance * dragSteps;
                                relativeDragDistance = scale - previousScale;
                                previousScale = scale;
                            }

                            const deltaScale = new Vector3(relativeDragDistance, relativeDragDistance, relativeDragDistance);
                            const fullScale = new Vector3(previousScale, previousScale, previousScale);

                            if (zeroAxisCount === 2) {
                                // scale on 1 axis when using the anchor box in the face middle
                                deltaScale.x *= Math.abs(dragAxis.x);
                                deltaScale.y *= Math.abs(dragAxis.y);
                                deltaScale.z *= Math.abs(dragAxis.z);
                            }

                            deltaScale.scaleInPlace(this._scaleDragSpeed);
                            deltaScale.multiplyInPlace(this._axisFactor);

                            fullScale.scaleInPlace(this._scaleDragSpeed);
                            fullScale.multiplyInPlace(this._axisFactor);
                            fullScale.addInPlace(this._incrementalStartupValue);

                            this.updateBoundingBox();
                            if (this.scalePivot) {
                                this.attachedMesh.getWorldMatrix().getRotationMatrixToRef(this._tmpRotationMatrix);
                                // Move anchor to desired pivot point (Bottom left corner + dimension/2)
                                this._boundingDimensions.scaleToRef(0.5, this._tmpVector);
                                Vector3.TransformCoordinatesToRef(this._tmpVector, this._tmpRotationMatrix, this._tmpVector);
                                this._anchorMesh.position.subtractInPlace(this._tmpVector);
                                this._boundingDimensions.multiplyToRef(this.scalePivot, this._tmpVector);
                                Vector3.TransformCoordinatesToRef(this._tmpVector, this._tmpRotationMatrix, this._tmpVector);
                                this._anchorMesh.position.addInPlace(this._tmpVector);
                            } else {
                                // Scale from the position of the opposite corner
                                box.absolutePosition.subtractToRef(this._anchorMesh.position, this._tmpVector);
                                this._anchorMesh.position.subtractInPlace(this._tmpVector);
                                if (this.attachedMesh.isUsingPivotMatrix()) {
                                    this._anchorMesh.position.subtractInPlace(this.attachedMesh.getPivotPoint());
                                }
                            }

                            this._anchorMesh.addChild(this.attachedMesh);
                            if (this.incrementalSnap) {
                                fullScale.x /= Math.abs(this._incrementalStartupValue.x) < Epsilon ? 1 : this._incrementalStartupValue.x;
                                fullScale.y /= Math.abs(this._incrementalStartupValue.y) < Epsilon ? 1 : this._incrementalStartupValue.y;
                                fullScale.z /= Math.abs(this._incrementalStartupValue.z) < Epsilon ? 1 : this._incrementalStartupValue.z;

                                fullScale.x = Math.max(this._incrementalAnchorStartupValue.x * fullScale.x, this.scalingSnapDistance);
                                fullScale.y = Math.max(this._incrementalAnchorStartupValue.y * fullScale.y, this.scalingSnapDistance);
                                fullScale.z = Math.max(this._incrementalAnchorStartupValue.z * fullScale.z, this.scalingSnapDistance);

                                this._anchorMesh.scaling.x += (fullScale.x - this._anchorMesh.scaling.x) * Math.abs(dragAxis.x);
                                this._anchorMesh.scaling.y += (fullScale.y - this._anchorMesh.scaling.y) * Math.abs(dragAxis.y);
                                this._anchorMesh.scaling.z += (fullScale.z - this._anchorMesh.scaling.z) * Math.abs(dragAxis.z);
                            } else {
                                this._anchorMesh.scaling.addInPlace(deltaScale);
                                if (this._anchorMesh.scaling.x < 0 || this._anchorMesh.scaling.y < 0 || this._anchorMesh.scaling.z < 0) {
                                    this._anchorMesh.scaling.subtractInPlace(deltaScale);
                                }
                            }
                            this._anchorMesh.removeChild(this.attachedMesh);
                            this.attachedMesh.setParent(originalParent);
                            PivotTools._RestorePivotPoint(this.attachedMesh);
                        }
                        this._updateDummy();
                    });

                    // Selection/deselection
                    scaleBoxesDragBehavior.onDragStartObservable.add(() => {
                        this.onDragStartObservable.notifyObservers({ dragOperation: DragOperation.Scaling, dragAxis: new Vector3(i - 1, j - 1, k - 1) });
                        this._dragging = true;
                        this._selectNode(box);
                        totalRelativeDragDistance = 0;
                        previousScale = 0;
                        this._incrementalStartupValue.copyFrom(this.attachedMesh!.scaling);
                        this._incrementalAnchorStartupValue.copyFrom(this._anchorMesh.scaling);
                    });
                    scaleBoxesDragBehavior.onDragEndObservable.add((event) => {
                        this.onScaleBoxDragEndObservable.notifyObservers({ dragOperation: DragOperation.Scaling, dragAxis: new Vector3(i - 1, j - 1, k - 1) });
                        this._dragging = false;
                        this._selectNode(null);
                        this._updateDummy();
                        this._unhoverMeshOnTouchUp(event.pointerInfo, box);
                    });

                    this._scaleBoxesParent.addChild(box);
                    this._scaleBoxesDragBehaviors.push(scaleBoxesDragBehavior);
                }
            }
        }
        this._rootMesh.addChild(this._scaleBoxesParent);

        // Hover color change
        const pointerIds: AbstractMesh[] = [];
        this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add((pointerInfo) => {
            if (!pointerIds[(<IPointerEvent>pointerInfo.event).pointerId]) {
                const meshes = this._rotateAnchorsParent.getChildMeshes().concat(this._scaleBoxesParent.getChildMeshes());

                for (const mesh of meshes) {
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh == mesh) {
                        pointerIds[(<IPointerEvent>pointerInfo.event).pointerId] = mesh;
                        mesh.material = this._hoverColoredMaterial;
                        this.onHoverStartObservable.notifyObservers();
                        this._isHovered = true;
                    }
                }
            } else {
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh != pointerIds[(<IPointerEvent>pointerInfo.event).pointerId]) {
                    pointerIds[(<IPointerEvent>pointerInfo.event).pointerId].material = this._coloredMaterial;
                    pointerIds.splice((<IPointerEvent>pointerInfo.event).pointerId, 1);
                    this.onHoverEndObservable.notifyObservers();
                    this._isHovered = false;
                }
            }
        });

        // Update bounding box positions
        this._renderObserver = this.gizmoLayer.originalScene.onBeforeRenderObservable.add(() => {
            // Only update the bounding box if scaling has changed
            if (this.attachedMesh && !this._existingMeshScale.equals(this.attachedMesh.scaling)) {
                this.updateBoundingBox();
            } else if (this.fixedDragMeshScreenSize || this.fixedDragMeshBoundsSize) {
                this._updateRotationAnchors();
                this._updateScaleBoxes();
            }

            // If drag mesh is enabled and dragging, update the attached mesh pose to match the drag mesh
            if (this._dragMesh && this.attachedMesh && this._pointerDragBehavior.dragging) {
                this._lineBoundingBox.position.rotateByQuaternionToRef(this._rootMesh.rotationQuaternion!, this._tmpVector);
                this.attachedMesh.setAbsolutePosition(this._dragMesh.position.add(this._tmpVector.scale(-1)));
            }
        });
        this.updateBoundingBox();
    }

    protected _getCornerMesh(gizmoLayer: UtilityLayerRenderer): Mesh {
        if (!this._cornerMesh) {
            const boxZ = CreateBox("", { width: 0.4, height: 0.4, depth: 1.6 }, gizmoLayer.utilityLayerScene);
            boxZ.position.z = 0.6;
            const boxY = CreateBox("", { width: 0.4, height: 1.6, depth: 0.4 }, gizmoLayer.utilityLayerScene);
            boxY.position.y = 0.6;
            const boxX = CreateBox("", { width: 1.6, height: 0.4, depth: 0.4 }, gizmoLayer.utilityLayerScene);
            boxX.position.x = 0.6;
            this._cornerMesh = Mesh.MergeMeshes([boxX, boxY, boxZ], true);
            return this._cornerMesh!;
        }

        return this._cornerMesh.clone();
    }

    /**
     * returns true if the combination of non uniform scaling and rotation of the attached mesh is not supported
     * In that case, the matrix is skewed and the bounding box gizmo will not work correctly
     * @returns True if the combination is not supported, otherwise false.
     */
    protected _hasInvalidNonUniformScaling() {
        return (
            this._attachedMesh?.parent instanceof TransformNode &&
            this._attachedMesh?.parent.absoluteScaling.isNonUniformWithinEpsilon(0.001) &&
            ((this._attachedMesh?.rotationQuaternion && !this._attachedMesh?.rotationQuaternion.equalsWithEpsilon(Quaternion.Identity(), Epsilon)) ||
                this._attachedMesh?.rotation.equalsWithEpsilon(Vector3.Zero(), Epsilon) === false)
        );
    }
    protected override _attachedNodeChanged(value: Nullable<AbstractMesh>) {
        if (value) {
            if (this._hasInvalidNonUniformScaling()) {
                Logger.Warn("BoundingBoxGizmo controls are not supported on meshes with non-uniform scaling and rotation");
                return;
            }
            // Reset anchor mesh to match attached mesh's scale
            // This is needed to avoid invalid box/anchor position on first drag
            this._anchorMesh.scaling.setAll(1);
            PivotTools._RemoveAndStorePivotPoint(value);
            const originalParent = value.parent;
            this._anchorMesh.addChild(value);
            this._anchorMesh.removeChild(value);
            value.setParent(originalParent);
            PivotTools._RestorePivotPoint(value);
            this.updateBoundingBox();
            const children = value.getChildMeshes(false);
            for (const m of children) {
                m.markAsDirty("scaling");
            }

            this.gizmoLayer.utilityLayerScene.onAfterRenderObservable.addOnce(() => {
                this._updateDummy();
            });
        }
    }

    protected _selectNode(selectedMesh: Nullable<Mesh>) {
        const meshes = this._rotateAnchorsParent.getChildMeshes().concat(this._scaleBoxesParent.getChildMeshes());

        for (const m of meshes) {
            m.isVisible = !selectedMesh || m == selectedMesh;
        }
    }

    protected _unhoverMeshOnTouchUp(pointerInfo: Nullable<PointerInfo>, selectedMesh: AbstractMesh) {
        // force unhover mesh if not a mouse event
        if (pointerInfo?.event instanceof PointerEvent && pointerInfo?.event.pointerType === "touch") {
            selectedMesh.material = this._coloredMaterial;
        }
    }

    /**
     * returns an array containing all boxes used for scaling (in increasing x, y and z orders)
     * @returns array of scaling boxes
     */
    public getScaleBoxes() {
        return this._scaleBoxesParent.getChildMeshes();
    }

    /**
     * Updates the bounding box information for the Gizmo
     */
    public updateBoundingBox() {
        if (this.attachedMesh && !this._hasInvalidNonUniformScaling()) {
            PivotTools._RemoveAndStorePivotPoint(this.attachedMesh);

            // Store original parent
            const originalParent = this.attachedMesh.parent;
            this.attachedMesh.setParent(null);

            this._update();

            // Rotate based on axis
            if (!this.attachedMesh.rotationQuaternion) {
                this.attachedMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(this.attachedMesh.rotation.y, this.attachedMesh.rotation.x, this.attachedMesh.rotation.z);
            }
            if (!this._anchorMesh.rotationQuaternion) {
                this._anchorMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(this._anchorMesh.rotation.y, this._anchorMesh.rotation.x, this._anchorMesh.rotation.z);
            }
            this._anchorMesh.rotationQuaternion.copyFrom(this.attachedMesh.rotationQuaternion);

            // Store original position and reset mesh to origin before computing the bounding box
            this._tmpQuaternion.copyFrom(this.attachedMesh.rotationQuaternion);
            this._tmpVector.copyFrom(this.attachedMesh.position);
            this.attachedMesh.rotationQuaternion.set(0, 0, 0, 1);
            this.attachedMesh.position.set(0, 0, 0);

            // Update bounding dimensions/positions
            const boundingMinMax = this.attachedMesh.getHierarchyBoundingVectors(!this.ignoreChildren, this.includeChildPredicate);
            boundingMinMax.max.subtractToRef(boundingMinMax.min, this._boundingDimensions);

            // Update gizmo to match bounding box scaling and rotation
            // The position set here is the offset from the origin for the boundingbox when the attached mesh is at the origin
            // The position of the gizmo is then set to the attachedMesh in gizmo._update
            this._lineBoundingBox.scaling.copyFrom(this._boundingDimensions);
            this._lineBoundingBox.position.set(
                (boundingMinMax.max.x + boundingMinMax.min.x) / 2,
                (boundingMinMax.max.y + boundingMinMax.min.y) / 2,
                (boundingMinMax.max.z + boundingMinMax.min.z) / 2
            );
            this._rotateAnchorsParent.position.copyFrom(this._lineBoundingBox.position);
            this._scaleBoxesParent.position.copyFrom(this._lineBoundingBox.position);
            this._lineBoundingBox.computeWorldMatrix();
            this._anchorMesh.position.copyFrom(this._lineBoundingBox.absolutePosition);

            // Restore position/rotation values
            this.attachedMesh.rotationQuaternion.copyFrom(this._tmpQuaternion);
            this.attachedMesh.position.copyFrom(this._tmpVector);

            // Restore original parent
            this.attachedMesh.setParent(originalParent);
        }

        this._updateRotationAnchors();
        this._updateScaleBoxes();

        if (this.attachedMesh) {
            this._existingMeshScale.copyFrom(this.attachedMesh.scaling);
            PivotTools._RestorePivotPoint(this.attachedMesh);
        }
    }

    protected _updateRotationAnchors() {
        const rotateAnchors = this._rotateAnchorsParent.getChildMeshes();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    const index = i * 4 + j * 2 + k;
                    rotateAnchors[index].position.normalizeToRef(TmpVectors.Vector3[0]);
                    if (i == 0) {
                        rotateAnchors[index].position.set(0, this._boundingDimensions.y * (j - 0.5), this._boundingDimensions.z * (k - 0.5));
                        TmpVectors.Vector3[1].set(1, 0, 0);
                    }
                    if (i == 1) {
                        rotateAnchors[index].position.set(this._boundingDimensions.x * (j - 0.5), 0, this._boundingDimensions.z * (k - 0.5));
                        TmpVectors.Vector3[1].set(0, 1, 0);
                    }
                    if (i == 2) {
                        rotateAnchors[index].position.set(this._boundingDimensions.x * (j - 0.5), this._boundingDimensions.y * (k - 0.5), 0);
                        TmpVectors.Vector3[1].set(0, 0, 1);
                    }
                    const target = TmpVectors.Vector3[2];
                    Vector3.CrossToRef(TmpVectors.Vector3[0], TmpVectors.Vector3[1], target);
                    target.normalize();
                    target.addInPlace(rotateAnchors[index].position);
                    rotateAnchors[index].lookAt(target);

                    if (this.fixedDragMeshScreenSize && this.gizmoLayer.utilityLayerScene.activeCamera) {
                        rotateAnchors[index].absolutePosition.subtractToRef(this.gizmoLayer.utilityLayerScene.activeCamera.position, this._tmpVector);
                        const distanceFromCamera = (this.rotationSphereSize * this._tmpVector.length()) / this.fixedDragMeshScreenSizeDistanceFactor;
                        rotateAnchors[index].scaling.set(distanceFromCamera, distanceFromCamera, distanceFromCamera);
                    } else if (this.fixedDragMeshBoundsSize) {
                        rotateAnchors[index].scaling.set(
                            this.rotationSphereSize * this._boundingDimensions.x,
                            this.rotationSphereSize * this._boundingDimensions.y,
                            this.rotationSphereSize * this._boundingDimensions.z
                        );
                    } else {
                        rotateAnchors[index].scaling.set(this.rotationSphereSize, this.rotationSphereSize, this.rotationSphereSize);
                    }
                }
            }
        }
    }

    protected _updateScaleBoxes() {
        const scaleBoxes = this._scaleBoxesParent.getChildMeshes();
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    const zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                    if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                        continue;
                    }
                    if (scaleBoxes[index]) {
                        scaleBoxes[index].position.set(this._boundingDimensions.x * (i / 2), this._boundingDimensions.y * (j / 2), this._boundingDimensions.z * (k / 2));
                        scaleBoxes[index].position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
                        if (this.fixedDragMeshScreenSize && this.gizmoLayer.utilityLayerScene.activeCamera) {
                            scaleBoxes[index].absolutePosition.subtractToRef(this.gizmoLayer.utilityLayerScene.activeCamera.globalPosition, this._tmpVector);
                            const distanceFromCamera = (this.scaleBoxSize * this._tmpVector.length()) / this.fixedDragMeshScreenSizeDistanceFactor;
                            scaleBoxes[index].scaling.set(distanceFromCamera, distanceFromCamera, distanceFromCamera);
                        } else if (this.fixedDragMeshBoundsSize) {
                            scaleBoxes[index].scaling.set(
                                this.scaleBoxSize * this._boundingDimensions.x,
                                this.scaleBoxSize * this._boundingDimensions.y,
                                this.scaleBoxSize * this._boundingDimensions.z
                            );
                        } else {
                            scaleBoxes[index].scaling.set(this.scaleBoxSize, this.scaleBoxSize, this.scaleBoxSize);
                        }
                    }
                    index++;
                }
            }
        }
    }

    /**
     * Enables rotation on the specified axis and disables rotation on the others
     * @param axis The list of axis that should be enabled (eg. "xy" or "xyz")
     */
    public setEnabledRotationAxis(axis: string) {
        const meshes = this._rotateAnchorsParent.getChildMeshes();
        for (let i = 0; i < meshes.length; i++) {
            const m = meshes[i] as Mesh;
            if (i < 4) {
                m.setEnabled(axis.indexOf("x") != -1);
            } else if (i < 8) {
                m.setEnabled(axis.indexOf("y") != -1);
            } else {
                m.setEnabled(axis.indexOf("z") != -1);
            }
        }
    }

    /**
     * Enables/disables scaling
     * @param enable if scaling should be enabled
     * @param homogeneousScaling defines if scaling should only be homogeneous
     */
    public setEnabledScaling(enable: boolean, homogeneousScaling = false) {
        const meshes = this._scaleBoxesParent.getChildMeshes();
        for (const m of meshes) {
            let enableMesh = enable;
            // Disable heterogeneous scale handles if requested.
            if (homogeneousScaling && m._internalMetadata === true) {
                enableMesh = false;
            }
            m.setEnabled(enableMesh);
        }
    }

    protected _updateDummy() {
        if (this._dragMesh) {
            this._dragMesh.position.copyFrom(this._lineBoundingBox.getAbsolutePosition());
            this._dragMesh.scaling.copyFrom(this._lineBoundingBox.scaling);
            this._dragMesh.rotationQuaternion!.copyFrom(this._rootMesh.rotationQuaternion!);
        }
    }

    /**
     * Enables a pointer drag behavior on the bounding box of the gizmo
     */
    public enableDragBehavior() {
        this._dragMesh = CreateBox("dummy", { size: 1 }, this.gizmoLayer.utilityLayerScene);
        this._dragMesh.visibility = 0;
        this._dragMesh.rotationQuaternion = new Quaternion();
        this._pointerDragBehavior.useObjectOrientationForDragging = false;
        this._dragMesh.addBehavior(this._pointerDragBehavior);
    }

    /**
     * Force release the drag action by code
     */
    public releaseDrag() {
        for (const dragBehavior of this._scaleBoxesDragBehaviors) {
            dragBehavior.releaseDrag();
        }
        for (const dragBehavior of this._rotateAnchorsDragBehaviors) {
            dragBehavior.releaseDrag();
        }
        this._pointerDragBehavior.releaseDrag();
    }

    /**
     * Disposes of the gizmo
     */
    public override dispose() {
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.gizmoLayer.originalScene.onBeforeRenderObservable.remove(this._renderObserver);
        this._lineBoundingBox.dispose();
        this._rotateAnchorsParent.dispose();
        this._scaleBoxesParent.dispose();
        if (this._dragMesh) {
            this._dragMesh.dispose();
        }
        this._scaleBoxesDragBehaviors.length = 0;
        this._rotateAnchorsDragBehaviors.length = 0;
        this.onDragStartObservable.clear();
        this.onHoverStartObservable.clear();
        this.onHoverEndObservable.clear();
        this.onScaleBoxDragObservable.clear();
        this.onScaleBoxDragEndObservable.clear();
        this.onRotationSphereDragObservable.clear();
        this.onRotationSphereDragEndObservable.clear();
        super.dispose();
    }

    /**
     * Makes a mesh not pickable and wraps the mesh inside of a bounding box mesh that is pickable. (This is useful to avoid picking within complex geometry)
     * @param mesh the mesh to wrap in the bounding box mesh and make not pickable
     * @returns the bounding box mesh with the passed in mesh as a child
     */
    public static MakeNotPickableAndWrapInBoundingBox(mesh: Mesh): Mesh {
        const makeNotPickable = (root: AbstractMesh) => {
            root.isPickable = false;
            const children = root.getChildMeshes();
            for (const c of children) {
                makeNotPickable(c);
            }
        };
        makeNotPickable(mesh);

        // Reset position to get bounding box from origin with no rotation
        if (!mesh.rotationQuaternion) {
            mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z);
        }
        const oldPos = mesh.position.clone();
        const oldRot = mesh.rotationQuaternion.clone();
        mesh.rotationQuaternion.set(0, 0, 0, 1);
        mesh.position.set(0, 0, 0);

        // Update bounding dimensions/positions
        const box = CreateBox("box", { size: 1 }, mesh.getScene());
        const boundingMinMax = mesh.getHierarchyBoundingVectors();
        boundingMinMax.max.subtractToRef(boundingMinMax.min, box.scaling);

        // Adjust scale to avoid undefined behavior when adding child
        if (box.scaling.y === 0) {
            box.scaling.y = Epsilon;
        }
        if (box.scaling.x === 0) {
            box.scaling.x = Epsilon;
        }
        if (box.scaling.z === 0) {
            box.scaling.z = Epsilon;
        }

        box.position.set((boundingMinMax.max.x + boundingMinMax.min.x) / 2, (boundingMinMax.max.y + boundingMinMax.min.y) / 2, (boundingMinMax.max.z + boundingMinMax.min.z) / 2);

        // Restore original positions
        mesh.addChild(box);
        mesh.rotationQuaternion.copyFrom(oldRot);
        mesh.position.copyFrom(oldPos);

        // Reverse parenting
        mesh.removeChild(box);

        box.addChild(mesh);
        box.visibility = 0;
        return box;
    }
    /**
     * CustomMeshes are not supported by this gizmo
     */
    public override setCustomMesh() {
        Logger.Error("Custom meshes are not supported on this gizmo");
    }
}
