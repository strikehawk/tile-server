import { Application, Request, Response } from "express";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
  app.get("/", (req: Request, res: Response) => {
    res.render("home", {
      title: "Home",
      screen: "home",
      options: catalog.configService.options,
      layers: catalog.layerService.getLayers().map(o => o.serialize()),
      tileMatrixSets: catalog.tileMatrixSetService.getTileMatrixSets().map(o => o.serialize()),
      mimeTypes: catalog.mimeTypeService.getMimeTypes()
    });
  });
};