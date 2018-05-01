import logger from "../util/logger";

export class SeedingTask {
    private static _nextTaskId: number = 1;

    public id: number;
    public readonly request: tiles.SeedingRequest;
    public readonly tiles: tiles.TileSummary[];

    /**
     * The number of tiles to seed. Computed from the specified TileMatrixSet and potential limits.
     */
    public readonly tileCount: number;

    private _tilesDownloaded: number;

    public get tilesDownloaded(): number {
        return this._tilesDownloaded;
    }

    public set tilesDownloaded(value: number) {
        this._tilesDownloaded = value;
        this._updateProgress();
    }

    private _tilesInError: number;
    public get tilesInError(): number {
        return this._tilesInError;
    }

    public set tilesInError(value: number) {
        this._tilesInError = value;
        this._updateProgress();
    }

    public remainingTiles: number;
    public progress: number;

    constructor(request: tiles.SeedingRequest, tiles: tiles.TileSummary[]) {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        if (!tiles) {
            throw new Error("Tiles cannot be null.");
        }

        this.id = SeedingTask._nextTaskId;
        SeedingTask._nextTaskId++;

        this.request = request;
        this.tiles = tiles;
        this.tileCount = tiles.length;

        this._tilesDownloaded = 0;
        this._tilesInError = 0;
        this.remainingTiles = this.tileCount;
        this.progress = 0;
    }

    public buildSummary(): tiles.SeedingTaskSummary {
        return {
            layer: this.request.layerDefinition,
            cache: this.request.cacheIdentifier,
            tileCount: this.tileCount,
            tilesDownloaded: this.tilesDownloaded,
            tilesInError: this.tilesInError,
            remainingTiles: this.remainingTiles,
            progress: this.progress
        };
    }

    private _updateProgress(): void {
        this.remainingTiles = this.tileCount - this._tilesDownloaded - this._tilesInError;
        this.progress = (this._tilesDownloaded + this._tilesInError) / this.tileCount * 100;

        if (this.remainingTiles === 0) {
            logger.info(`Seeding task finished. Downloaded: ${this._tilesDownloaded}, in error: ${this._tilesInError}`);
        }
    }
}