import { WmtsLayerCache } from "./wmts-layer-cache";
import { TileObject } from "./tile-object";

import { ResourceUrl } from "../ogc/resource-url";
import { Style } from "../ogc/style";
import { TileMatrix } from "../ogc/tile-matrix";
import { TileMatrixLimits } from "../ogc/tile-matrix-limits";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";

import { TileMatrixSetService } from "../services/tile-matrix-set.service";
import { MimeTypeService } from "../services/mime-type.service";

export class WmtsLayerDefinition {
    public static validateOptions(options: tiles.WmtsLayerDefinitionOptions, mimeSvc: MimeTypeService, tileMatrixSetSvc: TileMatrixSetService): void {
        if (!options.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!options.mapSource) {
            throw new Error("Map source identifier cannot be empty.");
        }

        // FilePathScheme must be parsable by the FilePathScheme enum
        if (!(options.filePathScheme === "xyz" || options.filePathScheme === "geowebcache")) {
            throw new Error(`Unsupported file path scheme '${options.filePathScheme}'.`);
        }

        // validate each WmtsLayerCache
        if (options.caches) {
            for (const c of options.caches) {
                WmtsLayerCache.validateOptions(c, mimeSvc, tileMatrixSetSvc);
            }
        }
    }

    public static validateCreationRequest(request: tiles.WmtsLayerDefinitionCreationRequest, mimeTypeSvc: MimeTypeService, tileMatrixSetSvc: TileMatrixSetService): void {
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
            WmtsLayerCache.validateCreationRequest(c, mimeTypeSvc, tileMatrixSetSvc);
        }
    }

    public identifier: string;
    public label: string;
    public description: string;
    public readonly mapSource: string;
    public readonly wgs84Extent: tiles.Extent;
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

        WmtsLayerDefinition.validateOptions(options, mimeSvc, tmsSvc);

        this.identifier = options.identifier;
        this.label = options.label ? options.label : this.identifier;
        this.description = options.description;
        this.mapSource = options.mapSource;
        this.wgs84Extent = options.wgs84Extent;
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

    public *iterateTiles(cache: WmtsLayerCache, startZoom: number, endZoom: number, tmsLimits?: TileMatrixSetLimits): Iterable<TileObject> {
        if (!cache) {
            throw new Error("Cache cannot be null.");
        }

        let matrix: TileMatrix;
        let minCol: number;
        let minRow: number;
        let maxCol: number;
        let maxRow: number;
        let tile: TileObject;
        let limits: TileMatrixLimits;

        for (let z: number = startZoom; z <= endZoom; z++) {
            matrix = cache.tileMatrixSet.tileMatrix[z];
            limits = null;
            if (tmsLimits) {
                limits = tmsLimits.tileMatrixLimits[z];
            }

            minCol = limits != null ? limits.minTileCol : 0;
            minRow = limits != null ? limits.minTileRow : 0;
            maxCol = limits != null ? limits.maxTileCol : matrix.matrixWidth - 1;
            maxRow = limits != null ? limits.maxTileRow : matrix.matrixHeight - 1;
            for (let y: number = minRow; y <= maxRow; y++) {
                for (let x: number = minCol; x <= maxCol; x++) {
                    // TODO: Parameters are not correctly propagated
                    tile = new TileObject(this.identifier, cache.style, cache.tileMatrixSet.identifier, cache.format, [x, y, z]);
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

        const layer: wmts.Layer = {
            identifier: cache.identifier,
            title: [cache.label],
            abstract: [cache.description],
            metadata: [{
                minZoom: cache.minZoom,
                maxZoom: cache.maxZoom
            }],
            style: [{ identifier: cache.style, isDefault: true }],
            format: [cache.format.type],
            tileMatrixSetLink: [cache.getTileMatrixSetLink().serialize()],
            resourceUrl: [this._getResourceUrl(baseUrl, cache.format)]
        };

        return layer;
    }

    public getWmtsLayers(baseUrl: string): wmts.Layer[] {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        return this.caches.map(o => this.getWmtsLayer(baseUrl, o));
    }

    public serialize(): tiles.WmtsLayerDefinitionOptions {
        const options: tiles.WmtsLayerDefinitionOptions = {
            identifier: this.identifier,
            label: this.label,
            description: this.description,
            mapSource: this.mapSource,
            filePathScheme: this.filePathScheme,
            caches: this.caches.map(o => o.serialize())
        };

        if (this.wgs84Extent) {
            options.wgs84Extent = this.wgs84Extent;
        }

        return options;
    }

    private _getResourceUrl(baseUrl: string, mimeType: tiles.MimeType): ResourceUrl {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        if (!mimeType) {
            throw new Error("Mime-type cannot be null.");
        }

        const s: string = `${baseUrl}/wmts/\{Layer\}/\{Style\}/\{TileMatrixSet\}/\{TileMatrix\}/\{TileRow\}/\{TileCol\}.${mimeType.fileExtension}`;

        const resourceUrl: ResourceUrl = new ResourceUrl(mimeType.type, "tile", s);
        return resourceUrl;
    }
}