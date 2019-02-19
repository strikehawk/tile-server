import { TileMatrixSet } from "../ogc/tile-matrix-set";
import { TileMatrix } from "../ogc/tile-matrix";

export class TileObject {
    public readonly layerName: string;
    public readonly style: string;
    public readonly xyz: number[];
    public readonly gridSetId: string;
    public mimeType: tiles.MimeType;
    public parametersId: string;
    public readonly parameters: Map<string, string>;
    public tileMatrixSet: TileMatrixSet;
    public tileMatrix: TileMatrix;

    constructor(layerName: string, style: string, gridSetId: string, mimeType: tiles.MimeType, xyz: [number, number, number], parameters?: Map<string, string>) {
        this.layerName = layerName;
        this.mimeType = mimeType;
        this.xyz = xyz;
        this.style = style;
        this.gridSetId = gridSetId;
        this.parameters = parameters != null ? parameters : new Map<string, string>();
    }

    public toString(): string {
        return `[${this.layerName},${this.gridSetId},{${this.xyz.toString()}}]`;
    }
}