import { TileMatrixSetService } from "./tile-matrix-set.service";
import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { MimeTypeService } from "./mime-type.service";
import { TileObject } from "../server/tile-object";
import { LayerService } from "./layer.service";
import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { FilePathGenerator } from "../server/file-path-generator";

export class WmtsService {
    constructor(
        private _tmsSvc: TileMatrixSetService,
        private _mimeTypeSvc: MimeTypeService,
        private _layerSvc: LayerService,
        private _filePathGenerator: FilePathGenerator) {
    }

    public getCapabilities(baseUrl: string): any {
        if (!baseUrl) {
            throw new Error("Base URL cannot be empty.");
        }

        // TODO: Implement getCapabilities()
        return null;

        /*
        var contents = new Contents();
        contents.Layer = _layerSvc.GetLayers().SelectMany(o => o.GetWmtsLayers(baseUrl)).ToArray();
        contents.TileMatrixSet = _tileMatrixSetSvc.GetTileMatrixSets();
        return new Capabilities(contents);
        */
    }

    public getTileInfos(layer: string,
        style: string,
        tileMatrixSetIdentifier: string,
        tileMatrixIdentifier: string,
        tileRow: number,
        tileCol: number,
        format: string): tiles.TileInfos {
        if (!layer) {
            throw new Error("Layer cannot be empty.");
        }

        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!tileMatrixSetIdentifier) {
            throw new Error("TileMatrixSetIdentifier cannot be empty.");
        }

        if (!tileMatrixIdentifier) {
            throw new Error("TileMatrixIdentifier cannot be empty.");
        }

        if (!format) {
            throw new Error("Format cannot be empty.");
        }

        const tms: TileMatrixSet = this._tmsSvc.getTileMatrixSet(tileMatrixSetIdentifier);
        if (!tms) {
            throw new Error(`Unknown TileMatrixSet '${tileMatrixSetIdentifier}' requested.`);
        }

        const z: number = tms.getZoomLevel(tileMatrixIdentifier);

        if (z === -1) {
            throw new Error(`Unknown TileMatrix identifier '${tileMatrixIdentifier}'.`);
        }

        return this._getTileInfos(layer, style, tileMatrixSetIdentifier, z, tileRow, tileCol, format);
    }

    private _getTileInfos(layer: string,
        style: string,
        tileMatrixSetIdentifier: string,
        zoomLevel: number,
        tileRow: number,
        tileCol: number,
        format: string): tiles.TileInfos {
        if (!layer) {
            throw new Error("Layer cannot be empty.");
        }

        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!tileMatrixSetIdentifier) {
            throw new Error("TileMatrixSetIdentifier cannot be empty.");
        }

        if (!format) {
            throw new Error("Format cannot be empty.");
        }

        const tms: TileMatrixSet = this._tmsSvc.getTileMatrixSet(tileMatrixSetIdentifier);
        if (!tms) {
            throw new Error(`Unknown TileMatrixSet '${tileMatrixSetIdentifier}' requested.`);
        }

        if (zoomLevel < 0 || zoomLevel > tms.tileMatrix.length - 1) {
            throw new Error("Zoom level is out of the expected range.");
        }
        const mimeType: tiles.MimeType = this._mimeTypeSvc.getMimeTypeByFileExtension(format);
        if (!mimeType) {
            throw new Error(`Unknown mime-type '${format}' requested.`);
        }

        const tile: TileObject = new TileObject(layer, style, tileMatrixSetIdentifier, mimeType, [tileCol, tileRow, zoomLevel]);
        const layerDef: WmtsLayerDefinition = this._layerSvc.getLayer(layer);
        const path: string = this._filePathGenerator.getTilePath(layerDef.filePathScheme, tile);

        return {
            path: path,
            mimeType: mimeType
        };
    }
}