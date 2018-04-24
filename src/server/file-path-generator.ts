import path from "path";

import { TileObject } from "./tile-object";
import { XyzTilePathGenerator } from "./xyz-tile-path-generator";
import { sanitizePath } from "../util/file-names";

export interface TilePathGenerator {
    /**
     * Builds the storage path for a tile and returns it as a string.
     * @param layerPath The root directory for the WMTS layer.
     * @param tile The tile for which the path is generated.
     * @returns Full path to the tile.
     */
    getTilePath(layerPath: string, tile: TileObject): string;
}

export class FilePathGenerator {
    public cacheRoot: string;

    constructor(private _options: tiles.ServerOptions) {
        this.cacheRoot = this._options.cacheRoot;
    }

    public getLayerPath(layerName: string): string {
        if (!layerName) {
            throw new Error("Layer name cannot be empty.");
        }

        return path.join(this.cacheRoot, sanitizePath(layerName));
    }

    /**
     * Builds the storage path for a tile and returns it as a string.
     * @param scheme The pattern of file organization to use.
     * @param tile The tile for which the path is generated.
     * @returns Full path to the tile.
     */
    public getTilePath(scheme: tiles.FilePathScheme, tile: TileObject): string {
        if (!tile) {
            throw new Error("Tile cannot be null.");
        }

        let generator: TilePathGenerator;
        switch (scheme) {
            case "xyz":
                generator = new XyzTilePathGenerator();
                break;
            case "geowebcache":
            default:
                throw new Error(`Unsupported FilePathScheme '${scheme}'.`);
        }

        const layerPath: string = this.getLayerPath(tile.layerName);

        return generator.getTilePath(layerPath, tile);
    }
}