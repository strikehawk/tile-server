import fs from "fs-extra";
import path from "path";

import logger from "../util/logger";

export class ConfigurationService {
    public readonly options: tiles.ServerOptions;

    constructor(rootPath: string) {
        const optionsPath: string = path.join(rootPath, "../config/server-options.json");

        if (!fs.existsSync(optionsPath)) {
            logger.error("Could not find 'server-options.json' config file.");
        }

        // read file
        this.options = fs.readJsonSync(optionsPath);
    }
}