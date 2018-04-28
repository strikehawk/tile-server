declare namespace wmts {
    interface BoundingBox {
        lowerCorner: tiles.GeoLocation,
        upperCorner: tiles.GeoLocation

        /**
         * If not specified, the projection of the TileMatrixSet is assumed.
         */
        crs?: string;
    }

    interface TileMatrix {
        identifier: string;
        title?: string[];
        abstract?: string[];
        keywords?: string[];
        scaleDenominator: number;
        topLeftCorner: tiles.GeoLocation;
        tileWidth: number;
        tileHeight: number;
        matrixWidth: number;
        matrixHeight: number;
    }

    interface TileMatrixSet {
        identifier: string;
        title?: string[];
        abstract?: string[];
        keywords?: string[];
        boundingBox: BoundingBox;
        supportedCRS: string;
        wellKnownScaleSet?: string;
        tileMatrix: TileMatrix[];
    }

    interface TileMatrixLimits {
        tileMatrix: string;
        minTileRow: number;
        maxTileRow: number;
        minTileCol: number;
        maxTileCol: number;
    }

    interface TileMatrixSetLimits {
        tileMatrixLimits: TileMatrixLimits[];
    }

    /**
     * A location inside a TileMatrix, expressed in "tile" units, in the form [x, y].
     */
    export type TileCoordinates = [number, number];

    interface LegendUrl {
        format: string;
        minScaleDenominator: number;
        maxScaleDenominator: number;
        href: string;
        width: number;
        height: number;
    }
    
    interface TileMatrixSetLink {
        tileMatrixSet: string;
        limits: TileMatrixSetLimits;
    }

    interface Dimension {
        identifier: string;
        title?: string[];
        abstract?: string[];
        keywords?: string[];
        uom?: string;
        unitSymbol: string;
        default: string;
        current: boolean;
        value: string[];
    }

    interface Metadata {
        // TODO: Implement Metadata
    }

    interface Style {
        identifier: string;
        title?: string[];
        abstract?: string[];
        keywords?: string[];
        legendUrl?: LegendUrl[];
        isDefault?: boolean;
    }

    interface ResourceUrl {
        format: string;
        resourceType: string;
        template: string;
    }

    interface Layer {
        identifier: string;
        title?: string[];
        abstract?: string[];
        keywords?: string[];
        wgs84BoundingBox?: BoundingBox;
        boundingBox?: BoundingBox[];
        style: Style[];
        format: string[];
        infoFormat?: string[];
        dimension?: Dimension[];
        metadata?: Metadata[];
        tileMatrixSetLink: TileMatrixSetLink[];
        resourceUrl?: ResourceUrl[];
    }
}