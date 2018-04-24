import { TileMatrixLimits } from "./tile-matrix-limits";
import { TileMatrixSet } from "./tile-matrix-set";

export class TileMatrixSetLimits {
    public static fromOptions(options: wmts.TileMatrixSetLimits): TileMatrixSetLimits {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        return new TileMatrixSetLimits(options.tileMatrixLimits.map(o => TileMatrixLimits.fromOptions(o)));
    }

    public static intersect(a: TileMatrixSetLimits, b: TileMatrixSetLimits): TileMatrixSetLimits {
        if (!a && !b) {
            return null;
        }

        if (!a && b) {
            return b;
        }

        if (a && !b) {
            return a;
        }

        // initialize a lookup table with the content of A.
        const mapResult: Map<string, TileMatrixLimits> =
            new Map<string, TileMatrixLimits>(<[string, TileMatrixLimits][]> a.tileMatrixLimits.map(o => [o.tileMatrix, o.clone()]));

        // Iterate over B content. Check for each item if another one with the same TileMatrix exists in A.
        // When a pair is found, compute the union of both.
        for (const l of b.tileMatrixLimits) {
            if (mapResult.has(l.tileMatrix)) {
                mapResult.set(l.tileMatrix, mapResult.get(l.tileMatrix).union(l));
            } else {
                mapResult.set(l.tileMatrix, l);
            }
        }

        // Initialize the result with the content of A.
        const result: TileMatrixSetLimits = new TileMatrixSetLimits(Array.from(mapResult.values()));

        return result;
    }

    public tileMatrixLimits: TileMatrixLimits[];

    constructor(tileMatrixLimits?: TileMatrixLimits[]) {
        if (tileMatrixLimits) {
            this.tileMatrixLimits = tileMatrixLimits;
        }
    }

    public getTileCount(tms: TileMatrixSet, startZoom?: number, endZoom?: number): number {
        if (!tms) {
            throw new Error("TileMatrixSet cannot be null.");
        }

        const start: number = typeof startZoom === "number" ? startZoom : 0;
        const end: number = typeof endZoom === "number" ? endZoom : tms.tileMatrix.length - 1;
        if (this.tileMatrixLimits == null || this.tileMatrixLimits.length === 0) {
            return tms.getTileCount();
        } else {
            return this.tileMatrixLimits.filter(o => {
                const zoomLevel: number = tms.getZoomLevel(o.tileMatrix);
                return zoomLevel >= start && zoomLevel <= end;
            }).map(o => o.tileCount).reduce((sum: number, count: number) => { return sum + count; });
        }
    }

    public serialize(): wmts.TileMatrixSetLimits {
        return {
            tileMatrixLimits: this.tileMatrixLimits.map(o => o.serialize())
        };
    }
}