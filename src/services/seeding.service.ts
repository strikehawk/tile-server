import fs from "fs-extra";
import path from "path";

import logger from "../util/logger";

import { SeedingTask } from "../server/seeding-task";
import { WmtsLayerCache } from "../server/wmts-layer-cache";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";

import { ComputingService } from "./computing.service";
import { MapSourceService } from "./map-source.service";
import { UrlBuilderFactory, UrlBuilder } from "./url-builder-factory";
import { LayerService } from "./layer.service";
import { FilePathGenerator } from "../server/file-path-generator";
import { WmtsLayerDefinition } from "../server/wmts-layer-definition";
import { TileObject } from "../server/tile-object";

export class SeedingService {
    private _tasks: Map<number, SeedingTask>;

    constructor(private _computingSvc: ComputingService,
        private _mapSourceSvc: MapSourceService,
        private _urlBuilderFactory: UrlBuilderFactory,
        private _layerSvc: LayerService,
        private _filePathGenerator: FilePathGenerator) {
        this._tasks = new Map<number, SeedingTask>();
    }

    public getTasks(): SeedingTask[] {
        return Array.from(this._tasks.values());
    }

    public getTaskSummaries(): tiles.SeedingTaskSummary[] {
        return this.getTasks().map(o => o.buildSummary());
    }

    public getTask(id: number): SeedingTask {
        if (typeof id !== "number") {
            throw new Error("Id must be a number.");
        }

        if (!this._tasks.has(id)) {
            logger.warn(`Unknown seeding task '${id}'.`);
            return null;
        }

        return this._tasks.get(id);
    }

    public getTileCount(request: tiles.SeedingRequest): number {
        const seedTask = this._buildTask(request);

        return seedTask.tileCount;
    }

    public createNewTask(request: tiles.SeedingRequest): SeedingTask {
        const seedTask = this._buildTask(request);

        this._tasks.set(seedTask.id, seedTask);

        return seedTask;
    }

    public updateTask(task: SeedingTask): void {
        if (!task) {
            throw new Error("Task cannot be null.");
        }

        if (task.remainingTiles === 0) {
            // task has finished. Remove it from tasks map
            this._tasks.delete(task.id);
        }
    }

    private _buildTask(request: tiles.SeedingRequest): SeedingTask {
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
        const seedingMode = request.seedingMode || "overwrite";

        let limits: TileMatrixSetLimits;

        if (request.bbox) {
            limits = cache.tileMatrixSet.createLimits(this._computingSvc.convertBboxToExtent(request.bbox, cache.tileMatrixSet.supportedCRS));
        }

        if (cache.tileMatrixSetLimits) {
            limits = limits ? TileMatrixSetLimits.intersect(limits, cache.tileMatrixSetLimits) : cache.tileMatrixSetLimits;
        }

        const tiles = this._buildTileList(layerDef, cache, urlBuilder, request.seedingMode, startZoom, endZoom, limits);

        return new SeedingTask(request, tiles);
    }

    private _buildTileList(layerDef: WmtsLayerDefinition, cache: WmtsLayerCache, urlBuilder: UrlBuilder, seedingMode: tiles.SeedingMode, startZoom: number, endZoom: number,
        limits?: TileMatrixSetLimits): tiles.TileSummary[] {
        const result: tiles.TileSummary[] = [];

        let summary: tiles.TileSummary;
        for (const t of layerDef.iterateTiles(cache, startZoom, endZoom, limits)) {
            // build the TileSummary corresponding to the tile
            summary = this._buildTileSummary(layerDef, urlBuilder, t);

            if (seedingMode === "missing") {
                // check if the tile already exists
                if (fs.existsSync(summary.filePath)) {
                    // skip the tile
                    continue;
                }
            }

            result.push(summary);
        }

        return result;
    }

    private _buildTileSummary(layerDef: WmtsLayerDefinition, urlBuilder: UrlBuilder, tile: TileObject): tiles.TileSummary {
        return {
            url: urlBuilder.getRequestUrl(tile),
            filePath: this._filePathGenerator.getTilePath(layerDef.filePathScheme, tile)
        };
    }
}