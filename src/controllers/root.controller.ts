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

  app.get("/layers", (req: Request, res: Response) => {
    const baseUrl: string = req.protocol + "://" + req.get("host");

    res.render("layers", {
      title: "Layers",
      screen: "layers",
      tileMatrixSets: catalog.tileMatrixSetService.getTileMatrixSets().map(o => o.serialize()),
      layers: catalog.layerService.getLayers().map(o => {
        return {
          identifier: o.identifier,
          label: o.label,
          description: o.description,
          caches: o.getWmtsLayers(baseUrl)
        };
      })
    });
  });
};