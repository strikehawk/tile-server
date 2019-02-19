import { SrsService, Srs } from "../services/srs.service";
import { TileMatrix } from "./tile-matrix";
import { BoundingBox } from "./bounding-box";
import { TileMatrixSetLimits } from "./tile-matrix-set-limits";
import { TileMatrixLimits } from "./tile-matrix-limits";

export class TileMatrixSet implements wmts.TileMatrixSet {
    public readonly identifier: string;
    public title?: string[];
    public abstract?: string[];
    public keywords?: string[];
    public readonly boundingBox: BoundingBox;
    public readonly supportedCRS: string;
    public wellKnownScaleSet?: string;
    public readonly tileMatrix: TileMatrix[];

    constructor(options: wmts.TileMatrixSet, srsSvc: SrsService) {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        this.identifier = options.identifier;
        this.title = options.title;
        this.abstract = options.abstract;
        this.keywords = options.keywords;
        this.supportedCRS = options.supportedCRS;
        this.wellKnownScaleSet = options.wellKnownScaleSet;
        this.tileMatrix = [];

        // get the SRS of the Matrix set
        const srs: Srs = srsSvc.getSrs(this.supportedCRS);
        if (!srs) {
            throw new Error(`Could not find SRS '${this.supportedCRS}' for matrix set '${this.identifier}'.`);
        }

        let tmOptions: wmts.TileMatrix;
        for (let i: number = 0; i < options.tileMatrix.length; i++) {
            tmOptions = options.tileMatrix[i];
            this.tileMatrix.push(new TileMatrix(tmOptions, i, srs));
        }

        const bbox: wmts.BoundingBox = options.boundingBox;
        this.boundingBox = new BoundingBox(
            bbox.crs ? bbox.crs : this.supportedCRS,
            [bbox.lowerCorner[0], bbox.lowerCorner[1], bbox.upperCorner[0], bbox.upperCorner[1]]);
    }

    /**
     * Get the TileMatrix corresponding to a given zoom level.
     * @param zoomLevel The zoom level of the target TileMatrix.
     * @returns The matching TileMatrix.
     */
    public getMatrix(zoomLevel: number): TileMatrix {
        if (typeof zoomLevel !== "number") {
            throw new Error("Zoom level must be a number.");
        }

        if (zoomLevel < 0) {
            throw new Error("Zoom level must be strictly positive.");
        }

        if (zoomLevel > this.tileMatrix.length - 1) {
            throw new Error("Zoom level should be inferior or equal to TileMatrix length - 1.");
        }

        return this.tileMatrix[zoomLevel];
    }

    /**
     * Create a TileMatrixSetLimits for the current TileMatrixSet from an extent.
     * @param extent The extent to restrict the TileMatrixSet coverage by. Extent must be expressed in the same SRS as the TileMatrixSet.
     * @param minZoom The minimum zoom level covered.
     * @param maxZoom The maximum zoom level covered.
     * @returns The TileMatrixSetLimits representing the new coverage.
     */
    public createLimits(extent: tiles.Extent, minZoom?: number, maxZoom?: number): TileMatrixSetLimits {
        if (!extent) {
            throw new Error("Extent cannot be null.");
        }

        const limits: TileMatrixSetLimits = new TileMatrixSetLimits();
        const tmLimits: TileMatrixLimits[] = [];
        let tm: TileMatrix;
        for (let i: number = typeof minZoom === "number" ? minZoom : 0; i <= (typeof maxZoom === "number" ? maxZoom : this.tileMatrix.length - 1); i++) {
            tm = this.tileMatrix[i];
            tmLimits.push(tm.getTileMatrixLimits(extent));
        }
        limits.tileMatrixLimits = tmLimits;

        return limits;
    }

    public getTileCount(startZoom?: number, endZoom?: number): number {
        if (!this.tileMatrix || this.tileMatrix.length === 0) {
            return 0;
        }

        const start: number = typeof startZoom === "number" ? startZoom : 0;
        const end: number = typeof endZoom === "number" ? endZoom : this.tileMatrix.length - 1;

        this.tileMatrix.slice(start, end + 1).map(o => o.tileCount).reduce((sum: number, count: number) => { return sum + count; });
    }

    public getZoomLevel(matrix: TileMatrix | string): number {
        if (!matrix) {
            throw new Error("Matrix cannot be null.");
        }

        if (typeof matrix === "string") {
            for (let zoomLevel: number = 0; zoomLevel < this.tileMatrix.length; zoomLevel++) {
                if (this.tileMatrix[zoomLevel].identifier === matrix) {
                    return zoomLevel;
                }
            }

            return -1;
        } else {
            return this.tileMatrix.indexOf(matrix);
        }
    }

    public serialize(): wmts.TileMatrixSet {
        const options: wmts.TileMatrixSet = {
            identifier: this.identifier,
            boundingBox: this.boundingBox.serialize(),
            supportedCRS: this.supportedCRS,
            tileMatrix: this.tileMatrix.map(o => o.serialize())
        };

        if (this.title) {
            options.title = this.title;
        }

        if (this.abstract) {
            options.abstract = this.abstract;
        }

        if (this.keywords) {
            options.keywords = this.keywords.slice();
        }

        if (this.wellKnownScaleSet) {
            options.wellKnownScaleSet = this.wellKnownScaleSet;
        }

        return options;
    }
}