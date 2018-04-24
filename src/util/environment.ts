import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MAPS_PATH = path.join(__dirname, "../..", process.env["MAPS_PATH"]);
export const PLATOONS_PATH = path.join(__dirname, "../..", process.env["PLATOONS_PATH"]);

if (!MAPS_PATH) {
    logger.error("No Maps path. Set MAPS_PATH environment variable.");
    process.exit(1);
}

if (!PLATOONS_PATH) {
    logger.error("No Platoons path. Set PLATOONS_PATH environment variable.");
    process.exit(1);
}