/**
 * @file Manages the OpenLayers Objects, WMSCapabilities and map changes
 * @author Markus Pöchtrager
 */
function IPFMap(Name, Div){
	
	this.Projection = new OpenLayers.Projection("EPSG:4326");
    
	// OpenLayers map object
    this.Map = null;
    
    // Map Name A,B,..
    this.MapName = Name;
    
    // Id of the Map Div
    this.MapDivId = Div
	
	// Stores the OpenLayers layers from pydap WMS requests 
	this.WmsLayer = null;
	
	// WMS Capabilities
	this.Capabilities = "";
	
	// Stores the Craticule layers 
	this.Graticule = null;
	
	// Stores the Click Controls for the maps
	this.ClickCtrl = null;
	
	// Stores the Dygraph Objects 
	this.DyGraph = null;
	
	// Stores the OpenLayers Markers
	this.Markers = null;
}

/** @function
 * Create map object and load base layers, graticule and click control
 * @name initMap */
IPFMap.prototype.initMap = function() {
	// new map object
    this.Map = new OpenLayers.Map("map"+this.MapName,{projection: this.Projection});
    
    // Add some base layer
    var wms_name = "OSM-WMS worldwide";
    var wms_url = "http://129.206.228.72/cached/osm?";
    var wms_options = {layers:'osm_auto:all', srs:'EPSG:900913', format:'image/png'};
    var layerOSM = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(layerOSM);
    
    wms_name = "Opengeo BlueMarble";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'bluemarble', tiled: true, srs:'EPSG:4326', format:'image/jpeg'};
    var opengeo = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(opengeo);
    
    wms_name = "Opengeo OSM";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'openstreetmap', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo1 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(opengeo1);
    
    wms_name = "Opengeo Chalk";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'chalk', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo2 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(opengeo2);
    
    wms_name = "Opengeo Graphite";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'graphite', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo3 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(opengeo3);
    
    wms_name = "Opengeo Blue";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'blue', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo4 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    this.Map.addLayer(opengeo4);
    
    // Add Layer Switcher Control
    this.Map.addControl(new OpenLayers.Control.LayerSwitcher());
    // Initialise the graticule
    this.Graticule = new OpenLayers.Control.Graticule({
        numPoints: 2, 
        labelled: true,
        visible: false
    });
    this.Map.addControl(this.Graticule);
    this.Map.setLayerIndex(this.Graticule.gratLayer,99);
    this.Map.zoomToMaxExtent();
    this.Map.zoomIn();
    
    this.Markers = new OpenLayers.Layer.Markers( "Markers" );
    this.Map.addLayer(this.Markers);
    
    var source = this;
    // Initialise ClickControl
    this.ClickCtrl = new OpenLayers.Control.Click({
    	trigger: function(e) {
	    	var lonlat = source.Map.getLonLatFromPixel(e.xy);
	    	showDygraph(source,lonlat);
    	}
    });
}

/** @function
 * Change the opacity for the wms layer
 * @name setWMSOpacity
 * @param {IPFMap} source - Map where to change opacity
 * @param {int} value - Opacity (0-100) */
IPFMap.prototype.setWMSOpacity = function(source, value) {
	if(source.WmsLayer) {
		source.WmsLayer.setOpacity(value/100);
	}
}

/** @function
 * Set the time position select control
 * @name setWMSOpacity
 * @param {Date} date - Set the new date */
IPFMap.prototype.setTimePosition = function(date) {
	date = new Date(date);
	var datestr = date.getFullYear()+"-"+(date.getMonth() < 9 ? '0' : '')+
	(date.getMonth()+1)+"-"+(date.getDate() < 10 ? '0' : '')+date.getDate()+"T"+
	(date.getHours() < 10 ? '0' : '')+date.getHours()+":"+
	(date.getMinutes() < 10 ? '0' : '')+date.getMinutes()+":"+
	(date.getSeconds() < 10 ? '0' : '')+date.getSeconds();
	
	$("#timeSelect"+this.MapName+" option[value='"+datestr+"']").prop("selected", true);
	timeChanged(this.MapName);
}

/** @function
 * (Re-)Draw the pydap wms layer on the map
 * @name showWMSLayer
 * @param {string} ncvar - NetCDF Variable (LAYER) for the WMS request
 * @param {string} time - Time position (TIME) for the WMS request
 * @param {string} url - WMS Url (NetCDF File)
 * @param {string} cmap - ColorMap for the WMS request
 * @param {IPFMap} targetMap - Target Map, where to (re-)draw the data */
IPFMap.prototype.showWMSLayer = function(ncvar, time, url, cmap, targetMap) {	
	this.removeWMSLayer(targetMap);
	var getmapurl = url+"?LAYERS="+ncvar+"&cmap="+cmap;
	if (time != null) // if there are time positions, add time property
		getmapurl += "&TIME="+time;
	this.WmsLayer = new OpenLayers.Layer.WMS('Pydap WMS Layer - Map '+this.MapName, getmapurl,
    		{layers: ncvar, TRANSPARENT: true},
            {isBaseLayer: false}
    	);
	this.WmsLayer.setOpacity($("#slider-"+this.MapName).val()/100);
	this.WmsLayer.setVisibility(true);
    
    $("#imgColorbar"+this.MapName).attr("src",getmapurl + "&REQUEST=GetColorbar"); // set the colorbar src
    $("#imgColorbar"+this.MapName).attr("alt","--- loading colorbar ---");
	targetMap.Map.addLayer(this.WmsLayer);
	targetMap.Map.raiseLayer(targetMap.Graticule.gratLayer,2);
	if($('#TimeSeriesContainerDiv_map'+targetMap.MapName).is(':visible') && targetMap.Markers.markers.length>0) {
		showDygraph(targetMap,targetMap.Markers.markers[0].lonlat);
	}
}

/** @function
 * Remove the pydap wms layer from the map
 * @name removeWMSLayer
 * @param {IPFMap} targetMap - Target Map, where to remove the data */
IPFMap.prototype.removeWMSLayer = function(targetMap) {
	if (targetMap.Map.getLayersByName('Pydap WMS Layer - Map '+this.MapName).length>0) {
		targetMap.Map.removeLayer(targetMap.Map.getLayersByName('Pydap WMS Layer - Map '+this.MapName)[0]);
	}
}

/** @function
 * Link or unlink two maps
 * @name registerLinkEvent
 * @param {IPFMap} targetMap - Gets moved if source map is moved
 * @param {boolean} register - Register or unregister event
 *  */
IPFMap.prototype.registerLinkEvent = function(targetMap, register) {
	var sourceMap = this;
	var syncMapHandler = function() {
		var targetCenter = targetMap.Map.getCenter();
        var sourceCenter = sourceMap.Map.getCenter();
        var targetZoom = targetMap.Map.getZoom();
        var sourceZoom = sourceMap.Map.getZoom();

        var coordsChanged = ((targetCenter.lat !== sourceCenter.lat) || (targetCenter.lon !== sourceCenter.lon));
        if (coordsChanged || targetZoom !== sourceZoom) {
			targetMap.Map.moveTo(sourceMap.Map.getCenter(),sourceMap.Map.getZoom(), {
	            dragging: true
	        });
			targetMap.Graticule.deactivate();
			targetMap.Graticule.activate();
        }
    };

    if (register) {
	    this.Map.events.on({
	        'move': syncMapHandler,
	        'zoomend': syncMapHandler,
	        scope: this
	    });
	    syncMapHandler();
    }
    else {
    	//TODO: Problem when more than 2 maps
    	this.Map.events.remove('move');
    	this.Map.events.remove('zoomend');
    }
}

/** @function
 * Click Event for Time Series
 * @name registerClickEvent
 * @param {boolean} register - Register or unregister event
 *  */
IPFMap.prototype.registerClickEvent = function(register) {
    if (register) {
        this.Map.addControl(this.ClickCtrl);
        if(!this.ClickCtrl.active)
        	this.ClickCtrl.activate();
    }
    else {
    	this.Map.removeControl(this.ClickCtrl);
    	if(this.ClickCtrl.active)
    		this.ClickCtrl.deactivate();
    }
}


/** @function
 * Initialises the Click Control for Time Series
 * @name initClickCtrl
 *  */
function initClickCtrl() {
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },

        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend(
                {}, this.defaultHandlerOptions
            );
            OpenLayers.Control.prototype.initialize.apply(
                this, arguments
            ); 
            this.handler = new OpenLayers.Handler.Click(
                this, {
                    'click': this.trigger
                }, this.handlerOptions
            );
        }
    });
}


/** @function
 * Add a new Map Marker to the map
 * @name addMapMarker
 * @param {IPFMap} map - Map where to add the marker
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the marker
 *  */
function addMapMarker(map, lonlat) {
	map.Markers.clearMarkers();
	map.Markers.addMarker(new OpenLayers.Marker(lonlat));
	map.Map.raiseLayer(map.Markers,4);
}

/** @function
 * Show the Dygraph Time Series plot for a given point
 * @name showDygraph
 * @param {IPFMap} source - Map where to show the Plot
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the TimeSeries
 */
function showDygraph(source, lonlat) {
	var ncvar = source.Capabilities.capability.layers[$("#ncvarSelect"+source.MapName).val()].name;
	var wmsurl = $("#wmsSelect"+source.MapName).val().split("?")[0];
	var bboxstring = (lonlat.lon-0.00001).toString()+","+(lonlat.lat-0.00001).toString()+","+(lonlat.lon+0.00001).toString()+","+(lonlat.lat+0.00001).toString();
	$.ajax({
        type: "GET",
		url: wmsurl,
		data: {
			'REQUEST': 	'GetTimeseries',
			'LAYERS':	ncvar,
			'BBOX':		bboxstring
		},
		dataType: "json",
		success: function(json) {
			$('#TimeSeriesContainerDiv_map'+source.MapName).show();
			
			var mydata = new Array();
			for (var i in json.data) {
				var date = new Date(json.data[i][0]);
				mydata[i]=[date,parseFloat(json.data[i][1])];
			}
			
			source.DyGraph = new Dygraph(
			    // containing div
				document.getElementById("TimeSeriesDiv_map"+source.MapName), mydata,
			    {
					labels: json.labels,
					
					/*//paints the vertical line showing the current date
					underlayCallback:function(canvas,area,layout){
						//_self.showTimeUnderlay(canvas,area,layout);
					},  */  
					//changes time to clicked time
					clickCallback:function(response,x,point){
						//_self.clicked(response,x,point,_self);   
						source.setTimePosition(x);
			    	},
			    	//errorBars: true,
			    	axisLabelFontSize:10,  
				  
			    	//valueRange: [50,125]
			    }
			);
			addMapMarker(source,lonlat);
		},
	    complete: function(xhr, textStatus) {
	        console.log(xhr.status+", "+textStatus);
	    } 
	});
}