import * as Gdal from "gdal";
import * as _ from "lodash";

export interface MatrixOptions {
    /**
     * The path to the source dataset.
     */
    sourcePath: string;

    /**
     * The bounding box to extract from the source dataset, in the form [minx, miny, maxx, maxy].
     */
    bbox: [number, number, number, number];

    /**
     * The projection in which the bbox is expressed.
     */
    bboxSrs: string;

    /**
     * The driver to use to produce the extract.
     */
    targetDriver: string;

    /**
     * The target projection, for the extract of the dataset.
     */
    targetSrs: string;

    /**
     * The size of the extract, in pixels.
     */
    targetSize: Gdal.Size;

    /**
     * The maximum size of the output extract. An error is thrown if the requested area exceeds this limit.
     */
    maxOutputSize?: number;
}

export class GdalService {

    constructor(private _options?: tiles.ServerOptions) {

    }

    public extractMatrix(options: MatrixOptions): void {
        GdalService._validateOptions(options);

        const gdalBbox: Gdal.BoundingBox = GdalService._convertToGdalBbox(options.bbox);

        let bboxSrs: Gdal.SpatialReference;
        try {
            bboxSrs = Gdal.SpatialReference.fromUserInput(options.bboxSrs);
        } catch (err) {
            throw new Error(`Unsupported bbox SRS '${options.bboxSrs}'.`);
        }

        let tgtSrs: Gdal.SpatialReference;
        try {
            tgtSrs = Gdal.SpatialReference.fromUserInput(options.targetSrs);
        } catch (err) {
            throw new Error(`Unsupported target SRS '${options.targetSrs}'.`);
        }

        const ds: Gdal.Dataset = Gdal.open(options.sourcePath);

        const bandCount: number = ds.bands.count();
        if (ds.bands.count() === 0) {
            throw new Error("Input file has no bands, and so cannot be translated.");
        }
        const bands: Gdal.RasterBand[] = ds.bands.map(o => o);

        // convert bbox into pixel coordinates
        const srcWindow: Gdal.PixelWindow = GdalService._getPixelWindow(gdalBbox, bboxSrs, ds);
        GdalService._adjustWindowNearSampling(srcWindow); // assume NEAR resampling is used
        GdalService._checkPixelWindowSize(srcWindow, ds.rasterSize);

        const outputDriver: Gdal.Driver = GdalService._findOutputDriver(options.targetDriver);

        const nOXSize: number = options.targetSize.x;
        const nOYSize: number = options.targetSize.y;

        // check that output size is below limit
        if (typeof options.maxOutputSize === "number") {
            const dataType: Gdal.GDT = ds.bands.get(1).dataType;
            const rawOutputSize: number = nOXSize * nOYSize * bandCount * GdalService._getDataTypeSizeBytes(dataType);

            if (rawOutputSize > options.maxOutputSize) {
                throw new Error(`Attempt to create ${nOXSize}x${nOYSize} dataset is above authorized limit.`);
            }
        }

        // Create a virtual dataset.
        const vrt: Gdal.Dataset = GdalService._createVirtualDataset("clone", nOXSize, nOYSize, ds, srcWindow, bands);

        // Write to the output file using CopyCreate().
        const outputDs: Gdal.Dataset = outputDriver.createCopy("C:\\Projects\\temp.jpg", vrt);

        ds.close();
    }

    private static _validateOptions(options: MatrixOptions): void {
        if (!options) {
            throw new Error("Options cannot be null.");
        }

        if (!options.sourcePath) {
            throw new Error("Source path cannot be empty.");
        }

        if (!options.bbox) {
            throw new Error("Source bbox cannot be null.");
        }

        GdalService._validateBbox(options.bbox);

        if (!options.bboxSrs) {
            throw new Error("Source bbox SRS cannot be empty.");
        }

        if (!options.targetDriver) {
            throw new Error("Target driver name cannot be empty.");
        }

        if (!options.targetSrs) {
            throw new Error("Target SRS cannot be empty.");
        }

        if (!options.targetSize) {
            throw new Error("Target size cannot be null.");
        }

        GdalService._validateRasterSize(options.targetSize);

        if (typeof options.maxOutputSize === "number") {
            if (options.maxOutputSize <= 0) {
                throw new Error("Output size limit must be a positive number.");
            }
        }
    }

    private static _validateBbox(bbox: [number, number, number, number]): void {
        if (bbox.length !== 4) {
            throw new Error("Bbox must contain 4 numbers.");
        }

        if (typeof bbox[0] !== "number" ||
            typeof bbox[1] !== "number" ||
            typeof bbox[2] !== "number" ||
            typeof bbox[3] !== "number") {
            throw new Error("Bbox must contain 4 numbers.");
        }

        if (bbox[0] > bbox[2] || bbox[1] > bbox[3]) {
            throw new Error("Invalid bbox. It must be in the form [minx, miny, maxx, maxy].");
        }
    }

    private static _validateRasterSize(size: Gdal.Size): void {
        if (typeof size.x !== "number" ||
            typeof size.y !== "number") {
            throw new Error("Size x and y properties must be numbers.");
        }

        if (size.x < 1 || size.y < 1) {
            throw new Error("Size x and y properties must be at least equal to 1 pixel.");
        }
    }

    private static _convertToGdalBbox(bbox: [number, number, number, number]): Gdal.BoundingBox {
        return [bbox[0], bbox[3], bbox[2], bbox[1]];
    }

    private static _checkGeoTransform(geoTransform: number[]): void {
        if (geoTransform.length !== 6) {
            throw new Error("GeoTransform must contain 6 numbers.");
        }

        if (geoTransform[1] === 0 || geoTransform[5] === 0) {
            throw new Error("The -projwin option was used, but the geotransform is invalid.");
        }

        if (geoTransform[2] !== 0 || geoTransform[4] !== 0) {
            throw new Error("The -projwin option was used, but the geotransform is rotated.  This configuration is not supported.");
        }
    }

    private static _getPixelWindow(
        bbox: Gdal.BoundingBox,
        bboxSrs: Gdal.SpatialReference,
        ds: Gdal.Dataset): Gdal.PixelWindow {
        GdalService._checkGeoTransform(ds.geoTransform);

        const coordTransform: Gdal.CoordinateTransformation = new Gdal.CoordinateTransformation(bboxSrs, ds);
        const ul: Gdal.GeoLocation = coordTransform.transformPoint(bbox[0], bbox[1]);
        const lr: Gdal.GeoLocation = coordTransform.transformPoint(bbox[2], bbox[3]);

        const window: Gdal.BoundingBox = [ul.x, ul.y, lr.x, lr.y];

        // TODO: Check this!
        // window[0] = (ul.x - ds.geoTransform[0]) / ds.geoTransform[1];
        // window[1] = (ul.y - ds.geoTransform[3]) / ds.geoTransform[5];

        // window[2] = (lr.x - ul.x) / ds.geoTransform[1];
        // window[3] = (lr.y - ul.y) / ds.geoTransform[5];

        return window;
    }

    private static _adjustWindowNearSampling(window: Gdal.PixelWindow): void {
        // In case of nearest resampling, round to integer pixels (#6610)
        window[0] = Math.floor(window[0] + 0.001);
        window[1] = Math.floor(window[1] + 0.001);
        window[2] = Math.floor(window[2] + 0.5);
        window[3] = Math.floor(window[3] + 0.5);
    }

    private static _checkPixelWindowSize(bbox: Gdal.PixelWindow, size: Gdal.Size): void {
        if (bbox[2] <= 0 || bbox[3] <= 0) {
            throw new Error(`Computed window ${bbox[0]} ${bbox[1]} ${bbox[2]} ${bbox[3]} has negative width and/or height.`);
        }

        if (bbox[0] <= -1 || bbox[1] <= -1
            || bbox[0] + bbox[2] >= size.x + 1
            || bbox[1] + bbox[3] >= size.y + 1) {
            const completelyOutside: boolean =
                bbox[0] + bbox[2] <= 0 ||
                bbox[1] + bbox[3] <= 0 ||
                bbox[0] >= size.x ||
                bbox[1] >= size.y;
        }
    }

    private static _findOutputDriver(driverName: string): Gdal.Driver {
        if (!driverName) {
            throw new Error("Driver name cannot be empty.");
        }

        const driver: Gdal.Driver = Gdal.drivers.get(driverName);
        if (!driver) {
            throw new Error(`Output driver '${driverName}' not recognised.`);
        }

        const metaData: any = driver.getMetadata();
        if (metaData.DCAP_RASTER !== "YES") {
            throw new Error(`'${driverName}' driver has no raster capabilities.`);
        }

        if (metaData.DCAP_CREATE !== "YES" && metaData.DCAP_CREATECOPY !== "YES") {
            throw new Error(`'${driverName}' driver has no creation capabilities.`);
        }

        return driver;
    }

    private static _getDataTypeSizeBytes(dataType: Gdal.GDT): number {
        let size: number = 1;

        switch (dataType) {
            case "Byte":
                size = 1;
                break;
            case "CFloat32":
                size = 4;
                break;
            case "CFloat64":
                size = 8;
                break;
            case "CInt16":
                size = 2;
                break;
            case "CInt32":
                size = 4;
                break;
            case "Float32":
                size = 4;
                break;
            case "Float64":
                size = 8;
                break;
            case "Int16":
                size = 2;
                break;
            case "Int32":
                size = 4;
                break;
            case "UInt16":
                size = 2;
                break;
            case "UInt32":
                size = 4;
                break;
            case "Unknown":
                size = 1;
                break;
            default:
                throw new Error(`Unknown data type '${dataType}'.`);
        }

        return size;
    }

    private static _createVirtualDataset(
        name: string, x_size: number, y_size: number,
        srcDs: Gdal.Dataset, srcWindow: Gdal.PixelWindow,
        bands: Gdal.RasterBand[]): Gdal.Dataset {
        // Make a virtual clone.
        const driver: Gdal.Driver = Gdal.drivers.get("VRT");
        const vrt: Gdal.Dataset = driver.create(name, x_size, y_size);

        vrt.srs = srcDs.srs;

        // To make the VRT to look less awkward (but this is optional in fact), avoid negative values.
        const dstWindow: Gdal.PixelWindow = [0, 0, x_size, y_size];
        const srcWindowOrig: Gdal.PixelWindow = <Gdal.PixelWindow>srcWindow.slice();
        GdalService._fixSrcDstWindow(srcWindow, dstWindow, x_size, y_size);

        // Transfer generally applicable metadata.
        // TODO: No setMetadata() method. It is thus impossible to set properties on clone
        // const srcMetadata: any = srcDs.getMetadata();
        // const metaData: any = ds.getMetadata();

        // const propNames: Set<string> = new Set<string>();
        // for (const prop in srcMetadata) {
        //     propNames.add(prop);
        // }

        // if (srcWindow[0] === 0 && srcWindow[1] === 0 &&
        //     srcWindow[2] === x_size && srcWindow[3] === y_size) {
        //     for (const prop of propNames.keys()) {
        //         if (prop.startsWith("NITF_BLOCKA_")) {
        //             propNames.delete(prop);
        //         }
        //     }
        // }

        // for (const prop of propNames.keys()) {
        //     metaData[prop] = srcMetadata[prop];
        // }

        // Process all bands.
        GdalService._processBands(vrt, bands, srcWindow, dstWindow);

        // Compute stats if required.

        return vrt;
    }

    private static _fixSrcDstWindow(srcWindow: Gdal.PixelWindow, dstWindow: Gdal.PixelWindow, x_size: number, y_size: number): boolean {
        const srcXOff: number = srcWindow[0];
        const srcYOff: number = srcWindow[1];
        const srcXSize: number = srcWindow[2];
        const srcYSize: number = srcWindow[3];

        const dstXOff: number = dstWindow[0];
        const dstYOff: number = dstWindow[1];
        const dstXSize: number = dstWindow[2];
        const dstYSize: number = dstWindow[3];

        let modifiedX: boolean = false;
        let modifiedY: boolean = false;

        let modifiedSrcXOff: number = srcXOff;
        let modifiedSrcYOff: number = srcYOff;
        let modifiedSrcXSize: number = srcXSize;
        let modifiedSrcYSize: number = srcYSize;

        // Clamp within the bounds of the available source data.
        if (modifiedSrcXOff < 0) {
            modifiedSrcXSize += modifiedSrcXOff;
            modifiedSrcXOff = 0;
            modifiedX = true;
        }

        if (modifiedSrcYOff < 0) {
            modifiedSrcYSize += modifiedSrcYOff;
            modifiedSrcYOff = 0;
            modifiedY = true;
        }

        if (modifiedSrcXOff + modifiedSrcXSize > x_size) {
            modifiedSrcXSize = x_size - modifiedSrcXOff;
            modifiedX = true;
        }

        if (modifiedSrcYOff + modifiedSrcYSize > y_size) {
            modifiedSrcYSize = y_size - modifiedSrcYOff;
            modifiedY = true;
        }

        // Don't do anything if the requesting region is completely off the source image.
        if (modifiedSrcXOff >= x_size
            || modifiedSrcYOff >= y_size
            || modifiedSrcXSize <= 0 || modifiedSrcYSize <= 0) {
            return false;
        }

        srcWindow[0] = modifiedSrcXOff;
        srcWindow[1] = modifiedSrcYOff;
        srcWindow[2] = modifiedSrcXSize;
        srcWindow[3] = modifiedSrcYSize;

        // If we haven't had to modify the source rectangle, then the destination rectangle must be the whole region.
        if (!modifiedX && !modifiedY) {
            return true;
        }

        // Now transform this possibly reduced request back into the destination buffer coordinates in case the output region is less than
        // the whole buffer.
        const ul: Gdal.GeoLocation = GdalService._srcToDst(
            modifiedSrcXOff, modifiedSrcYOff,
            srcXOff, srcYOff,
            srcXSize, srcYSize,
            dstXOff, dstYOff,
            dstXSize, dstYSize);
        const dstULX: number = ul.x;
        const dstULY: number = ul.y;

        const lr: Gdal.GeoLocation = GdalService._srcToDst(
            modifiedSrcXOff + modifiedSrcXSize, modifiedSrcYOff + modifiedSrcYSize,
            srcXOff, srcYOff,
            srcXSize, srcYSize,
            dstXOff, dstYOff,
            dstXSize, dstYSize);
        const dstLRX: number = lr.x;
        const dstLRY: number = lr.y;

        let modifiedDstXOff: number = dstXOff;
        let modifiedDstYOff: number = dstYOff;
        let modifiedDstXSize: number = dstXSize;
        let modifiedDstYSize: number = dstYSize;

        if (modifiedX) {
            modifiedDstXOff = dstULX - dstXOff;
            modifiedDstXSize = (dstLRX - dstXOff) - modifiedDstXOff;

            modifiedDstXOff = Math.max(0, modifiedDstXOff);
            if (modifiedDstXOff + modifiedDstXSize > dstXSize) {
                modifiedDstXSize = dstXSize - modifiedDstXOff;
            }
        }

        if (modifiedY) {
            modifiedDstYOff = dstULY - dstYOff;
            modifiedDstYSize = (dstLRY - dstYOff) - modifiedDstYOff;

            modifiedDstYOff = Math.max(0, modifiedDstYOff);
            if (modifiedDstYOff + modifiedDstYSize > dstYSize) {
                modifiedDstYSize = dstYSize - modifiedDstYOff;
            }
        }

        if (modifiedDstXSize <= 0 || modifiedDstYSize <= 0) {
            return false;
        }

        dstWindow[0] = modifiedDstXOff;
        dstWindow[1] = modifiedDstYOff;
        dstWindow[2] = modifiedDstXSize;
        dstWindow[3] = modifiedDstYSize;

        return true;
    }

    private static _srcToDst(x: number, y: number,
        srcXOff: number, srcYOff: number,
        srcXSize: number, srcYSize: number,
        dstXOff: number, dstYOff: number,
        dstXSize: number, dstYSize: number): Gdal.GeoLocation {
        return {
            x: ((x - srcXOff) / srcXSize) * dstXSize + dstXOff,
            y: ((y - srcYOff) / srcYSize) * dstYSize + dstYOff
        };
    }

    private static _processBands(vrt: Gdal.Dataset, bands: Gdal.RasterBand[],
        srcWindow: Gdal.PixelWindow, dstWindow: Gdal.PixelWindow): void {
        let dataType: Gdal.GDT;
        let vrtBand: Gdal.VrtSourcedRasterBand;
        let simpleSource: Gdal.VrtSimpleSource;

        for (const band of bands) {
            // Select output data type to match source.
            dataType = band.dataType;

            // Create this band.
            vrtBand = <Gdal.VrtSourcedRasterBand>vrt.bands.create(dataType);

            // TODO: TLR: Skipped Metadata related things

            // Do we need to collect scaling information?

            // Create a simple or complex data source depending on the translation type required.
            simpleSource = new Gdal.VrtSimpleSource();
            simpleSource.resampling = "BILINEAR"; // TODO: supply parameter
            vrtBand.configureSource(simpleSource, band, false,
                srcWindow[0], srcWindow[1], srcWindow[2], srcWindow[3],
                dstWindow[0], dstWindow[1], dstWindow[2], dstWindow[3]);
            vrtBand.addSource(simpleSource);

            /**
             * In case of color table translate, we only set the color interpretation other info copied by CopyBandInfo are not relevant
             * in RGB expansion.
             */

            // Copy over some other information of interest.
            // TODO: TLR - Implement

            // Set a forcible nodata value?
        }
    }
}