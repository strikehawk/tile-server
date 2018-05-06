interface LayerInfos {
    identifier: string;
    label: string;
    description: string;
    caches: wmts.Layer[];
}

declare var layers: LayerInfos[];
declare var tileMatrixSets: wmts.TileMatrixSet[];

let map: ol.Map;
let group: ol.layer.Group;

let _mapTMS: Map<string, wmts.TileMatrixSet>;

function loadLayer(layerIdx: number, cacheIdx: number) {
    // clear the layer group
    group.getLayers().clear();

    const infos: LayerInfos = layers[layerIdx];
    const cache: wmts.Layer = infos.caches[cacheIdx];
    const tmsId: string = cache.tileMatrixSetLink[0].tileMatrixSet;
    const tms: wmts.TileMatrixSet = _mapTMS.get(tmsId);
    const limits: wmts.TileMatrixSetLimits = cache.tileMatrixSetLink[0].limits;
    const projection: ol.proj.Projection = ol.proj.get(tms.supportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/, "$1:$3")) ||
        ol.proj.get(tms.supportedCRS);
    const tileGrid: ol.tilegrid.WMTS = getTileGrid(tms, projection, limits);

    const source: ol.source.WMTS = new ol.source.WMTS({
        url: cache.resourceUrl[0].template,
        requestEncoding: "REST",
        layer: infos.identifier,
        style: cache.style[0].identifier,
        matrixSet: tms.identifier,
        tileGrid: tileGrid,
        projection: tms.supportedCRS
    });

    const layer: ol.layer.Tile = new ol.layer.Tile({
        source: source
    });

    // add the layer to the map
    group.getLayers().push(layer);

    // animate the map to go to the center of the extent, at the minimum level
    const minZoom: number = cache.metadata && cache.metadata.length > 0 && cache.metadata[0].minZoom;
    goToLayer(tms, projection, limits, minZoom);
}

function getTileGrid(tms: wmts.TileMatrixSet, projection: ol.proj.Projection, limits?: wmts.TileMatrixSetLimits): ol.tilegrid.WMTS {
    const projectionExtent = projection.getExtent();
    const size: number = ol.extent.getWidth(projectionExtent) / 256;
    const resolutions: number[] = [];
    const matrixIds: string[] = [];

    for (let z: number = 0; z < tms.tileMatrix.length; ++z) {
        // generate resolutions and matrixIds arrays for this WMTS
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = tms.tileMatrix[z].identifier;
    }

    return new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
    });
}

function getTileMatrixSetExtent(tms: wmts.TileMatrixSet, projection: ol.proj.Projection, limits?: wmts.TileMatrixSetLimits): ol.Extent {
    if (!limits) {
        return projection.getExtent();
    }

    const matrixLimits: wmts.TileMatrixLimits = limits.tileMatrixLimits[limits.tileMatrixLimits.length - 1];
    const matrix: wmts.TileMatrix = tms.tileMatrix.find(o => o.identifier === matrixLimits.tileMatrix);
    const matrixWidth: number = matrixLimits.maxTileCol - matrixLimits.minTileCol + 1;
    const matrixHeight: number = matrixLimits.maxTileRow - matrixLimits.minTileRow + 1;
    const resolution: number = matrix.scaleDenominator * 0.28E-3 / projection.getMetersPerUnit();

    const width: number = matrixWidth * matrix.tileWidth * resolution;
    const height: number = matrixHeight * matrix.tileHeight * resolution;
    const minx: number = matrix.topLeftCorner[0] + matrixLimits.minTileCol * matrix.tileWidth * resolution;
    const maxy: number = matrix.topLeftCorner[1] - matrixLimits.minTileRow * matrix.tileHeight * resolution;

    return [
        minx,
        maxy - height,
        minx + width,
        maxy,
    ];
}

function goToLayer(tms: wmts.TileMatrixSet, projection: ol.proj.Projection, limits?: wmts.TileMatrixSetLimits, zoom?: number): void {
    const extent: ol.Extent = getTileMatrixSetExtent(tms, projection, limits);
    const center = ol.extent.getCenter(extent);

    map.getView().animate({
        center: center,
        zoom: typeof zoom === "number" ? zoom : 0,
        duration: 1500
    });
}

$(document).ready(function () {
    // fill TMS map
    _mapTMS = new Map<string, wmts.TileMatrixSet>();
    for (const tms of tileMatrixSets) {
        _mapTMS.set(tms.identifier, tms);
    }

    group = new ol.layer.Group();
    map = new ol.Map({
        target: "map",
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            group
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 4
        })
    });
});