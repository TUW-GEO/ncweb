var maps = new Array();
var mylayers = new Array();

function initMap(mapId) {
	var geographic = new OpenLayers.Projection("EPSG:4326");
	var mercator = new OpenLayers.Projection("EPSG:900913");
	
	var options = {
            projection: mercator,
            displayProjection: geographic,
            units: 'degrees'
    };
    
    maps[mapId] = new OpenLayers.Map('map'+mapId,{projection: geographic});
    var wms_name = "OSM-WMS worldwide";
    var wms_url = "http://129.206.228.72/cached/osm?";
    var wms_options = {layers:'osm_auto:all', srs:'EPSG:900913', format:'image/png'};
    var layerOSM = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(layerOSM);
    
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

function showWMSLayer(ncvar, time, url, mapId, targetMap) {
	removeWMSLayer(mapId,targetMap);
	var getmapurl = url+"?LAYERS="+ncvar;
	if (time != null)
		getmapurl += "&TIME="+time;
	mylayers[mapId] = new OpenLayers.Layer.WMS('Pydap WMS Layer - Map '+mapId, getmapurl,
    		{layers: ncvar, TRANSPARENT: true},
            {isBaseLayer: false}
    	);
	mylayers[mapId].setOpacity(0.8);
	mylayers[mapId].setVisibility(true);
    
	maps[targetMap].addLayer(mylayers[mapId]);
    $("#imgColorbar"+mapId).attr("src",getmapurl + "&REQUEST=GetColorbar");
    $("#imgColorbar"+mapId).attr("alt","--- loading colorbar ---");
}

function removeWMSLayer(mapId,targetMap) {
	if (maps[targetMap].getLayersByName('Pydap WMS Layer - Map '+mapId).length>0) {
		maps[targetMap].removeLayer(maps[targetMap].getLayersByName('Pydap WMS Layer - Map '+mapId)[0]);
	}
}