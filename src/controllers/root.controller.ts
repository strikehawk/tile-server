import { Application, Request, Response } from "express";

import { ServiceCatalog } from "../services/service-catalog";

export let registerRoutes = (app: Application, catalog: ServiceCatalog) => {
    app.get("/", (req: Request, res: Response) => {
      res.render("home", {
        title: "Home",
        screen: "home"
      });
    });
};