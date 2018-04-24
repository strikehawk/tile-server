export class TileMatrixLimits implements wmts.TileMatrixLimits {
    public static fromOptions(options: wmts.TileMatrixLimits): TileMatrixLimits {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        return new TileMatrixLimits(
            options.tileMatrix,
            options.minTileRow,
            options.maxTileRow,
            options.minTileCol,
            options.maxTileCol);
    }

    public static union(a: TileMatrixLimits, b: TileMatrixLimits): TileMatrixLimits {
        if (!a) {
            throw new Error("a cannot be null.");
        }

        if (!b) {
            throw new Error("b cannot be null.");
        }

        if (a.tileMatrix !== b.tileMatrix) {
            throw new Error("A and B must describe the same TileMatrix.");
        }

        const result: TileMatrixLimits = new TileMatrixLimits(
            a.tileMatrix,
            Math.max(a.minTileRow, b.minTileRow),
            Math.min(a.maxTileRow, b.maxTileRow),
            Math.max(a.minTileCol, b.minTileCol),
            Math.min(a.maxTileCol, b.maxTileCol));

        return result;
    }

    public readonly tileMatrix: string;
    public readonly minTileRow: number;
    public readonly maxTileRow: number;
    public readonly minTileCol: number;
    public readonly maxTileCol: number;

    public readonly tileCount: number;

    constructor(tileMatrix: string,
        minTileRow: number,
        maxTileRow: number,
        minTileCol: number,
        maxTileCol: number) {
        this.tileMatrix = tileMatrix;
        this.minTileRow = minTileRow;
        this.maxTileRow = maxTileRow;
        this.minTileCol = minTileCol;
        this.maxTileCol = maxTileCol;

        this.tileCount = (maxTileCol - minTileCol + 1) * (maxTileRow - minTileRow + 1);
    }

    public union(other: TileMatrixLimits): TileMatrixLimits {
        if (!other) {
            throw new Error("Other cannot be null.");
        }

        return TileMatrixLimits.union(this, other);
    }

    public clone(): TileMatrixLimits {
        const result: TileMatrixLimits = new TileMatrixLimits(
            this.tileMatrix,
            this.minTileRow,
            this.maxTileRow,
            this.minTileCol,
            this.maxTileCol);

        return result;
    }

    public serialize(): wmts.TileMatrixLimits {
        return {
            tileMatrix: this.tileMatrix,
            minTileRow: this.minTileRow,
            maxTileRow: this.maxTileRow,
            minTileCol: this.minTileCol,
            maxTileCol: this.maxTileCol
        };
    }
}