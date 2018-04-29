import fs from "fs-extra";
import path from "path";
import axios from "axios";

import logger from "../util/logger";

import { SeedTask } from "../server/seed-task";
import { MapSourceService } from "./map-source.service";
import { LayerService } from "./layer.service";
import { FilePathGenerator } from "../server/file-path-generator";
import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { WmtsLayerCache } from "../server/wmts-layer-cache";
import { TileIterationRequest } from "../server/tile-iteration-request";
import { TileObject } from "../server/tile-object";
import { TileIterationRequestFactory } from "./tile-iteration-request-factory";
import { UrlBuilder, UrlBuilderFactory } from "./url-builder-factory";

export class TileDownloader {
    private _runningTasks: Map<number, SeedTask>;

    public get runningTasks(): SeedTask[] {
        return Array.from(this._runningTasks.values());
    }

    constructor(
        private _mapSourceSvc: MapSourceService,
        private _urlBuilderFactory: UrlBuilderFactory,
        private _layerSvc: LayerService,
        private _tileIterationRequestFactory: TileIterationRequestFactory,
        private _filePathGenerator: FilePathGenerator) {
        this._runningTasks = new Map<number, SeedTask>();
    }

    public describe(request: tiles.SeedRequest): tiles.SeedTaskDescription {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        const layerDef: WmtsLayerDefinition = this._layerSvc.getLayer(request.layerDefinition);
        if (!layerDef) {
            throw new Error(`No layer found with identifier '${request.layerDefinition}'.`);
        }

        const cache: WmtsLayerCache = layerDef.getCache(request.cacheIdentifier);
        if (!cache) {
            throw new Error(`No cache found with identifier '${request.cacheIdentifier}'.`);
        }

        return this._getSeedTaskDescription(request, cache);
    }

    public seed(request: tiles.SeedRequest): number {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        const layerDef = this._layerSvc.getLayer(request.layerDefinition);
        if (!layerDef) {
            throw new Error(`No layer found with identifier '${request.layerDefinition}'.`);
        }

        const cache = layerDef.getCache(request.cacheIdentifier);
        if (!cache) {
            throw new Error(`No cache found with identifier '${request.cacheIdentifier}'.`);
        }

        const mapSource = this._mapSourceSvc.getMapSource(request.mapSource);
        if (!mapSource) {
            throw new Error(`No MapSource '${request.mapSource}' found.`);
        }

        const urlBuilder = this._urlBuilderFactory.getUrlBuilder(mapSource);

        const startZoom: number = typeof request.startZoom === "number" && !isNaN(request.startZoom) ? request.startZoom : 0;
        const endZoom: number = typeof request.endZoom === "number" && !isNaN(request.endZoom) ? request.endZoom : cache.tileMatrixSet.tileMatrix.length - 1;

        const iterationRequest = this._tileIterationRequestFactory.createRequest(layerDef, cache, startZoom, endZoom, request.bbox);
        const seedTask = new SeedTask(request, this._getSeedTaskDescription(request, cache));

        this._runningTasks.set(seedTask.id, seedTask);

        this._processSeedRequest(seedTask, layerDef, urlBuilder, iterationRequest).then(() => {
            logger.info(`Seed task ${seedTask.id} completed successfully.`);
        }, (reason: any) => {
            logger.error(`Seed task ${seedTask.id} encountered an error: ${reason}.`);
        });

        this._runningTasks.delete(seedTask.id);

        return seedTask.id;
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

    public async clearLayerCache(layer: string): Promise<void> {
        if (!layer) {
            throw new Error("Layer cannot be empty.");
        }

        const folderPath = this._filePathGenerator.getLayerPath(layer);
        await fs.remove(folderPath);
    }

    private _getSeedTaskDescription(request: tiles.SeedRequest, cache: WmtsLayerCache): tiles.SeedTaskDescription {
        if (!request) {
            throw new Error("Request cannot be null.");
        }

        if (!cache) {
            throw new Error("Cache cannot be null.");
        }

        const startZoom: number = typeof request.startZoom === "number" && !isNaN(request.startZoom) ? request.startZoom : 0;
        const endZoom: number = typeof request.endZoom === "number" && !isNaN(request.endZoom) ? request.endZoom : cache.tileMatrixSet.tileMatrix.length - 1;

        const tileCount: number = cache.tileMatrixSetLimits != null ? cache.tileMatrixSetLimits.getTileCount(cache.tileMatrixSet, startZoom, endZoom) : cache.tileMatrixSet.getTileCount(startZoom, endZoom);
        return { tileCount: tileCount };
    }

    private async _processSeedRequest(seedTask: SeedTask, layerDef: WmtsLayerDefinition, tileUrlBuilder: UrlBuilder, iterationRequest: TileIterationRequest): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const tile of layerDef.iterateTiles(iterationRequest)) {
            promises.push(this._downloadTileAsync(layerDef, tile, seedTask, tileUrlBuilder));
        }

        await Promise.all(promises);
    }

    private async _downloadTileAsync(layerDef: WmtsLayerDefinition, tile: TileObject, seedTask: SeedTask, tileUrlBuilder: UrlBuilder): Promise<void> {
        const tileUrl: string = tileUrlBuilder.getRequestUrl(tile);
        const tilePath: string = this._filePathGenerator.getTilePath(layerDef.filePathScheme, tile);
        const directoryName: string = path.dirname(tilePath);

        try {
            const response = await axios.get(tileUrl, {
                responseType: "stream"
            });

            if (!fs.existsSync(directoryName)) {
                fs.mkdirpSync(directoryName);
            }

              // pipe the result stream into a file on disc
            response.data.pipe(fs.createWriteStream(tilePath));
            // await fs.writeFile(tilePath, response.data);
            seedTask.tilesDownloaded++;
        } catch (error) {
            seedTask.tilesInError++;
        }
    }
}