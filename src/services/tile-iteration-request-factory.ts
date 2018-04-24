import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { WmtsLayerCache } from "../server/wmts-layer-cache";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";
import { TileIterationRequest } from "../server/tile-iteration-request";

export class TileIterationRequestFactory {
    public createRequest(layer: WmtsLayerDefinition, cache: WmtsLayerCache,
        startZoom: number, endZoom: number,
        limits?: TileMatrixSetLimits,
        parameters?: Map<string, string>): TileIterationRequest {
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

        return new TileIterationRequest(layer, cache, limits, startZoom, endZoom, parameters);
    }

    private _createRequest(
        layer: WmtsLayerDefinition,
        cacheIdentifier: string, startZoom: number, endZoom: number,
        limits?: TileMatrixSetLimits,
        parameters?: Map<string, string>): TileIterationRequest {
        if (!layer) {
            throw new Error("Layer cannot be null.");
        }

        if (!cacheIdentifier) {
            throw new Error("Cache identifier cannot be empty.");
        }

        const cache: WmtsLayerCache = layer.getCache(cacheIdentifier);
        if (!cache) {
            throw new Error(`Could not find Cache '${cacheIdentifier}'.`);
        }

        return this.createRequest(layer, cache, startZoom, endZoom, limits, parameters);
    }
}