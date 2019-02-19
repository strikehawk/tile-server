import express, { Application, Request, Response } from "express";
import { Router } from "express-serve-static-core";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
    app.use("/api", _buildRouter(catalog));
};

const _buildRouter = (catalog: ServiceCatalog): Router => {
    const router: Router = express.Router();

    // return the list of SRS of the server
    router.get("/srs", (req: Request, res: Response) => {
        res.json(catalog.srsService.getSrsList());
    });

    // return the list of TileMatrixSets supported by the server
    router.get("/tilematrixsets", (req: Request, res: Response) => {
        res.json(catalog.tileMatrixSetService.getTileMatrixSets().map(o => o.serialize()));
    });

    // return the list of map sources available to the server
    router.get("/sources", (req: Request, res: Response) => {
        res.json(catalog.mapSourceService.getSources());
    });

    // return the list of layers exposed by the server
    router.get("/layers", (req: Request, res: Response) => {
        res.json(catalog.layerService.getLayers().map(o => o.serialize()));
    });

    return router;
};