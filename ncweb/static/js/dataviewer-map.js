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
/** @global 
 * Stores the Craticule layers */
var graticule = new Array();
/** @global 
 * Stores the Click Controls for the maps */
var clickCtrl = new Array();
/** @global 
 * Stores the Dygraph Objects */
var graph = new Array();



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
    
    wms_name = "Opengeo BlueMarble";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'bluemarble', tiled: true, srs:'EPSG:4326', format:'image/jpeg'};
    var opengeo = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(opengeo);
    
    wms_name = "Opengeo OSM";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'openstreetmap', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo1 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(opengeo1);
    
    wms_name = "Opengeo Chalk";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'chalk', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo2 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(opengeo2);
    
    wms_name = "Opengeo Graphite";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'graphite', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo3 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(opengeo3);
    
    wms_name = "Opengeo Blue";
    wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
    wms_options = {layers:'blue', tiled: true, srs:'EPSG:4326', format:'image/png'};
    var opengeo4 = new OpenLayers.Layer.WMS( wms_name , wms_url , wms_options,{'buffer':1, transitionEffect:'resize', removeBackBufferDelay:0, className:'olLayerGridCustom'});
    maps[mapId].addLayer(opengeo4);
    
    maps[mapId].addControl(new OpenLayers.Control.LayerSwitcher());
    graticule[mapId] = new OpenLayers.Control.Graticule({
        numPoints: 2, 
        labelled: true,
        visible: false
    });
    maps[mapId].addControl(graticule[mapId]);
    maps[mapId].setLayerIndex(graticule[mapId].gratLayer,99);
    maps[mapId].zoomToMaxExtent();
    maps[mapId].zoomIn();
    
    
    clickCtrl[mapId] = new OpenLayers.Control.Click({
    	trigger: function(e) {
	    	var lonlat = maps[mapId].getLonLatFromPixel(e.xy);
	    	var ncvar = CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name;
	    	var wmsurl = $("#wmsSelect"+mapId).val().split("?")[0];
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
	    			$('#TimeSeriesContainerDiv_map'+mapId).show();
	    			var mydata_test = [[new Date('1979/11/01 00:00:00'), 45.25], [new Date('1980/11/01 00:00:00'), 42.75], 
	    			              [new Date('1981/11/01 00:00:00'), 47.5], [new Date('1982/11/01 00:00:00'), 47.75], 
	    			              [new Date('1983/11/01 00:00:00'), 48.5], [new Date('1984/11/01 00:00:00'), 43.25], 
	    			              [new Date('1985/11/01 00:00:00'), 48.0], [new Date('1986/11/01 00:00:00'), 38.0],
	    			              [new Date('1987/11/01 00:00:00'), 50.5], [new Date('1988/11/01 00:00:00'), 56.25], 
	    			              [new Date('1989/11/01 00:00:00'), 48.25], [new Date('1990/11/01 00:00:00'), 35.0], 
	    			              [new Date('1991/11/01 00:00:00'), 99.0], [new Date('1992/11/01 00:00:00'), 104.25], 
	    			              [new Date('1993/11/01 00:00:00'), 130.0], [new Date('1994/11/01 00:00:00'), 178.0], 
	    			              [new Date('1995/11/01 00:00:00'), 158.75], [new Date('1996/11/01 00:00:00'), 147.75], 
	    			              [new Date('1997/11/01 00:00:00'), 146.0], [new Date('1998/11/01 00:00:00'), 141.75], 
	    			              [new Date('1999/11/01 00:00:00'), 136.75], [new Date('2000/11/01 00:00:00'), 101.75], 
	    			              [new Date('2001/11/01 00:00:00'), 51.25], [new Date('2002/11/01 00:00:00'), 147.75], 
	    			              [new Date('2003/11/01 00:00:00'), 207.0], [new Date('2004/11/01 00:00:00'), 207.75], 
	    			              [new Date('2005/11/01 00:00:00'), 209.0], [new Date('2006/11/01 00:00:00'), 203.5], 
	    			              [new Date('2007/11/01 00:00:00'), 284.0], [new Date('2008/11/01 00:00:00'), 290.75], 
	    			              [new Date('2009/11/01 00:00:00'), 284.25], [new Date('2010/11/01 00:00:00'), 284.25], 
	    			              [new Date('2011/11/01 00:00:00'), 277.5], [new Date('2012/11/01 00:00:00'), 236.0], 
	    			              [new Date('2013/11/01 00:00:00'), 227.5]];
	    			
	    			var mydata = new Array();
	    			for (var i in json.data) {
	    				mydata[i]=[new Date(json.data[0][0]),parseFloat(json.data[0][1])];
	    			}
	    			
	    			graph[mapId] = new Dygraph(
    				    // containing div
	    				document.getElementById("TimeSeriesDiv_map"+mapId), mydata,
    				    {
    						labels: json.labels
    						
    						/*//paints the vertical line showing the current date
    						underlayCallback:function(canvas,area,layout){
    							//_self.showTimeUnderlay(canvas,area,layout);
    						},    
    						//changes time to clicked time
    						clickCallback:function(response,x,point){
    							//_self.clicked(response,x,point,_self);   
					    	},*/
					    	//errorBars: true,
					    	//axisLabelFontSize:10,  
						  
					    	//valueRange: [50,125]
    				    }
    				);
	    		},
	    	    complete: function(xhr, textStatus) {
	    	        console.log(xhr.status+", "+textStatus);
	    	    } 
	    	});
    	}
    });
}

/** @function
 * Change the opacity for the wms layer
 * @name setWMSOpacity
 * @param {string} mapId - Defines the map, where to change the layer opacity
 * @param {int} value - Opacity (0-100) */
function setWMSOpacity(mapId, value) {
	mylayers[mapId].setOpacity(value/100);
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
	mylayers[mapId].setOpacity($("#slider-"+mapId).val()/100);
	mylayers[mapId].setVisibility(true);
    
    $("#imgColorbar"+mapId).attr("src",getmapurl + "&REQUEST=GetColorbar"); // set the colorbar src
    $("#imgColorbar"+mapId).attr("alt","--- loading colorbar ---");
	maps[targetMap].addLayer(mylayers[mapId]);
	maps[targetMap].raiseLayer(graticule[targetMap].gratLayer,2);
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
			graticule[targetMap].deactivate();
			graticule[targetMap].activate();
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
    	//TODO: Problem when more than 2 maps
    	maps[sourceMap].events.remove('move');
    	maps[sourceMap].events.remove('zoomend');
    }
}

/** @function
 * Initialises the Click Control for Time Series
 * @name registerClickEvent
 * @param {string} mapId - map where to handle the event
 * @param {boolean} register - Register or unregister event
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
 * Click Event for Time Series
 * @name registerClickEvent
 * @param {string} mapId - map where to handle the event
 * @param {boolean} register - Register or unregister event
 *  */
function registerClickEvent(mapId, register) {
    if (register) {
        maps[mapId].addControl(clickCtrl[mapId]);
        if(!clickCtrl[mapId].active)
        	clickCtrl[mapId].activate();
    }
    else {
    	maps[mapId].removeControl(clickCtrl[mapId]);
    	if(clickCtrl[mapId].active)
    		clickCtrl[mapId].deactivate();
    }
}