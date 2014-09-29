/**
 * @file Manages the OpenLayers Objects and map changes
 * @author Markus Pöchtrager
 */

/** @global 
 * Stores OpenLayers Map Objects */
var maps = new Array();
/** @global 
 * Stores the OpenLayers layers from pydap WMS requests */
var mylayers = new Array();


/** @function
 * Create map object and load base layers
 * @name initMap
 * @param {string} mapId - Defines the map */
function initMap(mapId) {
	var geographic = new OpenLayers.Projection("EPSG:4326");
	var mercator = new OpenLayers.Projection("EPSG:900913");
	
	var options = {
            projection: mercator,
            displayProjection: geographic,
            units: 'degrees'
    };
    
	// create map object
    maps[mapId] = new OpenLayers.Map('map'+mapId,{projection: geographic});
    
    // wms simple base layer
    var wms_name = "OSM-WMS worldwide";
    var wms_url = "http://129.206.228.72/cached/osm?";
    var wms_options = {layers:'osm_auto:all', srs:'EPSG:900913', format:'image/png'};
    var layerOSM = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(layerOSM);
    
    // mapquest layers different projection
    var arrayOSM = ["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"];
    var arrayAerial = ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
                    "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
                    "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
                    "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"];
   
    var baseOSM = new OpenLayers.Layer.OSM("MapQuest-OSM Tiles", arrayOSM);
    var baseAerial = new OpenLayers.Layer.OSM("MapQuest Open Aerial Tiles", arrayAerial);
  
    maps[mapId].addLayer(baseOSM);
    maps[mapId].addLayer(baseAerial);
    
    maps[mapId].addControl(new OpenLayers.Control.LayerSwitcher());
    maps[mapId].zoomToMaxExtent();
    maps[mapId].zoomIn();
}

/** @function
 * (Re-)Draw the pydap wms layer on the map
 * @name showWMSLayer
 * @param {string} ncvar - NetCDF Variable (LAYER) for the WMS request
 * @param {string} time - Time position (TIME) for the WMS request
 * @param {string} url - WMS Url (NetCDF File)
 * @param {string} cmap - ColorMap for the WMS request
 * @param {string} mapId - Defines the map tab where the data are from
 * @param {string} targetMap - Target Map, where to (re-)draw the data */
function showWMSLayer(ncvar, time, url, cmap, mapId, targetMap) {	
	removeWMSLayer(mapId,targetMap);
	var getmapurl = url+"?LAYERS="+ncvar+"&cmap="+cmap;
	if (time != null) // if there are time positions, add time property
		getmapurl += "&TIME="+time;
	mylayers[mapId] = new OpenLayers.Layer.WMS('Pydap WMS Layer - Map '+mapId, getmapurl,
    		{layers: ncvar, TRANSPARENT: true},
            {isBaseLayer: false}
    	);
	mylayers[mapId].setOpacity(0.8);
	mylayers[mapId].setVisibility(true);
    
    $("#imgColorbar"+mapId).attr("src",getmapurl + "&REQUEST=GetColorbar"); // set the colorbar src
    $("#imgColorbar"+mapId).attr("alt","--- loading colorbar ---");
	maps[targetMap].addLayer(mylayers[mapId]);
}

/** @function
 * Remove the pydap wms layer from the map
 * @name removeWMSLayer
 * @param {string} mapId - Defines the map tab where the data are from
 * @param {string} targetMap - Target Map, where to remove the data */
function removeWMSLayer(mapId,targetMap) {
	if (maps[targetMap].getLayersByName('Pydap WMS Layer - Map '+mapId).length>0) {
		maps[targetMap].removeLayer(maps[targetMap].getLayersByName('Pydap WMS Layer - Map '+mapId)[0]);
	}
}

/** @function
 * Resize the map divs to make the document fit 100% (height)
 * @name resizeMapDiv
 * @param {string} divId - the div to resize */
function resizeMapDiv(divId) {
	var div = $(divId);
	div.height(($(window).height() - $('#map-controls').height() - $('#footer').height() - $('.navbar').height() -100)
	);
}

/** @function
 * Link or unlink two maps
 * @name registerLinkEvent
 * @param {string} targetMap - Gets moved if source map is moved
 * @param {string} sourceMap - Source map
 * @param {boolean} register - Register or unregister event
 *  */
function registerLinkEvent(targetMap, sourceMap, register) {
	var syncMapHandler = function() {
		var targetCenter = maps[targetMap].getCenter();
        var sourceCenter = maps[sourceMap].getCenter();
        var targetZoom = maps[targetMap].getZoom();
        var sourceZoom = maps[sourceMap].getZoom();

        var coordsChanged = ((targetCenter.lat !== sourceCenter.lat) || (targetCenter.lon !== sourceCenter.lon));
        if (coordsChanged || targetZoom !== sourceZoom) {
			maps[targetMap].moveTo(maps[sourceMap].getCenter(),maps[sourceMap].getZoom(), {
	            dragging: true
	        });
        }
    };

    if (register) {
	    maps[sourceMap].events.on({
	        'move': syncMapHandler,
	        'zoomend': syncMapHandler,
	        scope: this
	    });
	    syncMapHandler();
    }
    else {
    	//TODO: Problem if more than 2 maps
    	maps[sourceMap].events.remove('move');
    	maps[sourceMap].events.remove('zoomend');
    }
}