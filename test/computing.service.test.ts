import { ComputingService } from "../src/services/computing.service";

describe("ComputingService", () => {
    it("can convert a WGS84 extent", () => {
        const svc: ComputingService = new ComputingService();

        const wgs84Extent: [number, number, number, number] = [-99.27, 19.31, -98.97, 19.53];
        const result: [number, number, number, number] = svc.convertWgs84Extent(wgs84Extent, "EPSG:3857");

        expect(result).toBeDefined();
        expect(typeof result[0]).toBe("number");
        expect(typeof result[1]).toBe("number");
        expect(typeof result[2]).toBe("number");
        expect(typeof result[3]).toBe("number");
    });
});