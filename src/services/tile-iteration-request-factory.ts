import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { WmtsLayerCache } from "../server/wmts-layer-cache";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";
import { TileIterationRequest } from "../server/tile-iteration-request";
import { ComputingService } from "./computing.service";

export class TileIterationRequestFactory {
    constructor(private _computingSvc: ComputingService) { }

    public createRequest(layer: WmtsLayerDefinition, cache: WmtsLayerCache,
        startZoom: number, endZoom: number,
        bbox?: wmts.BoundingBox,
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

        let limits: TileMatrixSetLimits;

        if (bbox) {
            // convert bbox to extent
            const extent: tiles.Extent = this._computingSvc.convertBboxToExtent(bbox, cache.tileMatrixSet.supportedCRS);

            // get the TileMatrixSet of the cache
            limits = cache.tileMatrixSet.createLimits(extent);
        }

        return new TileIterationRequest(layer, cache, limits, startZoom, endZoom, parameters);
    }
}