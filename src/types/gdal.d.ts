// Type definitions for gdal 0.4.x
// Project: https://github.com/naturalatlas/node-gdal
// Definitions by: cascadian <https://github.com/cascadian/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module Gdal {

    type options = Object | string[];

    export interface Bounds {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }

    export interface Bounds3D extends Bounds {
        minZ: number;
        maxZ: number;
    }

    export class Point extends Geometry {
        constructor(x: number, y: number, z?: number);
        x: number;
        y: number;
        z: number;
    }

    export class Geometry {
        /**
        * Computes boundary
        */
        boundary(): Geometry;
        /**
        * Buffers the geometry by the given distance.
        */
        buffer(distance: number, segments: number): Geometry;

        /**
        * Compute the centroid of the geometry
        */
        centroid(): Point;

        clone(): Geometry;

        /**
        * Closes any un-closed rings.
        */
        closeRings(): void;

        /**
        * Determines if the current geometry contains the provided geometry.
        * @param geometry
        */
        contains(geometry: Geometry): boolean;

        convexHull(): Geometry;

        crosses(geometry: Geometry): boolean;

        difference(geometry: Geometry): Geometry;

        disjoint(geometry: Geometry): boolean;

        distance(geometry: Geometry): Geometry;

        empty(): void;

        equals(geometry: Geometry): boolean;

        getEnvelope(): Envelope;

        getEnvelope3D(): Envelope3D;

        intersection(geometry: Geometry): Geometry;

        intersects(geometry: Geometry): boolean;

        isEmpty(): boolean;

        isRing(): boolean;

        isSimple(): boolean;

        isValid(): boolean;

        overlaps(geometry: Geometry): boolean;

        /**
         * Modify the geometry such that it has no segment longer than the given distance.
         */
        segmentize(segment_length: number): number;

        /**
         * Reduces the geometry complexity.
         */
        simplify(tolerance: number): Geometry;

        /**
         * Reduces the geometry complexity while preserving the topology.
         */
        simplifyPreserveTopology(tolerance: number): Geometry;

        swapXY(): void;

        /**
         * Computes the symmetric difference of this geometry and the second geometry.
         */
        symDifference(geometry: Geometry): Geometry;

        toGML(): Geometry;

        toJSON(): Geometry;

        toKML(): Geometry;

        toObject(): Object;

        touches(geometry: Geometry): boolean;

        toWKB(byte_order?: string, variant?: string): Geometry;

        toWKT(): string;

        transform(transformation: CoordinateTransformation): void;

        transformTo(srs: SpatialReference): void;

        union(geometry: Geometry): Geometry;

        within(geometry: Geometry): Geometry;

        coordinateDimension: number;

        dimension: number;

        name: string;

        srs: SpatialReference;

        wkbXize: number;
        wkbType: number;

        static create(type: number): Geometry;
        static fromWKB(wkb: Buffer, srs?: SpatialReference): Geometry;
        static fromWKT(wkt: string, srs?: SpatialReference): Geometry;


    }

    /**
     * Object for transforming between coordinate systems.
     */
    export class CoordinateTransformation {
        /**
         * @param source 
         * @param target If a raster Dataset, the conversion will represent a conversion to pixel coordinates.
         */
        constructor(source: SpatialReference, target: SpatialReference | Dataset);

        /**
         * Transform point from source to destination space.
         * @param x 
         * @param y 
         * @param z 
         * @example
         * pt = transform.transformPoint(0, 0, 0);
         * pt = transform.transformPoint({x: 0, y: 0, z: 0});
         */
        transformPoint(x: number, y: number, z?: number): GeoLocation;
        transformPoint(pt: GeoLocation): GeoLocation;
    }

    export class Polygon extends Geometry {
        constructor();
        boundary(): Geometry;
    }

    /**
    * A 3D bounding box
    */
    export class Envelope3D {
        constructor(bounds: Bounds3D);
        contains(envelope: Envelope3D): boolean;
        intersect(envelope: Envelope3D): void;
        intersects(envelope: Envelope3D): boolean;
        isEmpty(): boolean;
        merge(envelope: Envelope3D): void;

    }

    export class Envelope {
        constructor(bounds?: Bounds);
        contains(envelope: Envelope): boolean;
        intersect(envelope: Envelope): void;
        intersects(envelope: Envelope): boolean;
        isEmpty(): boolean;
        merge(envelope: Envelope): void;
        toPolygon(): Polygon;

    }

    export interface Layer {
        /**
        * Flush pending changes to disk.
        */
        flush(): void;

        /**
        * Fetch the extent of this layer.
        * @param force Defaults to true
        * @return Bounding envelope
        */
        getExtent(force?: boolean): Envelope;
    }

    export interface Units {
        value: any;
        unit: any;
    }

    export class SpatialReference {
        constructor(wkt?: string);
        autoIdentifyEPSG(): void;
        clone(): SpatialReference;
        cloneGeogCS(): SpatialReference;
        EPSGTreatsAsLatLong(): boolean;
        EPSGTreatsAsNorthingEasting(): boolean;
        getAngularUnits(): Units;
        getAttrValue(node_name: string, attr_index?: number): string;
        getAuthorityCode(target_key: string): string;
        getAuthorityName(target_key: string): string;
        getLinearUnits(): Units;
        isCompound(): boolean;
        isGeocentric(): boolean;
        isLocal(): boolean;
        isProjected(): boolean;
        isSame(srs: SpatialReference): boolean;
        isSameVertCS(srs: SpatialReference): boolean;
        isVertical(): boolean;
        morphFromESRI(): void;
        morphToESRI(): void;
        setWellKnownGeogCS(name: string): void;
        toPrettyWKT(simplify?: boolean): string;
        toProj4(): string;

        /**
         * Convert this SRS into WKT format.
         */
        toWKT(): string;
        toXML(): string;

        /**
         * Validate SRS tokens. This method attempts to verify that the spatial reference system is well formed, and consists of known 
         * tokens. The validation is not comprehensive.
         */
        validate(): string;

        static fromCRSURL(input: string): SpatialReference;
        static fromEPSG(input: number): SpatialReference;
        static fromEPSGA(input: number): SpatialReference;
        static fromESRI(input: string[]): SpatialReference;
        static fromMICoordSys(input: string): SpatialReference;
        static fromProj4(input: string): SpatialReference;
        static fromURL(url: string): SpatialReference;
        static fromURN(input: string): SpatialReference;
        /**
         * Initialize from an arbitrary spatial reference string.
         * This method will examine the provided input, and try to deduce the format, and then use it to initialize the spatial reference 
         * system.
         * @param input 
         */
        static fromUserInput(input: string): SpatialReference;
        static fromWKT(wkt: string): SpatialReference;
        static fromWMSAUTO(input: string): SpatialReference;
        static fromXML(input: string): SpatialReference;

    }

    export interface DatasetLayers {
        count(): number;
        get(key: string | number): Layer;
        forEach(iterator: (layer: Layer) => void): void;
        remove(index: number): void;
        copy(src_lyr: Layer, dst_lyr_name: string, options?: options): Layer;
        create(name: string, srs: SpatialReference, geomType: number | Function, creationOptions: options): Layer;
    }

    export interface RasterBandOverviews {}

    export interface RasterBandReadOptions {
        /**
         * Default to x_size.
         */
        buffer_width?: number;

        /**
         * Default to y_size.
         */
        buffer_height?: number;

        /**
         * See GDT constants.
         */
        dataType?: GDT;

        pixel_space?: number;

        line_space?: number;
    }

    /**
     * A representation of a RasterBand's pixels.
     * 
     * Note: Typed arrays should be created with an external ArrayBuffer for versions of node >= 0.11
     * @example
     * var data = new Float32Array(new ArrayBuffer(n*4));
     * //read data into the existing array
     * band.pixels.read(0,0,16,16,data);
     */
    export interface RasterBandPixels {
        /**
         * Returns the value at the x, y coordinate.
         * @param x 
         * @param y 
         */
        get (x: number, y: number): number;

        /**
         * Reads a region of pixels.
         * @param x 
         * @param y 
         * @param width 
         * @param height 
         * @param data The TypedArray to put the data in. A new array is created if not given.
         * @param options 
         */
        read(x: number, y: number, width: number, height: number, data?: ArrayBuffer, options?: RasterBandReadOptions): ArrayBuffer;

        /**
         * Reads a block of pixels.
         * @param x 
         * @param y 
         * @param data The TypedArray to put the data in. A new array is created if not given.
         */
        readBlock(x: number, y: number, data?: ArrayBuffer): ArrayBuffer;

        /**
         * Sets the value at the x, y coordinate.
         * @param x 
         * @param y 
         * @param value 
         */
        set(x: number, y: number, value: number): void;

        /**
         * Writes a region of pixels.
         * @param x 
         * @param y 
         * @param width 
         * @param height 
         * @param data The TypedArray to write to the band.
         * @param options 
         */
        write(x: number, y: number, width: number, height: number, data: ArrayBuffer, options?: RasterBandReadOptions): void;

        /**
         * Writes a block of pixels.
         * @param x 
         * @param y 
         * @param data The TypedArray of values to write to the band.
         */
        writeBlock(x: number, y: number, data: ArrayBuffer): void;
    }

    /**
     * A single raster band (or channel).
     */
    export interface RasterBand {
        /**
         * Size object containing "x" and "y" properties.
         */
        readonly blockSize: Size;

        /**
         * List of list of category names for this raster.
         */
        categoryNames: string[][];

        /**
         * Color interpretation mode (see GCI constants).
         */
        colorInterpretation: string;

        /**
         * Pixel data type (see GDT constants) used for this band.
         */
        readonly dataType?: GDT;

        /**
         * Name of of band.
         */
        readonly description: string;

        /**
         * Parent dataset.
         */
        readonly ds: Dataset;

        /**
         * An indicator if the underlying datastore can compute arbitrary overviews efficiently, such as is the case with OGDI over a 
         * network. Datastores with arbitrary overviews don't generally have any fixed overviews, but GDAL's RasterIO() method can be used 
         * in downsampling mode to get overview data efficiently.
         */
        readonly hasArbitraryOverviews: boolean;

        readonly id?: number;

        /**
         * Maximum value for this band.
         */
        readonly maximum: number;
        
        /**
         * Minimum value for this band.
         */
        readonly minimum: number;

        /**
         * No data value for this band.
         */
        noDataValue: number;

        /**
         * Raster value offset.
         */
        offset: number;

        readonly overviews: RasterBandOverviews;

        readonly pixels: RasterBandPixels;

        /**
         * Indicates if the band is read-only.
         */
        readonly readonly: boolean;

        /**
         * Raster value scale.
         */
        scale: number;

        /**
         * Size object containing "x" and "y" properties.
         */
        readonly size: Size;

        /**
         * Raster unit type (name for the units of this raster's values). For instance, it might be "m" for an elevation model in meters, 
         * or "ft" for feet. If no units are available, a value of "" will be returned.
         */
        unitType: string;

        /**
         * Computes image statistics. 
         * 
         * Returns the minimum, maximum, mean and standard deviation of all pixel values in this band. If approximate statistics are 
         * sufficient, the allow_approximation argument can be set to true in which case overviews, or a subset of image tiles may be used 
         * in computing the statistics.
         * @param allow_approximation If true statistics may be computed based on overviews or a subset of all tiles.
         */
        computeStatistics(allow_approximation: boolean): Statistics;

        /**
         * Adds a mask band to the current band.
         * @param flags Mask flags
         */
        createMaskBand(flags: number): void;

        /**
         * Fill this band with a constant value.
         * @param real_value 
         * @param imaginary_value 
         */
        fill(real_value: number, imaginary_value?: number): void;

        /**
         * Saves changes to disk.
         */
        flush(): void;

        /**
         * Return the mask band associated with the band.
         */
        getMaskBand(): RasterBand;

        /**
         * Return the status flags of the mask band associated with the band.
         * 
         * The result will be a bitwise OR-ed set of status flags with the following available definitions that may be extended in the future:
         * - GMF_ALL_VALID (0x01): There are no invalid pixels, all mask values will be 255. When used this will normally be the only flag set.
         * - GMF_PER_DATASET (0x02): The mask band is shared between all bands on the dataset.
         * - GMF_ALPHA (0x04): The mask band is actually an alpha band and may have values other than 0 and 255.
         * - GMF_NODATA (0x08): Indicates the mask is actually being generated from nodata values. (mutually exclusive of GMF_ALPHA)
         */
        getMaskFlags(): number;

        /**
         * Returns band metadata
         * @param domain 
         */
        getMetadata(domain?: string): any;

        /**
         * Fetch image statistics.
         * 
         * Returns the minimum, maximum, mean and standard deviation of all pixel values in this band. If approximate statistics are 
         * sufficient, the allow_approximation argument can be set to true in which case overviews, or a subset of image tiles may be used 
         * in computing the statistics.
         * @param allow_approximation If true statistics may be computed based on overviews or a subset of all tiles.
         * @param force If false statistics will only be returned if it can be done without rescanning the image.
         */
        getStatistics(allow_approximation: boolean, force: boolean): Statistics;

        /**
         * Set statistics on the band. This method can be used to store min/max/mean/standard deviation statistics.
         * @param min 
         * @param max 
         * @param mean 
         * @param std_dev 
         */
        setStatistics(min: number, max: number, mean: number, std_dev: number): void;

        toString(): string;
    }

    /**
     * Convert this SRS into WKT format.
     */
    export interface DatasetBands {
        /**
         * Parent dataset.
         */
        readonly ds: Dataset;

        /**
         * Returns the number of bands.
         */
        count(): number;

        create(dataType: GDT): RasterBand;

        /**
         * Iterates through all bands using a callback function. Note: GDAL band indexes start at 1, not 0.
         * @param callback The callback to be called with each RasterBand.
         */
        forEach(callback: (band: RasterBand, i: number) => void): void;

        /**
         * Returns the band with the given ID.
         * @param id 
         */
        get(id: number): RasterBand;

        map<T>(callback: (band: RasterBand, i: number) => T): T[];
    }

    /**
     * Format specific driver.
     * An instance of this class is created for each supported format, and manages information about the format.
     * This roughly corresponds to a file format, though some drivers may be gateways to many formats through a secondary multi-library.
     */
    export interface Driver {
        readonly description: string;

        /**
         * Copy the files of a dataset.
         * @param name_old Old name of the dataset.
         * @param name_new New name for the dataset.
         */
        copyFiles(name_old: string, name_new: string): void;

        /**
         * Create a new dataset with this driver.
         * @param filename 
         * @param x_size Raster width in pixels (ignored for vector datasets). Default to 0.
         * @param y_size Raster height in pixels (ignored for vector datasets). Default to 0.
         * @param band_count Default to 0.
         * @param data_type pixel data type (ignored for vector datasets) (see data types). Default to "Byte".
         * @param creation_options An array or object containing driver-specific dataset creation options.
         */
        create(filename: string, x_size?: number, y_size?: number, band_count?: number, data_type?: Gdal.GDT, 
            creation_options?: string[]|any): Gdal.Dataset;

        /**
         * Create a copy of a dataset.
         * @param filename 
         * @param src 
         * @param strict Default to false.
         * @param options An array or object containing driver-specific dataset creation options
         */
        createCopy(filename: string, src: Gdal.Dataset, strict?: boolean, options?: string[]|any): Gdal.Dataset;

        deleteDataset(filename: string): void;

        /**
         * Returns metadata about the driver.
         * @param domain 
         */
        getMetadata(domain?: string): any;
    }

    /**
     * An collection of all drivers registered with GDAL.
     */
    export class GDALDrivers {
        /**
         * Returns the number of drivers registered with GDAL.
         */
        public count(): number;

        /**
         * Iterates through all registered drivers using a callback function.
         * @param callback The callback to be called with each Driver.
         * @example
         * gdal.drivers.forEach(function(driver, i) { ... });
         */
        public forEach(callback: (driver: Driver, i: number) => void): void;

        /**
         * Returns a driver with the specified name.
         * Note: Prior to GDAL2.x there is a separate driver for vector VRTs and raster VRTs. Use "VRT:vector" to fetch the vector 
         * VRT driver and "VRT:raster" to fetch the raster VRT driver.
         * @param index 0-based index or driver name
         */
        public get(index: number | string): Driver;
    }

    /**
     * A set of associated raster bands and/or vector layers, usually from one file.
     * @example
     * // raster dataset:
     * dataset = gdal.open('file.tif');
     * bands = dataset.bands;
     *
     * // vector dataset:
     * dataset = gdal.open('file.shp');
     * layers = dataset.layers;
     */
    export interface Dataset {
        readonly bands: DatasetBands;
        readonly description: string;
        readonly driver: Driver
        /**
         * An affine transform which maps pixel/line coordinates into georeferenced space using the following relationship:
         * @example
         * var GT = dataset.geoTransform;
         * var Xgeo = GT[0] + Xpixel*GT[1] + Yline*GT[2];
         * var Ygeo = GT[3] + Xpixel*GT[4] + Yline*GT[5];
         */
        geoTransform: number[];
        readonly layers: DatasetLayers;
        readonly rasterSize: Size;

        /**
         * Spatial reference associated with raster dataset.
         */
        srs: SpatialReference;

        /**
         * Builds dataset overviews.
         */
        buildOverviews(resampling: ResamplingType, overviews: number[], bands?: number[]): void;

        /**
         * Closes the dataset to further operations.
         */
        close(): void;

        /**
         * Execute an SQL statement against the data store.
         * @param statement SQL statement to execute.
         * @param spatial_filter Geometry which represents a spatial filter. Default: null
         * @param dialect Allows control of the statement dialect. If set to null, the OGR SQL engine will be used, except for RDBMS drivers 
         * that will use their dedicated SQL engine, unless "OGRSQL" is explicitely passed as the dialect. Starting with OGR 1.10, the 
         * "SQLITE" dialect can also be used. Default: null
         */
        executeSQL(statement: string, spatial_filter?: Geometry, dialect?: string): Layer;

        /**
         * Flushes all changes to disk.
         */
        flush(): void;

        getFileList(): string[];

        getGCPProjection(): string;

        getGCPs(): Object[];

        /**
         * Fetch metadata.
         * @param domain 
         */
        getMetadata(domain?: string): any;

        setGCPs(gcps: Object[], projection: string): void;

        testCapability(capability: string): boolean;
    }

    export class VrtSimpleSource {
        public resampling: SamplingType;
        public readonly isSimpleSource: boolean;
        public readonly type: string;

        constructor();
        constructor(srcSource: VrtSimpleSource, xDstRatio: number, yDstRatio: number);

        public setSrcBand(band: RasterBand): void;
        public setSrcMaskBand(band: RasterBand): void;
        public setSrcWindow(xOff: number, yOff: number, xSize: number, ySize: number): void;
        public setDstWindow(xOff: number, yOff: number, xSize: number, ySize: number): void;
        public setNoDataValue(value: number): void;
        public getMinimum(xSize: number, ySize: number): number;
        public getMaximum(xSize: number, ySize: number): number;
        public computeRasterMinMax(xSize: number, ySize: number, approximate: boolean): MinMax;

        public toString(): string;
        
        public dispose(): void;
    }

    export interface VrtSourcedRasterBand extends RasterBand {
        addSource(source: VrtSimpleSource): void;
        addSimpleSource(srcBand: RasterBand,
            srcXOff: number, srcYOff: number, srcXSize: number, srcYSize: number,
            dstXOff: number, dstYOff: number, dstXSize: number, dstYSize: number,
            resampling: SamplingType, noDataValue: number): void;
        configureSource(source: VrtSimpleSource, srcBand: RasterBand, addAsMaskBand: boolean,
                srcXOff: number, srcYOff: number, srcXSize: number, srcYSize: number,
                dstXOff: number, dstYOff: number, dstXSize: number, dstYSize: number): void;
    }

    export function open(path: string,
        mode?: string,
        drivers?: string[],
        x_size?: number,
        y_size?: number,
        band_count?: number,
        data_type?: number,
        creation_options?: options): Dataset;

    /**
     * The collection of all drivers registered with GDAL.
     */    
    export const drivers: GDALDrivers;


    export var wkb25DBit: number;
    export var wkbGeometryCollection: number;
    export var wkbGeometryCollection25D: number;
    export var wkbLinearRing: number;
    export var wkbLinearRing25D: number;
    export var wkbLineString: number;
    export var wkbLineString25D: number;
    export var wkbMultiLineString: number;
    export var wkbMultiLineString25D: number;
    export var wkbMultiPoint: number;
    export var wkbMultiPoint25D: number;
    export var wkbMultiPolygon: number;
    export var wkbMultiPolygon25D: number;
    export var wkbNone: number;
    export var wkbPoint: number;
    export var wkbPoint25D: number;
    export var wkbPolygon: number;
    export var wkbPolygon25D: number;
    export var wkbUnknown: number;


}

declare module 'gdal' {
    var g: typeof Gdal;
    export = g;
}