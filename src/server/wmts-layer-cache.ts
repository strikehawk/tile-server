import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { MimeTypeService } from "../services/mime-type.service";
import { TileMatrixSetService } from "../services/tile-matrix-set.service";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";
import { TileMatrixSetLink } from "../ogc/tile-matrix-set-link";
import { ComputingService } from "../services/computing.service";

export class WmtsLayerCache {
    public static validateOptions(options: tiles.WmtsLayerCacheOptions, mimeSvc: MimeTypeService, tileMatrixSetSvc: TileMatrixSetService): void {
        if (!options.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!options.tileMatrixSet) {
            throw new Error("TileMatrixSet cannot be empty.");
        }

        const tms: TileMatrixSet = tileMatrixSetSvc.getTileMatrixSet(options.tileMatrixSet);
        if (!tms) {
            throw new Error(`Unknown TileMatrixSet '${options.tileMatrixSet}'.`);
        }

        if (!options.style) {
            throw new Error("Style cannot be empty.");
        }

        if (!options.format) {
            throw new Error("Format cannot be empty.");
        }

        if (!mimeSvc.getMimeTypeByType(options.format)) {
            throw new Error(`Unsupported mime-type ${options.format}`);
        }

        if (options.tileMatrixSetLimits) {
            // TODO: Validate TileMatrixLimits?
        }

        const minZoomDefined: boolean = typeof options.minZoom === "number";
        const maxZoomDefined: boolean = typeof options.maxZoom === "number";

        if (minZoomDefined) {
            if (isNaN(options.minZoom)) {
                throw new Error("Min zoom must be a number.");
            }

            if (options.minZoom < 0) {
                throw new Error("Min zoom must be superior or equal to 0.");
            }
        }

        if (maxZoomDefined) {
            if (isNaN(options.maxZoom)) {
                throw new Error("Max zoom must be a number.");
            }

            if (options.maxZoom > tms.tileMatrix.length - 1) {
                throw new Error("Max zoom must be inferior or equal to the number of TileMatrices in the set - 1.");
            }
        }

        if (minZoomDefined && maxZoomDefined) {
            if (options.maxZoom < options.minZoom) {
                throw new Error("Min zoom must inferior or equal to max zoom.");
            }
        }
    }

    public static validateCreationRequest(request: tiles.WmtsLayerCacheCreationRequest, mimeSvc: MimeTypeService, tileMatrixSetSvc: TileMatrixSetService): void {
        if (!request.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!request.tileMatrixSet) {
            throw new Error("TileMatrixSet cannot be empty.");
        }

        const tms: TileMatrixSet = tileMatrixSetSvc.getTileMatrixSet(request.tileMatrixSet);
        if (!tms) {
            throw new Error(`Unknown TileMatrixSet '${request.tileMatrixSet}'.`);
        }

        if (!request.style) {
            throw new Error("Style cannot be empty.");
        }

        if (!request.format) {
            throw new Error("Format cannot be empty.");
        }

        if (!mimeSvc.getMimeTypeByType(request.format)) {
            throw new Error(`Unsupported mime-type ${request.format}`);
        }

        const minZoomDefined: boolean = typeof request.minZoom === "number";
        const maxZoomDefined: boolean = typeof request.maxZoom === "number";

        if (minZoomDefined) {
            if (isNaN(request.minZoom)) {
                throw new Error("Min zoom must be a number.");
            }

            if (request.minZoom < 0) {
                throw new Error("Min zoom must be superior or equal to 0.");
            }
        }

        if (maxZoomDefined) {
            if (isNaN(request.maxZoom)) {
                throw new Error("Max zoom must be a number.");
            }

            if (request.maxZoom > tms.tileMatrix.length - 1) {
                throw new Error("Max zoom must be inferior or equal to the number of TileMatrices in the set - 1.");
            }
        }

        if (minZoomDefined && maxZoomDefined) {
            if (request.maxZoom < request.minZoom) {
                throw new Error("Min zoom must inferior or equal to max zoom.");
            }
        }
    }

    public static createOptions(request: tiles.WmtsLayerCacheCreationRequest,
        wgs84Extent: tiles.Extent,
        tmsSvc: TileMatrixSetService,
        computingSvc: ComputingService): tiles.WmtsLayerCacheOptions {
        const tms: TileMatrixSet = tmsSvc.getTileMatrixSet(request.tileMatrixSet);
        if (!tms) {
            throw new Error(`Unknown TileMatrixSet identifier '${request.tileMatrixSet}'.`);
        }

        // convert map source extent to target projection
        const extent: tiles.Extent = computingSvc.convertWgs84Extent(wgs84Extent, tms.supportedCRS);

        // build a TileMatrixSetLimits based on the extent
        const limits = tms.createLimits(extent, request.minZoom, request.maxZoom).serialize();

        const options: tiles.WmtsLayerCacheOptions = {
            identifier: request.identifier,
            label: request.label,
            description: request.description,
            tileMatrixSet: request.tileMatrixSet,
            style: request.style,
            format: request.format,
            tileMatrixSetLimits: limits
        };

        if (typeof request.minZoom === "number") {
            options.minZoom = request.minZoom;
        }

        if (typeof request.maxZoom === "number") {
            options.maxZoom = request.maxZoom;
        }

        return options;
    }

    public readonly identifier: string;
    public label: string;
    public description: string;
    public get tileMatrixSetIdentifier(): string {
        return this.tileMatrixSet ? this.tileMatrixSet.identifier : null;
    }

    public tileMatrixSet: TileMatrixSet;
    public style: string;
    public format: tiles.MimeType;
    public tileMatrixSetLimits: TileMatrixSetLimits;
    public minZoom: number;
    public maxZoom: number;

    constructor(options: tiles.WmtsLayerCacheOptions, tmsSvc: TileMatrixSetService, mimeSvc: MimeTypeService) {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        if (!tmsSvc) {
            throw new Error("TileMatrixSetService cannot be null.");
        }

        if (!mimeSvc) {
            throw new Error("MimeTypeService cannot be null.");
        }

        WmtsLayerCache.validateOptions(options, mimeSvc, tmsSvc);

        this.identifier = options.identifier;
        this.label = options.label;
        this.description = options.description;
        this.tileMatrixSet = tmsSvc.getTileMatrixSet(options.tileMatrixSet);
        this.style = options.style;
        this.format = mimeSvc.getMimeTypeByType(options.format);

        if (options.tileMatrixSetLimits) {
            this.tileMatrixSetLimits = TileMatrixSetLimits.fromOptions(options.tileMatrixSetLimits);
        }

        if (typeof options.minZoom === "number") {
            this.minZoom = options.minZoom;
        }

        if (typeof options.maxZoom === "number") {
            this.maxZoom = options.maxZoom;
        }
    }

    public getTileMatrixSetLink(): TileMatrixSetLink {
        const link: TileMatrixSetLink = new TileMatrixSetLink();
        link.tileMatrixSet = this.tileMatrixSet;
        link.tileMatrixSetLimits = this.tileMatrixSetLimits;

        return link;
    }

    public serialize(): tiles.WmtsLayerCacheOptions {
        return {
            identifier: this.identifier,
            label: this.label,
            description: this.description,
            tileMatrixSet: this.tileMatrixSet.identifier,
            style: this.style,
            format: this.format.type,
            tileMatrixSetLimits: this.tileMatrixSetLimits ? this.tileMatrixSetLimits.serialize() : undefined,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom
        };
    }
}