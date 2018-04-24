export class Srs {
    public readonly identifiers: string[];
    public readonly metersPerUnit: number;

    constructor(identifiers: string[], metersPerUnit: number) {
        if (!identifiers) {
            throw new Error("Identifiers cannot be null.");
        }

        if (identifiers.length === 0) {
            throw new Error("Identifier list cannot be empty.");
        }

        if (typeof metersPerUnit !== "number") {
            throw new Error("Meters per unit must be a number.");
        }

        if (metersPerUnit <= 0) {
            throw new Error("Meters per unit shall be strictly positive.");
        }

        this.identifiers = identifiers;
        this.metersPerUnit = metersPerUnit;
    }
}

export class SrsService {
    private _srs: Map<string, Srs>;

    constructor() {
        this._srs = new Map<string, Srs>();
        this._CreateSrs();
    }

    public getSrsList(): Srs[] {
        return Array.from(this._srs.values());
    }

    public getSrs(identifier: string): Srs {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        const srs: Srs = this._srs.get(identifier.toLowerCase());

        return srs;
    }

    private _CreateSrs(): void {
        const epsg4326: Srs = new Srs(new Array("epsg:4326", "urn:ogc:def:crs:epsg::4326"), 6378137.0 * 2.0 * Math.PI / 360.0);
        this._AddSrs(epsg4326);

        const epsg3857: Srs = new Srs(new Array("epsg:3857", "urn:ogc:def:crs:epsg::3857", "epsg:900913", "urn:ogc:def:crs:epsg::900913"), 1);
        this._AddSrs(epsg3857);

        const epsg32642: Srs = new Srs(new Array("epsg:32642", "urn:ogc:def:crs:epsg::32642"), 1);
        this._AddSrs(epsg32642);
    }

    private _AddSrs(srs: Srs): void {
        for (const i of srs.identifiers) {
            if (!this._srs.has(i)) {
                this._srs.set(i, srs);
            }
        }
    }
}