export class SeedTask {
    private static _nextTaskId: number = 1;

    public id: number;
    public readonly request: tiles.SeedRequest;
    public readonly description: tiles.SeedTaskDescription;

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

    constructor(request: tiles.SeedRequest, description: tiles.SeedTaskDescription) {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        if (!description) {
            throw new Error("Description cannot be null.");
        }

        this.id = SeedTask._nextTaskId;
        SeedTask._nextTaskId++;

        this.request = request;
        this.description = description;
    }

    private _updateProgress(): void {
        this.remainingTiles = this.description.tileCount - this._tilesDownloaded - this._tilesInError;
        this.progress = (this._tilesDownloaded + this._tilesInError) / this.description.tileCount * 100;
    }
}