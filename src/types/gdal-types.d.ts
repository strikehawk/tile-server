declare module Gdal {
    export interface GeoLocation {
        x: number;
        y: number;
        z?: number;
    }

    export interface Size {
        x: number;
        y: number;
    }

    export interface MinMax {
        min: number;
        max: number;
    }

    export interface Statistics extends MinMax {
        mean: number;
        std_dev: number;
    }

    export type GDT = "Byte" | "CFloat32" | "CFloat64" | "CInt16" | "CInt32" | "Float32" | "Float64" | "Int16" | "Int32" |
        "UInt16" | "UInt32" | "Unknown";

    export type SamplingType = "NEAREST" | "BILINEAR" | "CUBIC" | "CUBICSPLINE" | "LANCZOS" | "GAUSS" |"AVERAGE" | "MODE";
    
    export type ResamplingType = "NEAREST" | "GAUSS" | "CUBIC" | "AVERAGE" | "MODE" | "AVERAGE_MAGPHASE" | "NONE";

    /**
     * A bounding box expressed in the form [ulx, uly, lrx, lry].
     */
    export type BoundingBox = [number, number, number, number];

    /**
     * A pixel zone in the form [xoff, yoff, xsize, ysize] with the xoff,yoff being the ulx, uly in pixel/line.
     */
    export type PixelWindow = [number, number, number, number];
}
