import express, { Application, Request, Response } from "express";
import { Router } from "express-serve-static-core";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
    app.use("/layers", _buildRouter(catalog));
};

const _buildRouter = (catalog: ServiceCatalog): Router => {
    const router: Router = express.Router();

    // return the list of SRS of the server
    router.get("/", (req: Request, res: Response) => {
        res.render("layers", {
            title: "Layers",
            screen: "layers"
        });
    });

    // create a new WmtsLayerDefinition
    router.post("/create", (req: Request, res: Response) => {
        try {
            catalog.layerService.createLayer(req.body);

            res.sendStatus(200);
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
};