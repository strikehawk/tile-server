declare namespace tiles {
    /**
     * A projection extent, in the [minx, miny, maxx, maxy] order. Values are specified in the projection units.
     */
    export type Extent = [number, number, number, number];

    /**
     * A coordinate expressed in a specific projection, in the form [x, y, elevation?]. When elevation is not present, it is assumed to be 0.
     */
    export type GeoLocation = [number, number] | [number, number, number];
}