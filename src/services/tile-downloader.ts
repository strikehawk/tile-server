import fs from "fs-extra";
import path from "path";
import axios, { AxiosInstance, AxiosProxyConfig, AxiosStatic } from "axios";
import _ from "lodash";

import logger from "../util/logger";

import { SeedingTask } from "../server/seeding-task";
import { SeedingService } from "./seeding.service";

export class TileDownloader {
    constructor(private _seedingSvc: SeedingService) {
        this._scheduleRequests(50);
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
        const directoryName: string = path.dirname(path.normalize(tile.filePath));

        try {
            const response = await axios.get(tile.url, {
                responseType: "stream"
            });

            // if (!fs.pathExistsSync(directoryName)) {
            //     fs.mkdirpSync(directoryName);
            // }

            fs.ensureDirSync(directoryName);

            // pipe the result stream into a file on disk
            response.data.pipe(fs.createWriteStream(tile.filePath));

            task.tilesDownloaded++;
        } catch (error) {
            task.tilesInError++;
        }

        // notify the task has been updated
        this._seedingSvc.updateTask(task);
    }

    private _scheduleRequests(interval: number) {
        let lastInvocationTime: number = undefined;

        const scheduler = (config: AxiosProxyConfig) => {
            const now = Date.now();
            if (lastInvocationTime) {
                lastInvocationTime += interval;
                const waitPeriodForThisRequest = lastInvocationTime - now;
                if (waitPeriodForThisRequest > 0) {
                    return new Promise((resolve) => {
                        setTimeout(
                            () => resolve(config),
                            waitPeriodForThisRequest);
                    });
                }
            }

            lastInvocationTime = now;
            return config;
        };

        axios.interceptors.request.use(scheduler);
    }
}