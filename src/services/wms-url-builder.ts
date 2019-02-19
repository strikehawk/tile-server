import proj from "proj4";

import { UrlBuilder } from "./url-builder-factory";
import { TileObject } from "../server/tile-object";

export class WmsUrlBuilder implements UrlBuilder {
    public readonly mapSource: tiles.WmsMapSource;

    constructor(mapSource: tiles.WmsMapSource) {
        if (!mapSource) {
            throw new Error("MapSource cannot be null.");
        }

        this.mapSource = mapSource;
    }

    public getRequestUrl(tile: TileObject): string {
        if (!tile) {
            throw new Error("Tile cannot be null.");
        }

        if (!tile.tileMatrix) {
            throw new Error("Tile has no TileMatrix.");
        }

        return this._getKvpUrl(tile);
    }

    private _getKvpUrl(tile: TileObject): string {
        // get tile extent
        let extent = tile.tileMatrix.getTileExtent(tile.xyz[0], tile.xyz[1]);

        // get the axis order of the projection
        const def: Partial<tiles.ProjectionDef> = proj.defs(tile.tileMatrixSet.supportedCRS);

        const axis: string = def.axis || "enu"; // Default is "East / North / Up"
        switch (axis[0]) {
            case "w":
            case "e":
                // longitude first
                // no need change extent
                break;
            case "n":
            case "s":
                // latitude first
                // switch x and y in the extent
                extent = [extent[1], extent[0], extent[3], extent[2]];
                break;
            default:
                throw new Error(`Unsupported axis structure '${axis}'. Check definition of projection '${tile.tileMatrixSet.supportedCRS}'?`);
        }

        // format bbox accordingly
        const bbox: string = `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`;

        let projKey: string;

        switch (this.mapSource.version) {
            case "1.0.0":
                projKey = "srs";
                break;
            case "1.1.0":
            case "1.1.1":
            case "1.3.0":
                projKey = "crs";
                break;
            default:
                throw new Error("Unsupported WMS version");
        }

        let url: string = `${this.mapSource.url}?service=WMS&version=${this.mapSource.version}&request=GetMap&layers=${this.mapSource.layers}&styles=${this.mapSource.styles || ""}&${projKey}=${tile.tileMatrixSet.supportedCRS}&bbox=${bbox}&format=${tile.mimeType.type}&width=${tile.tileMatrix.tileWidth}&height=${tile.tileMatrix.tileHeight}`;

        if (this.mapSource.additionalParameters) {
            url += this.mapSource.additionalParameters;
        }

        return url;
    }
}