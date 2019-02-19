import { Srs } from "../services/srs.service";
import { BoundingBox } from "./bounding-box";
import { TileMatrixLimits } from "./tile-matrix-limits";

export class TileMatrix implements wmts.TileMatrix {
    /**
     * Default pixel size in meters, producing a default of 90.7 DPI.
     */
    public static readonly DEFAULT_PIXEL_SIZE_METER: number = 0.00028;

    public readonly identifier: string;
    public readonly levelNumber: number;
    public title?: string[];
    public abstract?: string[];
    public keywords?: string[];
    public readonly scaleDenominator: number;
    public readonly resolution: number;
    public readonly topLeftCorner: tiles.GeoLocation;
    public readonly tileWidth: number;
    public readonly tileHeight: number;
    public readonly matrixWidth: number;
    public readonly matrixHeight: number;

    public readonly tileWidthUnits: number;
    public readonly tileHeightUnits: number;
    public readonly tileCount: number;
    public readonly bbox: BoundingBox;

    private _srs: Srs;

    constructor(options: wmts.TileMatrix, levelNumber: number, srs: Srs) {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        if (typeof levelNumber !== "number" || levelNumber < 0) {
            throw new Error("Level number must superior or equal to 0.");
        }

        if (!srs) {
            throw new Error("SRS cannot be null.");
        }

        this._srs = srs;

        this.identifier = options.identifier;
        this.levelNumber = levelNumber;
        this.title = options.title;
        this.abstract = options.abstract;
        this.keywords = options.keywords;
        this.scaleDenominator = options.scaleDenominator;
        this.topLeftCorner = options.topLeftCorner;
        this.tileWidth = options.tileWidth;
        this.tileHeight = options.tileHeight;
        this.matrixWidth = options.matrixWidth;
        this.matrixHeight = options.matrixHeight;

        this.tileCount = this.matrixWidth * this.matrixHeight;

        // compute SRS derived values
        this.resolution = TileMatrix.DEFAULT_PIXEL_SIZE_METER * (this.scaleDenominator / srs.metersPerUnit);
        this.tileWidthUnits = this.tileWidth * this.resolution;
        this.tileHeightUnits = this.tileHeight * this.resolution;

        // compute bbox
        const bounds: [number, number, number, number] = [null, null, null, null];
        bounds[0] = this.topLeftCorner[0];
        bounds[2] = bounds[0] + this.tileWidth * this.resolution * this.matrixWidth;
        bounds[3] = this.topLeftCorner[1];
        bounds[1] = bounds[1] - this.tileHeight * this.resolution * this.matrixHeight;

        this.bbox = new BoundingBox(srs.identifiers[0], bounds);
    }

    /**
     * Get the extent of the tile located at the designated coordinates.
     * @param col Column of the tile.
     * @param row Row of the tile.
     * @returns The extent of the tile, in the [minx, miny, maxx, maxy] format.
     */
    public getTileExtent(col: number, row: number): tiles.Extent {
        if (col < 0 || col >= this.matrixWidth) {
            throw new Error("Column is out of matrix bounds.");
        }

        if (row < 0 || row >= this.matrixHeight) {
            throw new Error("Row is out of matrix bounds.");
        }

        if (this._srs == null) {
            throw new Error("Cannot compute extent if no SRS has been assigned.");
        }

        // Caution: in WMTS, coordinates format is Lat/Long
        const minx: number = this.topLeftCorner[0] + this.tileWidthUnits * col;
        const miny: number = this.topLeftCorner[1] - this.tileHeightUnits * row - this.tileHeightUnits;
        const maxx: number = minx + this.tileWidthUnits;
        const maxy: number = miny + this.tileHeightUnits;

        return [minx, miny, maxx, maxy];
    }

    /**
     * Convert a geographic location in its equivalent expressed in "tile" units.
     * @param location The location to convert.
     * @returns The TileCoordinates corresponding to the input location.
     */
    public getTileCoordinates(location: tiles.GeoLocation): wmts.TileCoordinates {
        if (!location) {
            throw new Error("Location cannot be null.");
        }

        const resolution: number = this.resolution;
        const tileWidthUnits: number = this.tileWidthUnits;
        const tileHeightUnits: number = this.tileHeightUnits;
        const offsetX: number = location[0] - this.topLeftCorner[0];
        const offsetY: number = this.topLeftCorner[1] - location[1];
        const x: number = offsetX / tileWidthUnits;
        const y: number = offsetY / tileHeightUnits;
        return [x, y];
    }

    /**
     * Compute the TileMatrixLimits corresponding to a given extent.
     * @param extent The extent restricting the TileMatrix.
     * @returns The TileMatrixLimits representing the restriction.
     */
    public getTileMatrixLimits(extent: tiles.Extent): TileMatrixLimits {
        if (!extent) {
            throw new Error("Extent cannot be null.");
        }

        const bottomLeft: wmts.TileCoordinates = this.getTileCoordinates([extent[0], extent[1]]);
        const topRight: wmts.TileCoordinates = this.getTileCoordinates([extent[2], extent[3]]);
        const limits: TileMatrixLimits = new TileMatrixLimits(
            this.identifier,
            Math.max(Math.floor(topRight[1]), 0),
            Math.min(Math.floor(bottomLeft[1]), this.matrixHeight - 1),
            Math.max(Math.floor(bottomLeft[0]), 0),
            Math.min(Math.floor(topRight[0]), this.matrixWidth - 1));

        return limits;
    }

    public serialize(): wmts.TileMatrix {
        const options: wmts.TileMatrix = {
            identifier: this.identifier,
            scaleDenominator: this.scaleDenominator,
            topLeftCorner: <tiles.GeoLocation>this.topLeftCorner.slice(),
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            matrixWidth: this.matrixWidth,
            matrixHeight: this.matrixHeight
        };

        if (this.title) {
            options.title = this.title;
        }

        if (this.abstract) {
            options.abstract = this.abstract;
        }

        if (this.keywords) {
            options.keywords = this.keywords.slice();
        }

        return options;
    }
}