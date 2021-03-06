import { Application } from "express";
import { Server } from "http";

import { ComputingService } from "./computing.service";
import { LayerService } from "./layer.service";
import { ConfigurationService } from "./config.service";
import { MimeTypeService } from "./mime-type.service";
import { TileMatrixSetService } from "./tile-matrix-set.service";
import { SrsService } from "./srs.service";
import { MapSourceService } from "./map-source.service";
import { FilePathGenerator } from "../server/file-path-generator";
import { WmtsService } from "./wmts.service";
import { UrlBuilderFactory } from "./url-builder-factory";
import { SeedingService } from "./seeding.service";
import { TileDownloader } from "./tile-downloader";

export class ServiceCatalog {
    public readonly computingService: ComputingService;
    public readonly configService: ConfigurationService;
    public readonly mimeTypeService: MimeTypeService;
    public readonly srsService: SrsService;
    public readonly tileMatrixSetService: TileMatrixSetService;
    public readonly mapSourceService: MapSourceService;
    public readonly layerService: LayerService;
    public readonly filePathGenerator: FilePathGenerator;
    public readonly wmtsService: WmtsService;
    public readonly urlBuilderFactory: UrlBuilderFactory;
    public readonly seedingService: SeedingService;
    public readonly tileDownloader: TileDownloader;

    constructor(rootPath: string) {
        this.configService = new ConfigurationService(rootPath);
        this.mimeTypeService = new MimeTypeService(this.configService.options);
        this.srsService = new SrsService();
        this.computingService = new ComputingService(this.srsService);
        this.tileMatrixSetService = new TileMatrixSetService(this.configService.options, this.srsService);
        this.mapSourceService = new MapSourceService(this.configService.options);
        this.layerService = new LayerService(this.configService.options, this.tileMatrixSetService, this.mapSourceService,
            this.mimeTypeService, this.computingService, this.filePathGenerator);
        this.filePathGenerator = new FilePathGenerator(this.configService.options);
        this.wmtsService = new WmtsService(this.tileMatrixSetService, this.mimeTypeService, this.layerService, this.filePathGenerator);

        this.urlBuilderFactory = new UrlBuilderFactory();
        this.seedingService = new SeedingService(this.computingService, this.mapSourceService, this.urlBuilderFactory,
            this.layerService, this.filePathGenerator);
        this.tileDownloader = new TileDownloader(this.seedingService);
    }
}