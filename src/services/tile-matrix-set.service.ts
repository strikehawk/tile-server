import * as fs from "fs-extra";
import path from "path";

import logger from "../util/logger";
import { SrsService, Srs } from "./srs.service";
import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { TileMatrix } from "../ogc/tile-matrix";

export class TileMatrixSetService {
    private _tileMatrixSets: Map<string, TileMatrixSet>;

    constructor(private _options: tiles.ServerOptions, private _srsSvc: SrsService) {
        this._tileMatrixSets = new Map<string, TileMatrixSet>();
        this._loadTileMatrixSets();
    }

    public getTileMatrixSets(): TileMatrixSet[] {
        return Array.from(this._tileMatrixSets.values());
    }

    public getTileMatrixSet(identifier: string): TileMatrixSet {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        identifier = identifier.toLowerCase();
        if (!this._tileMatrixSets.has(identifier)) {
            logger.warn(`Unknown Gridset identifier ${identifier}.`);
            return null;
        }

        return this._tileMatrixSets.get(identifier);
    }

    public buildRegularTileMatrixSet(identifier: string,
        supportedCRS: string,
        bbox: wmts.BoundingBox,
        level0Matrix: wmts.TileMatrix,
        maxLevel: number,
        nameGenerator?: (tileMatrixSetIdentifier: string, zoomLevel: number) => string): TileMatrixSet {
        const srs: Srs = this._srsSvc.getSrs(supportedCRS);

        const matrices: wmts.TileMatrix[] = [level0Matrix];
        let currentScale: number = level0Matrix.scaleDenominator;
        let currentMatrixWidth: number = level0Matrix.matrixWidth;
        let currentMatrixHeight: number = level0Matrix.matrixHeight;

        for (let i: number = 1; i <= maxLevel; i++) {
            currentScale /= 2;
            currentMatrixWidth *= 2;
            currentMatrixHeight *= 2;

            matrices.push(new TileMatrix({
                identifier: nameGenerator ? nameGenerator(identifier, i) : i.toString(),
                scaleDenominator: currentScale,
                topLeftCorner: <tiles.GeoLocation> level0Matrix.topLeftCorner.slice(),
                tileWidth: level0Matrix.tileWidth,
                tileHeight: level0Matrix.tileHeight,
                matrixWidth: currentMatrixWidth,
                matrixHeight: currentMatrixHeight
            }, i, srs));
        }

        const options: wmts.TileMatrixSet = {
            identifier: identifier,
            supportedCRS: supportedCRS,
            boundingBox: bbox,
            tileMatrix: matrices
        };

        return new TileMatrixSet(options, this._srsSvc);
    }

    private _loadTileMatrixSets(): void {
        const folderPath: string = this._options.tileMatrixSetsPath;

        if (!folderPath) {
            throw new Error("Empty TileMatrixSet path.");
        }

        if (!fs.pathExistsSync(folderPath)) {
            throw new Error(`TileMatrixSet directory '${folderPath}' does not exist.`);
        }

        let filePath: string;
        let tmsOptions: wmts.TileMatrixSet;

        for (const f of fs.readdirSync(folderPath)) {
            // skip non json files
            if (path.extname(f) !== ".json") {
                continue;
            }

            filePath = path.join(folderPath, f);

            try {
                tmsOptions = fs.readJSONSync(filePath);
                this._tileMatrixSets.set(tmsOptions.identifier.toLowerCase(), new TileMatrixSet(tmsOptions, this._srsSvc));
            } catch (e) {
                logger.error(e);
            }
        }
    }
}