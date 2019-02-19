declare namespace tiles {
    /**
     * A projection extent, in the [minx, miny, maxx, maxy] order. Values are specified in the projection units.
     */
    export type Extent = [number, number, number, number];

    /**
     * A coordinate expressed in a specific projection, in the form [x, y, elevation?]. When elevation is not present, it is assumed to be 0.
     */
    export type GeoLocation = [number, number] | [number, number, number];

    interface ProjectionDef {
        axis: string;
        datum_params: string | number[];
        datumCode: string;
        datumName: string;
        ellps: string;
        projName: string;
        title: string;
        units: string;
        rf: number;
        lat0: number;
        lat1: number;
        lat2: number;
        lat_ts: number;
        long0: number;
        long1: number;
        long2: number;
        alpha: number;
        longc: number;
        x0: number;
        y0: number;
        k0: number;
        a: number;
        b: number;
        R_A: boolean;
        zone: number;
        utmSouth: boolean;
        to_meter: number;
        from_greenwich: number;
        nadgrids: any;
    }
}