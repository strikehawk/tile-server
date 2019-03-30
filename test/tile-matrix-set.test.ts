import { ServiceCatalog } from "../src/services/service-catalog";
import { TileMatrixSetService } from "../src/services/tile-matrix-set.service";
import { TileMatrixSet } from "../src/ogc/tile-matrix-set";

describe("TileMatrixSet", () => {
    it("can create a regular TMS (Jawg.io)", () => {
        const catalog: ServiceCatalog = new ServiceCatalog(__dirname);
        const tmsSvc: TileMatrixSetService = catalog.tileMatrixSetService;

        const tms: TileMatrixSet = tmsSvc.buildRegularTileMatrixSet("Jawg.io", "urn:ogc:def:crs:EPSG::900913", {
            lowerCorner: [-2.003750834E7, -2.003750834E7],
            upperCorner: [2.0037508E7, 2.0037508E7]
        }, {
                identifier: "0",
                scaleDenominator: 5.590822639508929E8,
                topLeftCorner: [-2.003750834E7, 2.0037508E7],
                tileWidth: 256,
                tileHeight: 256,
                matrixWidth: 1,
                matrixHeight: 1
            }, 20);

        const options: any = tms.serialize();
        expect(options).toBeDefined();
        expect(options.tileMatrix.length).toBe(21);

        // const filePath: string = path.join(__dirname, "..", "config", "tile-matrix-sets", "jawg.io-dump.json");
        // fs.writeJsonSync(filePath, tms.serialize());
    });

    it("can create a regular TMS (EPSG:4326)", () => {
        const catalog: ServiceCatalog = new ServiceCatalog(__dirname);
        const tmsSvc: TileMatrixSetService = catalog.tileMatrixSetService;

        const tms: TileMatrixSet = tmsSvc.buildRegularTileMatrixSet("EPSG:4326", "EPSG:4326", {
            lowerCorner: [-180, -90],
            upperCorner: [180, 90]
        }, {
                identifier: "EPSG:4326:0",
                scaleDenominator: 2.795411320143589E8,
                topLeftCorner: [-180, 90],
                tileWidth: 256,
                tileHeight: 256,
                matrixWidth: 2,
                matrixHeight: 1
            }, 21,
            (identifier: string, zoomLevel: number) => `${identifier}:${zoomLevel}`
        );

        const options: any = tms.serialize();
        expect(options).toBeDefined();
        expect(options.tileMatrix.length).toBe(22);

        // const filePath: string = path.join(__dirname, "..", "config", "tile-matrix-sets", "epsg4326-dump.json");
        // fs.writeJsonSync(filePath, tms.serialize());
    });

    it("can create a regular TMS (EPSG:900913)", () => {
        const catalog: ServiceCatalog = new ServiceCatalog(__dirname);
        const tmsSvc: TileMatrixSetService = catalog.tileMatrixSetService;

        const tms: TileMatrixSet = tmsSvc.buildRegularTileMatrixSet("EPSG:900913", "urn:ogc:def:crs:EPSG::900913", {
            lowerCorner: [-2.003750834E7, -2.003750834E7],
            upperCorner: [2.0037508E7, 2.0037508E7]
        }, {
                identifier: "0",
                scaleDenominator: 5.590822639508929E8,
                topLeftCorner: [-2.003750834E7, 2.0037508E7],
                tileWidth: 256,
                tileHeight: 256,
                matrixWidth: 1,
                matrixHeight: 1
            }, 30,
            (identifier: string, zoomLevel: number) => `${identifier}:${zoomLevel}`);

        const options: any = tms.serialize();
        expect(options).toBeDefined();
        expect(options.tileMatrix.length).toBe(31);

        // const filePath: string = path.join(__dirname, "..", "config", "tile-matrix-sets", "epsg900913-dump.json");
        // fs.writeJsonSync(filePath, tms.serialize());
    });
});