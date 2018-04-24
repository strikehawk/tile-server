import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";
import { WmtsLayerCache } from "./wmts-layer-cache";
import { WmtsLayerDefinition } from "./wmts-layer-definition";

export class TileIterationRequest {
    public readonly layer: WmtsLayerDefinition;
    public readonly layerCache: WmtsLayerCache;
    public readonly tileMatrixSetLimits: TileMatrixSetLimits;
    public readonly startZoom: number;
    public readonly endZoom: number;
    public readonly parameters: Map<string, string>;

    constructor(layer: WmtsLayerDefinition,
        cache: WmtsLayerCache,
        limits: TileMatrixSetLimits,
        startZoom: number, endZoom: number,
        parameters?: Map<string, string>) {
        if (!layer) {
            throw new Error("Layer cannot be null.");
        }

        if (!cache) {
            throw new Error("Cache cannot be null.");
        }

        if (typeof startZoom !== "number") {
            throw new Error("Start zoom must be a number.");
        }

        if (typeof endZoom !== "number") {
            throw new Error("End zoom must be a number.");
        }

        if (startZoom < 0 || startZoom > cache.tileMatrixSet.tileMatrix.length - 1) {
            throw new Error("Start zoom is out of zoom level bounds.");
        }

        if (endZoom < 0 || startZoom > cache.tileMatrixSet.tileMatrix.length - 1) {
            throw new Error("End zoom is out of zoom level bounds.");
        }

        if (startZoom > endZoom) {
            throw new Error("End zoom shall be superior to start zoom.");
        }

        this.layer = layer;
        this.layerCache = cache;
        this.tileMatrixSetLimits = limits;
        this.startZoom = startZoom;
        this.endZoom = endZoom;
        this.parameters = parameters;
    }
}