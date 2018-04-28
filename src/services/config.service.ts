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

    /**
     * Check that every required values are defined, and, if they are folder paths, check that the path exists.
     * @returns true if the configuration is valid; false otherwise. Errors are emitted to the console.
     */
    public validateConfiguration(): boolean {
        let isValid: boolean = true;

        // cache root
        if (!this.options.cacheRoot) {
            logger.error("Cache folder is not defined.");
            isValid = false;
        }

        if (!fs.existsSync(this.options.cacheRoot)) {
            logger.error(`Specified Cache folder '${this.options.cacheRoot}' does not exist.`);
            isValid = false;
        }

        // map sources folder
        if (!this.options.mapSourcesPath) {
            logger.error("Map sources folder is not defined.");
            isValid = false;
        }

        if (!fs.existsSync(this.options.mapSourcesPath)) {
            logger.error(`Specified Map sources folder '${this.options.mapSourcesPath}' does not exist.`);
            isValid = false;
        }

        // TileMatrixSets folder
        if (!this.options.tileMatrixSetsPath) {
            logger.error("TileMatrixSets folder is not defined.");
            isValid = false;
        }

        if (!fs.existsSync(this.options.tileMatrixSetsPath)) {
            logger.error(`Specified TileMatrixSets folder '${this.options.tileMatrixSetsPath}' does not exist.`);
            isValid = false;
        }

        // layers folder
        if (!this.options.layersPath) {
            logger.error("Layers folder is not defined.");
            isValid = false;
        }

        if (!fs.existsSync(this.options.layersPath)) {
            logger.error(`Specified layers folder '${this.options.layersPath}' does not exist.`);
            isValid = false;
        }

        return isValid;
    }
}