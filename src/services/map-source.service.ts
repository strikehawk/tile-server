import * as fs from "fs-extra";
import path from "path";

import logger from "../util/logger";

export class MapSourceService {
    private _sources: Map<string, tiles.MapSource>;

    constructor(private _options: tiles.ServerOptions) {
        this._sources = new Map<string, tiles.MapSource>();

        this._loadSources();
    }

    public getSources(): tiles.MapSource[] {
        return Array.from(this._sources.values());
    }

    public getMapSource(identifier: string): tiles.MapSource {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        identifier = identifier.toLowerCase();
        if (!this._sources.has(identifier)) {
            logger.warn(`Unknown map source identifier '${identifier}'.`);
            return null;
        }

        return this._sources.get(identifier);
    }

    public has(identifier: string): boolean {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        return this._sources.has(identifier);
    }

    private _loadSources(): void {
        const folderPath: string = this._options.mapSourcesPath;

        if (!folderPath) {
            throw new Error("Empty layers path.");
        }

        if (!fs.pathExistsSync(folderPath)) {
            throw new Error(`Map source directory '${folderPath}' does not exist.`);
        }

        let filePath: string;
        let mapSource: tiles.MapSource;

        for (const f of fs.readdirSync(folderPath)) {
            // skip non json files
            if (path.extname(f) !== ".json") {
                continue;
            }

            filePath = path.join(folderPath, f);

            try {
                mapSource = fs.readJSONSync(filePath);
                switch (mapSource.type) {
                    case "WMS":
                    case "WMTS":
                    case "Bing":
                        this._sources.set(mapSource.identifier.toLowerCase(), mapSource);
                        break;
                    default:
                        logger.error(`Unsupported map source type '${mapSource.type}'.`);
                }
            } catch (e) {
                logger.error(e);
            }
        }
    }
}