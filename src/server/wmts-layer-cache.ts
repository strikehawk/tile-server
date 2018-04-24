import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { MimeTypeService } from "../services/mime-type.service";
import { TileMatrixSetService } from "../services/tile-matrix-set.service";
import { TileMatrixSetLimits } from "../ogc/tile-matrix-set-limits";
import { TileMatrixSetLink } from "../ogc/tile-matrix-set-link";

export class WmtsLayerCache {
    public static validateOptions(options: tiles.WmtsLayerCacheOptions, mimeSvc: MimeTypeService): void {
        if (!options.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!options.tileMatrixSet) {
            throw new Error("TileMatrixSet cannot be empty.");
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
    }

    public static validateCreationRequest(request: tiles.WmtsLayerCacheCreationRequest, mimeSvc: MimeTypeService): void {
        if (!request.identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        if (!request.tileMatrixSet) {
            throw new Error("TileMatrixSet cannot be empty.");
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

        WmtsLayerCache.validateOptions(options, mimeSvc);

        this.identifier = options.identifier;
        this.label = options.label;
        this.description = options.description;
        this.tileMatrixSet = tmsSvc.getTileMatrixSet(options.tileMatrixSet);
        this.style = options.style;
        this.format = mimeSvc.getMimeTypeByType(options.format);

        if (options.tileMatrixSetLimits) {
            this.tileMatrixSetLimits = TileMatrixSetLimits.fromOptions(options.tileMatrixSetLimits);
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
            tileMatrixSetLimits: this.tileMatrixSetLimits ? this.tileMatrixSetLimits.serialize() : undefined
        };
    }
}