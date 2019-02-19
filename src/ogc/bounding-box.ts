export class BoundingBox {
    public readonly srs: string;
    public lowerCorner: tiles.GeoLocation;
    public upperCorner: tiles.GeoLocation;

    /**
     * Create a new BoundingBox
     * @param srs The identifier of the supported SRS, eg "EPSG:4326".
     * @param bounds The bounds of the box, in projection units, in the form [minx, miny, maxx, maxy].
     */
    constructor(srs: string, private bounds: [number, number, number, number]) {
        if (!srs) {
            throw new Error("SRS cannot be empty.");
        }

        if (!bounds) {
            throw new Error("Bounds cannot be null.");
        }

        this.srs = srs;
        this.lowerCorner = [bounds[0], bounds[1]];
        this.upperCorner = [bounds[2], bounds[3]];
    }

    public serialize(): wmts.BoundingBox {
        return {
            crs: this.srs,
            lowerCorner: <tiles.GeoLocation> this.lowerCorner.slice(),
            upperCorner: <tiles.GeoLocation> this.upperCorner.slice()
        };
    }
}