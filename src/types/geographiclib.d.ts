/**
 * (Very) partial definition file for Geographiclib module.
 */
declare namespace GeographicLib {
    export interface GeodesicResult {
        /**
         * φ1, latitude of point 1 (degrees)
         */
        lat1?: number;

        /**
         * λ1, longitude of point 1 (degrees)
         */
        lon1?: number;

        /**
         * α1, azimuth of line at point 1 (degrees)
         */
        azi1?: number;

        /**
         * φ2, latitude of point 2 (degrees)
         */
        lat2?: number;

        /**
         * λ2, longitude of point 2 (degrees)
         */
        lon2?: number;

        /**
         * α2, (forward) azimuth of line at point 2 (degrees);
         */
        azi2?: number;

        /**
         * s12, distance from 1 to 2 (meters)
         */
        s12?: number;

        /**
         * σ12, arc length on auxiliary sphere from 1 to 2 (degrees)
         */
        a12: number;

        /**
         * m12, reduced length of geodesic (meters)
         */
        m12?: number;

        /**
         * M12, geodesic scale at 2 relative to 1 (dimensionless)
         */
        M12?: number;

        /**
         * M21, geodesic scale at 1 relative to 2 (dimensionless)
         */
        M21?: number;

        /**
         * S12, area between geodesic and equator (meters2)
         */
        S12?: number;
    }

    /**
     * Performs geodesic calculations on an ellipsoid of revolution. The routines for solving the direct and inverse problems return an object with some of the following fields set: lat1, lon1, azi1, lat2, lon2, azi2, s12, a12, m12, M12, M21, S12. See The library interface, "The results".
     */
    export class Geodesic {
        /**
         * A Geodesic object initialized for the WGS84 ellipsoid.
         */
        public static WGS84: Geodesic;

        /**
         * Initialize a Geodesic object for a specific ellipsoid.
         * @param a The equatorial radius of the ellipsoid (meters).
         * @param f The flattening of the ellipsoid. Setting f = 0 gives a sphere (on which geodesics are great circles). Negative f gives a prolate ellipsoid.
         */
        constructor(a: number, f: number);

        /**
         * Solve the direct geodesic problem.
         * The lat1, lon1, azi1, s12, and a12 fields of the result are always set. For details on the outmask parameter, see The library interface, "The outmask and caps parameters".
         * @param lat1 The latitude of the first point in degrees.
         * @param lon1 The longitude of the first point in degrees.
         * @param azi1 The azimuth at the first point in degrees.
         * @param s12 The distance from the first point to the second in meters.
         * @param outmask Which results to include.
         */
        public Direct(lat1: number, lon1: number, azi1: number, s12: number, outmask?: any): GeodesicResult;

        /**
         * Solve the inverse geodesic problem.
         * The lat1, lon1, lat2, lon2, and a12 fields of the result are always set. For details on the outmask parameter, see The library interface, "The outmask and caps parameters".         * @param lat1 The latitude of the first point in degrees.
         * @param lat1 The latitude of the first point in degrees.
         * @param lon1 The longitude of the first point in degrees.
         * @param lat2 The latitude of the second point in degrees.
         * @param lon2 The longitude of the second point in degrees.
         * @param outmask Which results to include.
         */
        public Inverse(lat1: number, lon1: number, lat2: number, lon2: number, outmask?: any): GeodesicResult;
    }
}

export = GeographicLib;