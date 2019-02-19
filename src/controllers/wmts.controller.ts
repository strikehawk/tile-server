import fs from "fs-extra";
import express, { Application, Request, Response } from "express";
import { Router } from "express-serve-static-core";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
    app.use("/wmts", _buildRouter(catalog));
};

const _buildRouter = (catalog: ServiceCatalog): Router => {
    const router: Router = express.Router();

    // return the list of SRS of the server
    router.get("/1.0.0/WMTSCapabilities.xml", (req: Request, res: Response) => {
        // TODO: Implement Get capabilities
        res.sendStatus(500);
    });

    /**
     * "http://localhost:3000/wmts/{layer}/default/{TileMatrixSetIdentifier}/{z}/{y}/{x}.{format}"
     */
    router.get("/:layer/:style/:tileMatrixSetIdentifier/:tileMatrixIdentifier/:tileRow/:tileCol.:format", (req: Request, res: Response) => {
        const layer: string = req.params.layer;
        const style: string = req.params.style;
        const tileMatrixSetIdentifier: string = req.params.tileMatrixSetIdentifier;
        const tileMatrixIdentifier: string = req.params.tileMatrixIdentifier;
        const tileRow: number = parseInt(req.params.tileRow);
        const tileCol: number = parseInt(req.params.tileCol);
        const format: string = req.params.format;

        // http://www.maps.bob/etopo2/default/WholeWorld_CRS_84/10m/1/3.png

        if (!layer) {
            res.status(400).send("Layer cannot be empty.");
            return;
        }

        if (!style) {
            res.status(400).send("Style cannot be empty.");
            return;
        }

        if (!tileMatrixSetIdentifier) {
            res.status(400).send("TileMatrixSetIdentifier cannot be empty.");
            return;
        }

        if (!tileMatrixIdentifier) {
            res.status(400).send("TileMatrixIdentifier cannot be empty.");
            return;
        }

        if (typeof tileRow !== "number" || isNaN(tileRow)) {
            res.status(400).send("TileRow must be a number.");
            return;
        }

        if (typeof tileCol !== "number" || isNaN(tileCol)) {
            res.status(400).send("TileCol must be a number.");
            return;
        }

        if (!format) {
            res.status(400).send("Format cannot be empty.");
            return;
        }

        try {
            const tileInfos: tiles.TileInfos = catalog.wmtsService.getTileInfos(layer, style,
                tileMatrixSetIdentifier, tileMatrixIdentifier, tileRow, tileCol, format);

            if (!fs.existsSync(tileInfos.path)) {
                res.sendStatus(404);
                return;
            } else {
                res.download(tileInfos.path);
            }
        } catch (e) {
            res.status(500).send(e);
            return;
        }

    });

    return router;
};