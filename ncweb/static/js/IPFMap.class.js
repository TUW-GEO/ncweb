/**
 * @file Manages the OpenLayers Objects, WMSCapabilities and map changes
 * @author Markus Pöchtrager
 */
function IPFMap(Name, Div) {

//	this.Projection = new OpenLayers.Projection("EPSG:4326");
	
	// IPFDataViewer ViewState 
	// (0 - disabled, 1 - overlay_top, 2 - overlay_bottom, 3 - splitscreen)
	this.ViewState = 0;

	// OpenLayers map object
	this.Map = null;

	// Map Name A,B,..
	this.MapName = Name;

	// Id of the Map Div
	this.MapDivId = Div

	// OpenLayers layers from pydap WMS requests
	this.WmsLayer = null;

	// WMS Capabilities
	this.Capabilities = "";

	// Craticule layers
	this.Graticule = null;

	// Click Controls for the maps
	this.ClickCtrl = null;
	
	// IPFDyGraph
	this.IPFDyGraph = null;

	// OpenLayers Marker Layer
	this.Markers = [];
	// OpenLayers Marker
	this.Marker = null;
	// OpenLayers Popup (for Marker)
	this.MarkerPopup = null;

	// Event for Temporal Linking
	this.TempLinkEvent = function() {
	};

	// Current Date of Interest
	this.Date = new Date();

	this.LayerList = [];

	this.vectorLayer = null;


}

/**
 * @function Create map object and load base layers, graticule and click control
 * @name initMap
 */
IPFMap.prototype.initMap = function() {
	// new map object
//	this.Map = new OpenLayers.Map("map" + this.MapName, {
//		projection : this.Projection
//	});
	console.log("initMap");

	menu={A:'in',B:'in'};
	side={A:'left',B:'right'}

//    var controls = [];

//	controls.push(new ol.control.Control({element: $('#controls-div')}));
	MyControl=new ol.control.Control({element: $('#controls-div')});
//	controls.push(new ol.control.Control({element: $('#menu-right')}));
//	var myControl = new ol.control.Control({element: $('#colorbarB-max-div')});
//	controls.push(new ol.control.Control({element: $('#colorbar-divA')}));
////	var myControl = new ol.control.Control({element: $('#colorbarB-div')});
//	controls.push(new ol.control.Control({element: $('#globe-divA')}));
////	var myControl = new ol.control.Control({element: $('#globeB-div')});
//	controls.push(new ol.control.Control({element: $('#colorbar-max-divA')}));
//	var myControl = new ol.control.Control({element: $('#colorbarB-max-div')});

	var map;

	var layers = [
	  new ol.layer.Tile({
		source: new ol.source.MapQuest({layer: 'sat'})
	  }),
//	  new ol.layer.Tile({
//		source: new ol.source.TileWMS({
//		  url: 'http://localhost:8080/thredds/wms/testAll/ESACCI-L3S_SOILMOISTURE-SSMV-COMBINED-1978-2013-fv01.2_3.nc?LAYERS=sm&STYLES=boxfill/rainbow&TIME=2013-12-24T00:00:00.000Z&COLORSCALERANGE=0.0099,0.9999',
//		  serverType: 'wms'
//		})
//	  })
	];

	this.Map = new ol.Map({
      layers: layers,
      target: 'map' + this.MapName,
      controls: ol.control.defaults().extend(MyControl),
      view: new ol.View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 3
      })
    });

    console.log("finished initMap");

//    var extra_layer = new ol.layer.Tile({
//		source: new ol.source.TileWMS({
//		  url: 'http://localhost:8080/thredds/wms/testAll/ESACCI-L3S_SOILMOISTURE-SSMV-COMBINED-1978-2013-fv01.2_3.nc?LAYERS=sm&STYLES=boxfill/rainbow&TIME=2013-12-24T00:00:00.000Z&COLORSCALERANGE=0.0099,0.9999',
//		  serverType: 'wms'
//		})
//	  });
//
//	this.Map.addLayer(extra_layer);

//	// Add some base layer
//	var wms_name = "Opengeo BlueMarble";
//	var wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
//	var wms_options = {
//		layers : 'bluemarble',
//		tiled : true,
//		srs : 'EPSG:4326',
//		format : 'image/jpeg'
//	};
//	var opengeo = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(opengeo);
//
//	wms_name = "OSM-WMS worldwide";
//	wms_url = "http://129.206.228.72/cached/osm?";
//	wms_options = {
//		layers : 'osm_auto:all',
//		srs : 'EPSG:900913',
//		format : 'image/png'
//	};
//	var layerOSM = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(layerOSM);
//
//	wms_name = "Opengeo OSM";
//	wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
//	wms_options = {
//		layers : 'openstreetmap',
//		tiled : true,
//		srs : 'EPSG:4326',
//		format : 'image/png'
//	};
//	var opengeo1 = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(opengeo1);
//
//	wms_name = "Opengeo Chalk";
//	wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
//	wms_options = {
//		layers : 'chalk',
//		tiled : true,
//		srs : 'EPSG:4326',
//		format : 'image/png'
//	};
//	var opengeo2 = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(opengeo2);
//
//	wms_name = "Opengeo Graphite";
//	wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
//	wms_options = {
//		layers : 'graphite',
//		tiled : true,
//		srs : 'EPSG:4326',
//		format : 'image/png'
//	};
//	var opengeo3 = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(opengeo3);
//
//	wms_name = "Opengeo Blue";
//	wms_url = "http://maps.opengeo.org/geowebcache/service/wms";
//	wms_options = {
//		layers : 'blue',
//		tiled : true,
//		srs : 'EPSG:4326',
//		format : 'image/png'
//	};
//	var opengeo4 = new OpenLayers.Layer.WMS(wms_name, wms_url, wms_options, {
//		'buffer' : 1,
//		transitionEffect : 'resize',
//		removeBackBufferDelay : 0,
//		className : 'olLayerGridCustom'
//	});
//	this.Map.addLayer(opengeo4);
//
//	// Add Layer Switcher Control
//	this.Map.addControl(new OpenLayers.Control.LayerSwitcher());
//	// Initialise the graticule
//	this.Graticule = new OpenLayers.Control.Graticule({
//		numPoints : 2,
//		labelled : true,
//		visible : false
//	});
//	this.Map.addControl(this.Graticule);
//	this.Map.setLayerIndex(this.Graticule.gratLayer, 99);
//	this.Map.zoomToMaxExtent();
//	this.Map.zoomIn();
//
//	this.Markers = new OpenLayers.Layer.Markers("Markers");
//	this.Map.addLayer(this.Markers);
//
//	this.IPFDyGraph = new IPFDyGraph(this);
//
//	var _self = this;
//	// Initialise ClickControl
//	this.ClickCtrl = new OpenLayers.Control.Click({
//		trigger : function(e) {
//			var lonlat = _self.Map.getLonLatFromPixel(e.xy);
//			_self.IPFDyGraph.showDyGraph(lonlat);
//			if ($("#cb_linkABmarker").is(':checked') && IPFDV.maps.B.ViewState == IPFDV.ViewStates.separate) {
//				if (_self.MapName == 'A') {
//					IPFDV.maps.B.IPFDyGraph.showDyGraph(lonlat);
//				}
//				else if (_self.MapName == 'B') {
//					IPFDV.maps.A.IPFDyGraph.showDyGraph(lonlat);
//				}
//			}
//		}
//	});
}

/**
 * @function Change the opacity for the wms layer
 * @name setWMSOpacity
 * @param {IPFMap} source - Map where to change opacity
 * @param {int} value - Opacity (0-100)
 */
IPFMap.prototype.setWMSOpacity = function(source, value) {
	if (source.WmsLayer) {
		source.WmsLayer.setOpacity(value / 100);
	}
}

/**
 * @function Set the time position select control
 * @name setWMSOpacity
 * @param {Date} date - Set the new date
 */
IPFMap.prototype.setTimePosition = function(date) {
	date = new Date(date);
	var datestr = date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' : '')
			+ (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? '0' : '')
			+ date.getDate() + "T" + (date.getHours() < 10 ? '0' : '')
			+ date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '')
			+ date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '')
			+ date.getSeconds();

	$("#timeSelect" + this.MapName + " option[value='" + datestr + "']").prop(
			"selected", true);
	timeChanged(this.MapName);
}

/**
 * @function (Re-)Draw the pydap wms layer on the map
 * @name showWMSLayer
 * @param {string} ncvar - NetCDF Variable (LAYER) for the WMS request
 * @param {string} time - Time position (TIME) for the WMS request
 * @param {string} url - WMS Url (NetCDF File)
 * @param {string} cmap - ColorMap for the WMS request
 * @param {IPFMap} targetMap - Target Map, where to (re-)draw the data
 * @param {boolean} onTop - Specifies whether the Layer lies on top (true) or on bottom (false)
 * @param {boolean} reloadTS - Reload the TimeSeries DyGraph if True
 */
//IPFMap.prototype.showWMSLayer = function(ncvar, time, url, cmap, onTop, reloadTS) {
//
//	console.log("in showWMSLayer targetMap: "+this.Map);
//
//	this.removeWMSLayer();
//
////	cmap = "rainbow";
//
//	var getmapurl = url + "?LAYERS=" + ncvar + "&STYLES=boxfill/" + cmap;
//
//	if (time != null) // if there are time positions, add time property
//		getmapurl += "&TIME=" + time;
//
//	if (isNaN($("#tbMin_map"+this.MapName).val()) || isNaN($("#tbMax_map"+this.MapName).val())) {
//		// Don't add colorbarrange to the get request
//	}
//	else {
//		getmapurl += "&COLORSCALERANGE=" + $("#tbMin_map"+this.MapName).val()+","+$("#tbMax_map"+this.MapName).val();
//		console.log("set COLORSCALERANGE min,max="+ $("#tbMin_map"+this.MapName).val()+","+$("#tbMax_map"+this.MapName).val());
//	}
//
//	// Colorbar-Requests
////	$("#imgColorbar" + this.MapName).attr("src",
////			getmapurl + "&REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=25&HEIGHT=195&PALETTE="+cmap+"&NUMCOLORBANDS=20");
//
//	$("#imgColorbar" + onTop).attr("src",
//			getmapurl + "&REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=25&HEIGHT=195&PALETTE="+cmap+"&NUMCOLORBANDS=20");// set the settings colorbar src
////	$("#imgColorbar_map" + this.MapName).attr("src",
////			getmapurl + "&REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=25&HEIGHT=195&PALETTE="+cmap+"&NUMCOLORBANDS=20"); // set the map overlay colorbar src
//
//	console.log("showWMSLayer:");
//	console.log(getmapurl);
//
//
//	// Set WMS Layer - WMS Requests are done here
////	this.WmsLayer = new OpenLayers.Layer.WMS('Pydap WMS Layer - Map ' + this.MapName, getmapurl, {
////		layers : ncvar,
////		TRANSPARENT : true
////	}, {
////		isBaseLayer : false
////	});
////
////	this.WmsLayer.setOpacity($("#opacityslider-" + this.MapName)
////			.slider("value") / 100);
////	this.WmsLayer.setVisibility(true);
//
////	getmapurl+= "&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap";
////	console.log(getmapurl);
//
//	this.WMSLayer = new ol.layer.Tile({
//		source: new ol.source.TileWMS({
//		  url: getmapurl,
//		  serverType: 'wms'
//		})
//	  });
//
////	var maplabel = "Map"+this.MapName+": "+url+" | "+ncvar;
////	if(time!=null) {
////		maplabel += " | "+time;
////	}
////	$("#mapLabel_map"+this.MapName+"_map"+this.MapName).html(maplabel);
//
//	this.Map.addLayer(this.WMSLayer);
//
//	//Set Layer Order
////	if (onTop) {
////		if (this.Map.getLayerIndex(IPFDV.maps.B.WmsLayer) > 0) {
////			this.Map.setLayerIndex(IPFDV.maps.B.WmsLayer, 0);
////		}
////		this.Map.setLayerIndex(this.WmsLayer, 0);
////	}
////	else {
////		this.Map.setLayerIndex(this.WmsLayer, 0);
////		if (this.Map.getLayerIndex(IPFDV.maps.B.WmsLayer) > 0) {
////			this.Map.setLayerIndex(IPFDV.maps.B.WmsLayer, 0);
////		}
////	}
//
////	this.Map.raiseLayer(this.Graticule.gratLayer, 5);
//	// Reload Dygraph if necessary
//	if ($('#TimeSeriesContainerDiv_map' + this.MapName).is(':visible')
//			&& this.Markers.markers.length > 0) {
//		if (reloadTS) {
//			this.IPFDyGraph.showDyGraph(this.Markers.markers[0].lonlat);
//		} else {
//			// Not necessary to reload dygraph here
//			this.addMapMarker(this.Markers.markers[0].lonlat);
//		}
//	}
//}


IPFMap.prototype.showWMSLayer = function(getmapurl, zindex, opac) {

	for(var layer in this.LayerList){
		this.removeWMSLayer(layer);
	}

	this.LayerList[zindex] = new ol.layer.Tile({
		source: new ol.source.TileWMS({
		  url: getmapurl,
//		  opacity: opac,
		  serverType: 'wms'
		})
	  });

	  this.LayerList[zindex].setOpacity(opac);

//	this.layers = new ol.layer.Group();

	console.log("in showWMSLayer targetMap: "+this.Map.MapName);




//
//	this.WMSLayer = new ol.layer.Tile({
//		source: new ol.source.TileWMS({
//		  url: getmapurl,
//		  serverType: 'wms'
//		})
//	  });
//
//

//	var maplabel = "Map"+this.MapName+": "+url+" | "+ncvar;
//	if(time!=null) {
//		maplabel += " | "+time;
//	}
//	$("#mapLabel_map"+this.MapName+"_map"+this.MapName).html(maplabel);

//    this.LayerGroup = new ol.layer.Group({layers: this.LayerList})

	for(var layer in this.LayerList){
		this.Map.addLayer(this.LayerList[layer]);
	}




//	this.Map.raiseLayer(this.Graticule.gratLayer, 5);
	// Reload Dygraph if necessary
	if ($('#TimeSeriesContainerDiv_map' + this.MapName).is(':visible')
			&& this.Markers.markers.length > 0) {
		if (reloadTS) {
			this.IPFDyGraph.showDyGraph(this.Markers.markers[0].lonlat);
		} else {
			// Not necessary to reload dygraph here
			this.addMapMarker(this.Markers.markers[0].lonlat);
		}
	}
	this.Map.updateSize();
}


/**
 * @function Remove the pydap wms layer from the map
 * @name removeWMSLayer
 * @param {IPFMap} this - Target Map, where to remove the data
 */
IPFMap.prototype.removeWMSLayer = function(zindex) {
	if(this.LayerList[zindex]){
		this.Map.removeLayer(this.LayerList[zindex]);
	}
//	if(this.LayerGroup){
//		this.Map.removeLayer(this.LayerGroup);
//	}
}

IPFMap.prototype.setWMSOpacity = function(zindex, opac) {
	this.LayerList[zindex].setOpacity(opac);
}

/**
 * @function Link or unlink two maps (Geographic)
 * @name registerGeoLinkEvent
 * @param {IPFMap} targetMap - Gets moved if source map is moved
 * @param {boolean} register - Register or unregister event
 */
IPFMap.prototype.registerGeoLinkEvent = function(targetMap, register) {
	var sourceMap = this;
	var syncMapHandler = function() {
		var targetCenter = targetMap.Map.getCenter();
		var sourceCenter = sourceMap.Map.getCenter();
		var targetZoom = targetMap.Map.getZoom();
		var sourceZoom = sourceMap.Map.getZoom();

		var coordsChanged = ((targetCenter.lat !== sourceCenter.lat) || (targetCenter.lon !== sourceCenter.lon));
		if (coordsChanged || targetZoom !== sourceZoom) {
			targetMap.Map.moveTo(sourceMap.Map.getCenter(), sourceMap.Map
					.getZoom(), {
				dragging : true
			});

			// Refresh Grid
			targetMap.Graticule.deactivate();
			targetMap.Graticule.activate();
		}
	};

	if (register) {
		this.Map.events.on({
			'move' : syncMapHandler,
			'zoomend' : syncMapHandler,
			scope : this
		});
		syncMapHandler();
	} else {
		// TODO: Problem when more than 2 maps
		this.Map.events.remove('move');
		this.Map.events.remove('zoomend');
	}
}

/**
 * @function Link or unlink two maps (Temporal)
 * @name registerTempLinkEvent
 * @param {IPFMap} targetMap - Gets moved if source map is moved
 * @param {boolean} register - Register or unregister event
 */
IPFMap.prototype.registerTempLinkEvent = function(targetMap, register) {
	var sourceMap = this;
	var synctempMapHandler = function() {
		targetMap.syncDateTime(sourceMap.Date);
	};

	if (register) {
		this.TempLinkEvent = synctempMapHandler;
		synctempMapHandler();
	} else {
		this.TempLinkEvent = function() {
		}; // Do Nothing
	}
}


/**
 * @function Set the internal date and the control date to the nearest time position to syncdate
 * @name syncDateTime
 * @param {Date} syncdate - time position
 */
IPFMap.prototype.syncDateTime = function(syncdate) {
	var selectValue = -1;
	var minDateDiff = -1;
	var options = $("#timeSelect" + this.MapName + " option");
	for (var i = 0; i < options.length; i++) {
		var date = new Date(options[i].value.replace(/\s+/g, ''));
		if (minDateDiff > Math.abs((syncdate.getTime() - date.getTime())/(1000*3600*24))
				|| minDateDiff < 0) {
			minDateDiff = Math.abs((syncdate.getTime() - date.getTime())/(1000*3600*24));
			selectValue = options[i].value;
		}
	}
	if ($("#timeSelect" + this.MapName).val != selectValue) {
		$("#timeSelect" + this.MapName).val(selectValue); // Sync Control
		this.Date = syncdate; // Sync internal Date
		var lock=false;
		if($("#lock"+this.MapName).val()==="unlock"){lock=true;}
		IPFDV.showLayerOnMap(this, false, lock);
	}
	
	if (this.IPFDyGraph.DyGraph != null) {
		this.IPFDyGraph.DyGraph.updateOptions({});
		this.IPFDyGraph.DyGraph.resize();
	}
}

/**
 * @function Click Event for Time Series
 * @name registerClickEvent
 * @param {boolean} register - Register or unregister event
 */
IPFMap.prototype.registerClickEvent = function(register) {
	if (register) {
		this.Map.addControl(this.ClickCtrl);
		if (!this.ClickCtrl.active)
			this.ClickCtrl.activate();
	} else {
		this.Map.removeControl(this.ClickCtrl);
		if (this.ClickCtrl.active)
			this.ClickCtrl.deactivate();
	}
}

/**
 * @function Add a new Map Marker to the map
 * @name addMapMarker
 * @param {IPFMap} map - Map where to add the marker
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the marker
 */
IPFMap.prototype.addMapMarker = function(lonlat) {
	var self = this;
	self.Markers = [];		// remove old Marker
	self.Map.removeLayer(self.vectorLayer);
	self.vectorLayer = null;

	var feature = new ol.Feature({
		geometry: new ol.geom.Point(lonlat),
		name: 'TS'
		});

	self.Markers.push(feature);
	var vectorSource = new ol.source.Vector({
		features: self.Markers
	});

	self.vectorLayer = new ol.layer.Vector({
		source: vectorSource
	});

	self.Map.addLayer(self.vectorLayer);

//	var _self = this;
//	if(this.MarkerPopup != null) {
//		this.Map.removePopup(this.MarkerPopup);
//	}
//	this.Markers.clearMarkers();
//	this.Marker = new OpenLayers.Marker(lonlat);
//	var html = "<div class='markerPopup'>lon: "+lonlat.lon.toFixed(4)+"<br />lat: "+lonlat.lat.toFixed(4)+"</div>";
//
//    this.MarkerPopup = new OpenLayers.Popup.Anchored(
//        'markerPopup',
//        lonlat,
//        new OpenLayers.Size(90,30),
//        html,
//        {size: {w: 14, h: 14}, offset: {x: -7, y: -7}},
//        false
//    );
//	this.Marker.events.register('mouseover', this.Marker, function(evt) {
//        _self.Map.addPopup(_self.MarkerPopup);
//    });
//	this.Marker.events.register('mouseout', this.Marker, function(evt) {
//		_self.Map.removePopup(_self.MarkerPopup);
//	});
//	this.Markers.addMarker(this.Marker);
//	this.Map.raiseLayer(this.Markers, 6);
}

/**
 * @function Initialises the Click Control for Time Series
 * @name initClickCtrl
 */
function initClickCtrl() {
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
		defaultHandlerOptions : {
			'single' : true,
			'double' : false,
			'pixelTolerance' : 0,
			'stopSingle' : false,
			'stopDouble' : false
		},

		initialize : function(options) {
			this.handlerOptions = OpenLayers.Util.extend({},
					this.defaultHandlerOptions);
			OpenLayers.Control.prototype.initialize.apply(this, arguments);
			this.handler = new OpenLayers.Handler.Click(this, {
				'click' : this.trigger
			}, this.handlerOptions);
		}
	});
}