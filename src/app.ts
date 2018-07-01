import express from "express";
import compression from "compression";  // compresses requests
// import session from "express-session";
import bodyParser from "body-parser";
// import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import path from "path";
import expressValidator from "express-validator";
import errorHandler from "errorhandler";

import { createServer, Server } from "http";

import { ServiceCatalog } from "./services/service-catalog";
import * as rootController from "./controllers/root.controller";
import * as apiRouter from "./controllers/api.controller";
import * as layerRouter from "./controllers/layer.controller";
import * as wmtsRouter from "./controllers/wmts.controller";
import * as seedRouter from "./controllers/seed.controller";


// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

/**
 * Setup service catalog
 */
const serviceCatalog: ServiceCatalog = new ServiceCatalog(__dirname);

/**
 * Validate the presence of every mandatory config values
 */
if (!serviceCatalog.configService.validateConfiguration()) {
  console.log("Configuration is incorrect. Application cannot run.");
  process.exit(1);
}

// Create Express server
const app = express();
const port: number | string = process.env.PORT || 3000;

const server: Server = createServer(app);
server.listen(port, () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    port,
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

// Express configuration
app.set("port", port);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.use(
  express.static(path.join(__dirname, "public"))
);

/**
 * Error Handler. Provides full stack - remove for production
 */
if (app.get("env") !== "production") {
  app.use(errorHandler());
}

/**
 * Setup CORS
 */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Controllers (route handlers)
rootController.registerRoutes(app, serviceCatalog);
apiRouter.registerRoutes(app, serviceCatalog);
layerRouter.registerRoutes(app, serviceCatalog);
wmtsRouter.registerRoutes(app, serviceCatalog);
seedRouter.registerRoutes(app, serviceCatalog);