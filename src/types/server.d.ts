declare namespace tiles {
    interface MimeType {
        internalName: string;
        type: string;
        fileExtension: string;
    }

    interface ServerOptions {
        /// <summary>
        /// The root directory of the cache
        /// </summary>
        cacheRoot: string

        /// <summary>
        /// The directory containing the Map Sources definition files (JSON)
        /// </summary>
        mapSourcesPath: string;

        /// <summary>
        /// The directory containing the Gridset definition files (XML)
        /// </summary>
        tileMatrixSetsPath: string;

        /// <summary>
        /// The directory containing the Layer definition files (JSON)
        /// </summary>
        layersPath: string;

        /// <summary>
        /// The key for Bing Maps APIs
        /// </summary>
        bingMapsKey: string;

        mimeTypes: MimeType[];
    }

    export type FilePathScheme = "xyz" | "geowebcache";

    
    interface WmtsLayerCacheCreationRequest {
        /**
         * The unique identifier of the cache.
         */
        identifier: string;

        /**
         * The friendly name of the layer cache.
         */
        label: string;

        /**
         * A short description of the data contained in the cache.
         */
        description?: string;

        /**
         * The identifier of the TileMatrixSet used by the cache.
         */
        tileMatrixSet: string;

        /**
         * The style used by the cache.
         */
        style: string;

        /**
         * The mime-type used by the tiles of the cache.
         */
        format: string;
    }

    interface WmtsLayerCacheOptions extends WmtsLayerCacheCreationRequest {
        /**
         * A restriction on the area covered by the cache.
         */
        tileMatrixSetLimits: wmts.TileMatrixSetLimits;
    }

    interface WmtsLayerDefinitionOptions {
        /**
         * The unique identifier of the Layer definition.
         */
        identifier: string;

        /**
         * The friendly name of the layer definition.
         */
        label: string;

        /**
         * A short description of the layer.
         */
        description?: string;

        /**
         * The file system organization used to store the tiles of the layer.
         */
        filePathScheme: FilePathScheme;

        /**
         * The caches defined for the layer.
         */
        caches: WmtsLayerCacheOptions[];
    }

    interface WmtsLayerDefinitionCreationRequest {
        /**
         * The unique identifier of the Layer definition.
         */
        identifier: string;

        /**
         * The friendly name of the layer definition.
         * @default The identifier of the layer.
         */
        label?: string;

        /**
         * A short description of the layer.
         * @default The description of the map source.
         */
        description?: string;

        /**
         * The identifier of the map source to use.
         */
        mapSource: string;

        /**
         * The extent covered by the layer, in EPSG:4326, using [minx, miny, maxx, maxy] order.
         * @default The extent of the map source.
         */
        wgs84Extent?: tiles.Extent;

        /**
         * The file system organization used to store the tiles of the layer.
         */
        filePathScheme: FilePathScheme;

        /**
         * The defintion of the caches to build.
         */
        caches: WmtsLayerCacheCreationRequest[];
    }

    interface MapSource {
        /**
         * The unique identifier of the map source.
         */
        identifier: string;

        /**
         * The friendly name of the map source.
         */
        label: string;

        /**
         * The type of MapSource: "Wms", "Wmts", "Bing", etc...
         */
        type: string;

        /**
         * The extent covered by the map source, in EPSG:4326, using [minx, miny, maxx, maxy] order.
         */
        wgs84Extent: tiles.Extent;
    }

    interface WmsMapSource extends MapSource {
        type: "WMS";

        /**
         * The URL of the WMS service.
         */
        url: string;

        /**
         * The version of the WMS standard to use when communicating with the service.
         */
        version: string;

        /**
         * The list of layer identifiers to request, as a comma-separated string.
         */
        layers: string;

        /**
         * The identifier of the style to use for each requested layer, as a comma-separated string. Style identifier may be empty to use default style, but there must be the same number of style identifiers and layer identifiers. If styles is empty, default style is assumed for every layer.
         */
        styles: string;

        /**
         * Additional parameters for the request. This may include dimensions.
         */
        additionalParameters: string;

        /**
         * The mime-types supported by the WMS service.
         */
        supportedFormats: string[];
    }

    interface WmtsMapSource extends MapSource {
        type: "WMTS";

        /**
         * The URL pattern used by the WMTS source, ex: "http://www.maps.bob/etopo2/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png".
         */
        urlPattern: string;

        /**
         * The TileMatrixSet (or 'GridSet') used by the source.
         */
        tileMatrixSet: string;

        /**
         * The list of supported {TileMatrix}. Allows to restrict the source to specific zoom level for instance.
         */
        supportedTiledMatrix: string[];

        /**
         * The list of supported {ZoomLevel}. Allows to restrict the source to specific zoom level for instance.
         */
        supportedZoomLevels: number[];

        /**
         * The mime-type of the WMTS service.
         */
        format: string;
    }

    interface BingMapSource extends MapSource {
        type: "Bing";
        urlPattern: string;
        imageryType: string;
        format: string;
    }

    interface TileInfos {
        path: string;
        mimeType: MimeType;
    }

    interface SeedRequest {
        /**
         * The unique identifier of the layer definition to seed.
         */
        layerDefinition: string;

        /**
         * The identifier of the cache to seed.
         */
        cacheIdentifier: string;

        /**
         * The unique identifier of the map source to use to acquire the tiles.
         */
        mapSource: string;

        /**
         * The extent of the tile cache. Must be a subset of the TileMatrixSet coverage.
         */
        extent: tiles.Extent;

        /**
         * The zoom level to begin seeding at.
         * @default 0
         */
        startZoom?: number;

        /**
         * The zoom level to end seeding at.
         * @default Maximum zoom level of the map source
         */
        endZoom?: number;
    }

    interface SeedTaskDescription {
        /**
         * The number of tiles to seed. Computed from the specified TileMatrixSet and potential limits.
         */
        tileCount: number;

        /**
         * The estimated size of the cache in bytes. An average of tile size is used.
         */
        estimatedSize?: number;

        /**
         * The estimated size of the cache in bytes. The most optimistic tile size is used.
         */
        lowEstimatedSize?: number;

        /**
         * The estimated size of the cache in bytes. The most pessimistic tile size is used.
         */
        highEstimatedSize?: number;
    }
}