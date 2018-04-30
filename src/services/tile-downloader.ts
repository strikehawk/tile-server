import fs from "fs-extra";
import path from "path";
import axios from "axios";

import logger from "../util/logger";

import { SeedingTask } from "../server/seeding-task";
import { SeedingService } from "./seeding.service";

export class TileDownloader {
    constructor(private _seedingSvc: SeedingService) {
    }

    public cancelTask(taskId: number): void {
        // TODO: Implement cancellation
        /*
        var tokenSource: CancellationTokenSource;

        if (this._cancellationTokens.TryGetValue(taskId, tokenSource)) {
            tokenSource.Cancel();
        } else {
            logger.error(`Could not find CancellationToken for task ${taskId}.`);
        }
        */
    }

    public async processTask(task: SeedingTask): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const tile of task.tiles) {
            promises.push(this._downloadTileAsync(tile, task));
        }

        await Promise.all(promises);
    }

    private async _downloadTileAsync(tile: tiles.TileSummary, task: SeedingTask): Promise<void> {
        const directoryName: string = path.dirname(tile.filePath);

        try {
            const response = await axios.get(tile.url, {
                responseType: "stream"
            });

            if (!fs.existsSync(directoryName)) {
                fs.mkdirpSync(directoryName);
            }

            // pipe the result stream into a file on disc
            response.data.pipe(fs.createWriteStream(tile.filePath));

            task.tilesDownloaded++;
        } catch (error) {
            task.tilesInError++;
        }

        // notify the task has been updated
        this._seedingSvc.updateTask(task);
    }
}