import { TileObject } from "../server/tile-object";
import { WmtsUrlBuilder } from "./wmts-url-builder";

export interface UrlBuilder {
    getRequestUrl(tile: TileObject): string;
}

export class UrlBuilderFactory {
    public getUrlBuilder(source: tiles.MapSource): UrlBuilder {
        if (!source) {
            throw new Error("Source cannot be null.");
        }

        switch (source.type) {
            case "WMTS":
                return new WmtsUrlBuilder(<tiles.WmtsMapSource>source);
            case "WMS":
                // return new WmsKvpUrlBuilder(<tiles.WmsMapSource>source);
            case "Bing":
                // return new BingMapsTileUrlBuilder(<tiles.BingMapSource>source);
            default:
                throw new Error(`Unsupported MapSource type '${source.type}'.`);
        }
    }
}