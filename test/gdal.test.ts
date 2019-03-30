import { GdalService, MatrixOptions } from "../src/services/gdal.service";

describe("GdalService", () => {
    it("can extract an elevation matrix", () => {
        const options: MatrixOptions = {
            sourcePath: "C:\\Geo\\Oman\\Sources\\ASTGTM2_N23E057_dem.tif",
            bbox: [57.14, 23.34, 57.82, 23.97],
            bboxSrs: "EPSG:4326",
            targetDriver: "GTiff",
            targetSrs: "EPSG:3857",
            targetSize: {x: 500, y: 300}
        };

        const svc: GdalService = new GdalService();

        svc.extractMatrix(options);
    });
});