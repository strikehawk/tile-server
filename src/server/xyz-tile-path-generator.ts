import path from "path";

import { sanitizePath } from "../util/file-names";
import { TilePathGenerator } from "./file-path-generator";
import { TileObject } from "./tile-object";

export class XyzTilePathGenerator implements TilePathGenerator {
    /**
     * @inheritDoc
     */
    public getTilePath(layerPath: string, tile: TileObject): string {
        if (!layerPath) {
            throw new Error("Layer path cannot be empty.");
        }

        if (!tile) {
            throw new Error("Tile cannot be null.");
        }

        const tilePath: string = path.join(tile.style, tile.gridSetId, tile.xyz[2].toString(),
            `${tile.xyz[0].toString()}-${tile.xyz[1].toString()}.${tile.mimeType.fileExtension}`);

        return path.join(layerPath, sanitizePath(tilePath));
    }
}