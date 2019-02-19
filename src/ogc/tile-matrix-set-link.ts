import { TileMatrixSet } from "./tile-matrix-set";
import { TileMatrixSetLimits } from "./tile-matrix-set-limits";
import { TileMatrixSetService } from "../services/tile-matrix-set.service";

export class TileMatrixSetLink {
    public static fromOptions(options: wmts.TileMatrixSetLink, svc: TileMatrixSetService): TileMatrixSetLink {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        if (!svc) {
            throw new Error("TileMatrixSetService cannot be null.");
        }

        const link: TileMatrixSetLink = new TileMatrixSetLink();
        link.tileMatrixSet = svc.getTileMatrixSet(options.tileMatrixSet);

        if (options.limits) {
            link.tileMatrixSetLimits = TileMatrixSetLimits.fromOptions(options.limits);
        }

        return link;
    }

    public tileMatrixSet: TileMatrixSet;
    public tileMatrixSetLimits: TileMatrixSetLimits;

    public serialize(): wmts.TileMatrixSetLink {
        return {
            tileMatrixSet: this.tileMatrixSet.identifier,
            limits: this.tileMatrixSetLimits && this.tileMatrixSetLimits.serialize()
        };
    }
}