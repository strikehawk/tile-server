import express, { Application, Request, Response } from "express";
import { Router } from "express-serve-static-core";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
    app.use("/seed", _buildRouter(catalog));
};

const _buildRouter = (catalog: ServiceCatalog): Router => {
    const router: Router = express.Router();

    // start seeding according to received options
    router.post("/", (req: Request, res: Response) => {
        try {
            // start seeding
            const task = catalog.seedingService.createNewTask(req.body);
            catalog.tileDownloader.processTask(task);

            res.sendStatus(200);
        } catch (e) {
            res.status(500).send(e);
        }
    });

    // get the number of tiles represented by a given seeding task
    router.post("/tilecount", (req: Request, res: Response) => {
        try {
            res.status(200).send(catalog.seedingService.getTileCount(req.body).toString());
        } catch (e) {
            res.status(500).send(e);
        }
    });

    // get the summary of all running tasks
    router.get("/tasks", (req: Request, res: Response) => {
        try {
            res.json(catalog.seedingService.getTaskSummaries());
        } catch (e) {
            res.status(500).send(e);
        }
    });

    // TODO: Should be moved to layer-controller
    // clear the cache of the specified layer
    router.post("/clear-cache/:layer", (req: Request, res: Response) => {
        const layer: string = req.params.layer;

        if (!layer) {
            res.status(400).send("Layer cannot be empty.");
        }

        try {
            // start clearing the cache
            catalog.layerService.clearLayerCache(layer);

            res.sendStatus(200);
        } catch (e) {
            res.status(500).send(e);
        }
    });

    return router;
};