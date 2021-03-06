import geoLib from "geographiclib";
import proj from "proj4";
import { SrsService } from "./srs.service";

export class ComputingService {
    constructor(private _srsSvc: SrsService) { }

    /**
     * Compute the position of a target point, from a start point and given a specific bearing and distance.
     * @param start The start point of the computation.
     * @param bearing Bearing, in degrees from North clockwise, from start to target point.
     * @param distance Distance in meters between start and target point.
     * @param result The GeoLocation to update with the result of the computation.
     */
    public projectPoint(start: tiles.GeoLocation, bearing: number, distance: number, result?: tiles.GeoLocation): tiles.GeoLocation {
        if (!start) {
            throw new Error("Start cannot be null.");
        }

        if (typeof bearing !== "number") {
            throw new Error("Bearing must be a number.");
        }

        if (typeof distance !== "number") {
            throw new Error("Distance must be a number.");
        }

        result = result || [0, 0];

        const geoid: geoLib.Geodesic = geoLib.Geodesic.WGS84;

        const geoResult: geoLib.GeodesicResult = geoid.Direct(start[1], start[0], bearing, distance);

        result[0] = geoResult.lon2;
        result[1] = geoResult.lat2;

        return result;
    }

    /**
     * Convert a BoundingBox to the equivalent extent. If the CRS of the BoundingBox is not specified,
     * it is assumed to be the same as the target projection (thus requiring no conversion).
     * @param bbox The BoundingBox to convert.
     * @param targetProjection The target projection identifier, eg "EPSG:4326".
     * @returns An extent expressed in the target projection
     */
    public convertBboxToExtent(bbox: wmts.BoundingBox, targetProjection: string): tiles.Extent {
        if (!bbox) {
            throw new Error("Bounding box cannot be null.");
        }

        if (!targetProjection) {
            throw new Error("Target projection cannot be empty.");
        }

        // create extent from bbox
        const extent: tiles.Extent = [bbox.lowerCorner[0], bbox.lowerCorner[1], bbox.upperCorner[0], bbox.upperCorner[1]];

        // convert the extent (if needed)
        return this._convertExtent(extent, bbox.crs || targetProjection, targetProjection);
    }

    /**
     * Converts an extent expressed in WGS84 coordinates into its equivalent in a different projection.
     * @param extent The extent to convert.
     * @param targetProjection The target projection identifier, eg "EPSG:4326".
     * @returns An extent expressed in the target projection.
     */
    public convertWgs84Extent(extent: tiles.Extent, targetProjection: string): tiles.Extent {
        if (!extent) {
            throw new Error("Extent cannot be null.");
        }

        if (!targetProjection) {
            throw new Error("Target projection cannot be empty.");
        }

        if (targetProjection === "EPSG:4326") {
            // no conversion required
            return extent;
        }

        return this._convertExtent(extent, "EPSG:4326", targetProjection);
    }

    private _convertExtent(extent: tiles.Extent, sourceProjection: string, targetProjection: string): tiles.Extent {
        // try to resolve the projections
        const sourceSrs = this._srsSvc.getSrs(sourceProjection);
        if (!sourceProjection) {
            throw new Error(`Unknown source projection '${sourceProjection}'.`);
        }

        const targetSrs = this._srsSvc.getSrs(targetProjection);
        if (!targetSrs) {
            throw new Error(`Unknown target projection '${targetProjection}'.`);
        }

        // TODO: Use better mechanism for handling projection indentifiers
        const sourceProj: proj.InterfaceProjection = proj.Proj(sourceSrs.identifiers[0].toUpperCase());
        const targetProj: proj.InterfaceProjection = proj.Proj(targetSrs.identifiers[0].toUpperCase());
        const srcLowerCorner: tiles.GeoLocation = [extent[0], extent[1]];
        const srcUpperCorner: tiles.GeoLocation = [extent[2], extent[3]];

        const tgtLowerCorner: proj.InterfaceCoordinates = proj.transform(sourceProj, targetProj, srcLowerCorner);
        const tgtUpperCorner: proj.InterfaceCoordinates = proj.transform(sourceProj, targetProj, srcUpperCorner);

        return [tgtLowerCorner.x, tgtLowerCorner.y, tgtUpperCorner.x, tgtUpperCorner.y];

    }
}