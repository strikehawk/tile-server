import * as fs from "fs-extra";
import path from "path";

import logger from "../util/logger";
import { sanitizePath } from "../util/file-names";

import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { TileMatrixSetService } from "./tile-matrix-set.service";
import { MimeTypeService } from "./mime-type.service";
import { WmtsLayerCache } from "../server/wmts-layer-cache";
import { MapSourceService } from "./map-source.service";
import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { ComputingService } from "./computing.service";
import { FilePathGenerator } from "../server/file-path-generator";

export class LayerService {
    private _layers: Map<string, WmtsLayerDefinition>;

    constructor(private _options: tiles.ServerOptions,
        private _tmsSvc: TileMatrixSetService,
        private _mapSourceSvc: MapSourceService,
        private _mimeTypeSvc: MimeTypeService,
        private _computingSvc: ComputingService,
        private _filePathGenerator: FilePathGenerator) {
        this._layers = new Map<string, WmtsLayerDefinition>();
        this._loadLayers();
    }

    public getLayers(): WmtsLayerDefinition[] {
        return Array.from(this._layers.values());
    }

    public getLayer(identifier: string): WmtsLayerDefinition {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        identifier = identifier.toLowerCase();
        if (!this._layers.has(identifier)) {
            logger.warn(`Unknown layer identifier '${identifier}'.`);
            return null;
        }

        return this._layers.get(identifier);
    }

    public createLayer(request: tiles.WmtsLayerDefinitionCreationRequest): void {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        WmtsLayerDefinition.validateCreationRequest(request, this._mimeTypeSvc, this._tmsSvc);

        // check that no layer exists with the same identifier
        if (this._layers.has(request.identifier)) {
            throw new Error(`There is already a layer with the identifier '${request.identifier}'.`);
        }

        // check that the map source exists
        const mapSource = this._mapSourceSvc.getMapSource(request.mapSource);
        if (!mapSource) {
            throw new Error(`Unknown map source identifier '${request.mapSource}'.`);
        }

        const wgs84Extent: tiles.Extent = request.wgs84Extent || mapSource.wgs84Extent;
        const caches: tiles.WmtsLayerCacheOptions[] = request.caches.map(req => WmtsLayerCache.createOptions(req, wgs84Extent, this._tmsSvc, this._computingSvc));

        const options: tiles.WmtsLayerDefinitionOptions = {
            identifier: request.identifier,
            label: request.label ? request.label : request.identifier,
            description: request.description,
            mapSource: request.mapSource,
            filePathScheme: request.filePathScheme,
            caches: caches
        };

        if (request.wgs84Extent) {
            options.wgs84Extent = request.wgs84Extent;
        }

        // store the options
        const folderPath: string = this._options.layersPath;
        const filePath: string = sanitizePath(`${request.identifier}.json`);
        fs.writeJsonSync(path.join(folderPath, filePath), options);

        // create a new layer definition, and add it to the map
        const layerDef = new WmtsLayerDefinition(options, this._tmsSvc, this._mimeTypeSvc);
        this._layers.set(layerDef.identifier, layerDef);
    }

    public async clearLayerCache(identifier: string): Promise<void> {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        const folderPath = this._filePathGenerator.getLayerPath(identifier);
        await fs.remove(folderPath);
    }

    private _loadLayers(): void {
        const folderPath: string = this._options.layersPath;

        if (!folderPath) {
            throw new Error("Empty layers path.");
        }

        if (!fs.pathExistsSync(folderPath)) {
            throw new Error(`Layers directory '${folderPath}' does not exist.`);
        }

        let filePath: string;
        let layerDefOptions: tiles.WmtsLayerDefinitionOptions;

        for (const f of fs.readdirSync(folderPath)) {
            // skip non json files
            if (path.extname(f) !== ".json") {
                continue;
            }

            filePath = path.join(folderPath, f);

            try {
                layerDefOptions = fs.readJSONSync(filePath);
                this._layers.set(layerDefOptions.identifier.toLowerCase(), new WmtsLayerDefinition(layerDefOptions, this._tmsSvc, this._mimeTypeSvc));
            } catch (e) {
                logger.error(e);
            }
        }
    }
}