import { WmtsLayerCache } from "./wmts-layer-cache";
import { TileObject } from "./tile-object";

import { ResourceUrl } from "../ogc/resource-url";
import { Style } from "../ogc/style";
import { TileMatrix } from "../ogc/tile-matrix";
import { TileMatrixLimits } from "../ogc/tile-matrix-limits";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";

import { TileMatrixSetService } from "../services/tile-matrix-set.service";
import { MimeTypeService } from "../services/mime-type.service";
import { TileIterationRequest } from "./tile-iteration-request";

export class WmtsLayerDefinition {
    public static validateOptions(options: tiles.WmtsLayerDefinitionOptions, mimeSvc: MimeTypeService): void {
        if (!options.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        // FilePathScheme must be parsable by the FilePathScheme enum
        if (!(options.filePathScheme === "xyz" || options.filePathScheme === "geowebcache")) {
            throw new Error(`Unsupported file path scheme '${options.filePathScheme}'.`);
        }

        // validate each WmtsLayerCache
        if (options.caches) {
            for (const c of options.caches) {
                WmtsLayerCache.validateOptions(c, mimeSvc);
            }
        }
    }

    public static validateCreationRequest(request: tiles.WmtsLayerDefinitionCreationRequest, mimeTypeSvc: MimeTypeService): void {
        if (!request.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!request.mapSource) {
            throw new Error("Map source cannot be empty.");
        }

        if (!(request.filePathScheme === "xyz" || request.filePathScheme === "geowebcache")) {
            throw new Error(`Unsupported file path scheme '${request.filePathScheme}'.`);
        }

        if (!request.caches) {
            throw new Error("Caches cannot be null.");
        }

        if (request.caches.length === 0) {
            throw new Error("Caches cannot be empty.");
        }

        for (const c of request.caches) {
            WmtsLayerCache.validateCreationRequest(c, mimeTypeSvc);
        }
    }

    public identifier: string;
    public label: string;
    public description: string;
    public filePathScheme: tiles.FilePathScheme;
    public caches: WmtsLayerCache[];

    constructor(options: tiles.WmtsLayerDefinitionOptions, tmsSvc: TileMatrixSetService, mimeSvc: MimeTypeService) {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        if (!tmsSvc) {
            throw new Error("TileMatrixSetService cannot be null.");
        }

        if (!mimeSvc) {
            throw new Error("MimeTypeService cannot be null.");
        }

        WmtsLayerDefinition.validateOptions(options, mimeSvc);

        this.identifier = options.identifier;
        this.label = options.label ? options.label : this.identifier;
        this.description = options.description;
        this.filePathScheme = options.filePathScheme;
        this.caches = options.caches.map(o => new WmtsLayerCache(o, tmsSvc, mimeSvc));
    }

    public getCache(identifier: string): WmtsLayerCache {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        const tmp: WmtsLayerCache[] = this.caches.filter(o => o.identifier === identifier);

        return tmp.length !== 0 ? tmp[0] : null;
    }

    public *iterateTiles(request: TileIterationRequest): Iterable<TileObject> {
        if (!request) {
            throw new Error("Request cannot be empty.");
        }

        const cache: WmtsLayerCache = request.layerCache;
        let matrix: TileMatrix;
        let limits: TileMatrixLimits;
        let minCol: number;
        let minRow: number;
        let maxCol: number;
        let maxRow: number;
        let tile: TileObject;
        const requestLimits: TileMatrixSetLimits = request.tileMatrixSetLimits;
        const cacheLimits: TileMatrixSetLimits = cache.tileMatrixSetLimits;
        const tmsLimits: TileMatrixSetLimits = TileMatrixSetLimits.intersect(cacheLimits, requestLimits);
        let tmLimits: Map<string, TileMatrixLimits> = null;
        if (tmsLimits) {
            tmLimits = new Map<string, TileMatrixLimits>(<[string, TileMatrixLimits][]>
                tmsLimits.tileMatrixLimits.map(o => [o.tileMatrix, o]));
        }

        for (let z: number = request.startZoom; z <= request.endZoom; z++) {
            matrix = cache.tileMatrixSet.tileMatrix[z];
            limits = null;
            if (tmLimits) {
                limits = tmLimits.get(matrix.identifier);
            }

            minCol = limits != null ? limits.minTileCol : 0;
            minRow = limits != null ? limits.minTileRow : 0;
            maxCol = limits != null ? limits.maxTileCol : matrix.matrixWidth - 1;
            maxRow = limits != null ? limits.maxTileRow : matrix.matrixHeight - 1;
            for (let y: number = minRow; y <= maxRow; y++) {
                for (let x: number = minCol; x <= maxCol; x++) {
                    tile = new TileObject(this.identifier, cache.style, cache.tileMatrixSet.identifier, cache.format, [x, y, z], request.parameters);
                    tile.tileMatrixSet = cache.tileMatrixSet;
                    tile.tileMatrix = matrix;
                    yield tile;
                }
            }
        }
    }

    public getWmtsLayer(baseUrl: string, cache: WmtsLayerCache): wmts.Layer {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        if (!cache) {
            throw new Error("Cache cannot be null.");
        }

        return {
            identifier: this.identifier,
            title: [this.label],
            abstract: [this.description],
            style: [{ identifier: cache.style, isDefault: true }],
            format: [cache.format.type],
            tileMatrixSetLink: [cache.getTileMatrixSetLink().serialize()],
            resourceUrl: [this._getResourceUrl(baseUrl, cache.format)]
        };
    }

    public getWmtsLayers(baseUrl: string): wmts.Layer[] {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        return this.caches.map(o => this.getWmtsLayer(baseUrl, o));
    }

    public serialize(): tiles.WmtsLayerDefinitionOptions {
        return {
            identifier: this.identifier,
            label: this.identifier,
            description: this.description,
            filePathScheme: this.filePathScheme,
            caches: this.caches.map(o => o.serialize())
        };
    }

    private _getResourceUrl(baseUrl: string, mimeType: tiles.MimeType): ResourceUrl {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        if (!mimeType) {
            throw new Error("Mime-type cannot be null.");
        }

        const s: string = `${baseUrl}/wmts/{Identifier}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.${mimeType.fileExtension}`;

        const resourceUrl: ResourceUrl = new ResourceUrl(mimeType.type, "tile", s);
        return resourceUrl;
    }
}