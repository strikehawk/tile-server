import { UrlBuilder } from "./url-builder-factory";
import { TileObject } from "../server/tile-object";

export class WmtsUrlBuilder implements UrlBuilder {
    public readonly mapSource: tiles.WmtsMapSource;

    constructor(mapSource: tiles.WmtsMapSource) {
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

        const urlPattern: string = this.mapSource.urlPattern;
        let url: string = urlPattern;
        url = url.replace("{TileMatrixSet}", tile.tileMatrixSet.identifier);
        url = url.replace("{TileMatrix}", tile.tileMatrix.identifier);
        url = url.replace("{TileCol}", tile.xyz[0].toString());
        url = url.replace("{TileRow}", tile.xyz[1].toString());
        url = url.replace("{ZoomLevel}", tile.xyz[2].toString());

        return url;
    }
}