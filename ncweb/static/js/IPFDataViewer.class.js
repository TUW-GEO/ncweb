/**
 * @file Core file. Manages data provisioning (requests and controls)
 * @author Markus Pöchtrager
 */

function IPFDataViewer(serverurl) {
	
	this.maps = {};
	
	
	
	//deactivate all map options
	$("#cb_linkAB").attr("checked", false);
	$("#cb_getTS").attr("checked", false);
	
	//Initialize custom click control
	initClickCtrl();
	
	this.maps.A = new IPFMap("A",'#mapA');
	this.maps.A.initMap();
	
	this.maps.B = new IPFMap("B",'#mapB');
	this.maps.B.initMap();
	$('#mapB').hide();
	
	var source = this;
	$("#opacityslider-A").slider();
	$("#opacityslider-A").val(80); //set initial value
	$("#opacityslider-A").on("slide", function(slideEvt) {
		source.maps.A.setWMSOpacity(source.maps.A, slideEvt.value);
	});
	$("#opacityslider-A").on("slideStop", function(slideEvt) {
		source.maps.A.setWMSOpacity(source.maps.A, slideEvt.value);
	});
	$("#opacityslider-B").slider();
	$("#opacityslider-B").val(80); //set initial value
	$("#opacityslider-B").on("slide", function(slideEvt) {
		source.maps.B.setWMSOpacity(source.maps.B, slideEvt.value);
	});
	$("#opacityslider-B").on("slideStop", function(slideEvt) {
		source.maps.B.setWMSOpacity(source.maps.B, slideEvt.value);
	});
	
	//Get Pydap handled files for requested url and add to WMS Select
	this.GetWMSFileList(serverurl);
	this.ncwebResize();
	
}

/** @function
 * GetFileList request for a given directory
 * @name GetWMSFileList
 * @param {string} url - Specifies the directory on the pydap server */
IPFDataViewer.prototype.GetWMSFileList = function(url) {
	var mapA = this.maps["A"];
	var mapB = this.maps["B"];
	var ipfdv = this;
	$.ajax({
        type: "GET",
		url: url+"?REQUEST=GetFileList",
		dataType: "json",
		success: function(json) {
			$("#wmsSelectA").empty();
			$("#wmsSelectB").empty();
			for (var f in json.files) {
				var o = new Option(json.files[f].name, json.location+json.files[f].name+".wms?service=WMS&REQUEST=GetCapabilities&version=1.1.1");
				$(o).html(json.files[f].name);
				$("#wmsSelectA").append(o);
				var o = new Option(json.files[f].name, json.location+json.files[f].name+".wms?service=WMS&REQUEST=GetCapabilities&version=1.1.1");
				$(o).html(json.files[f].name);
				$("#wmsSelectB").append(o);
			}
			ipfdv.GetWMSCapabilities(mapA);
			ipfdv.GetWMSCapabilities(mapB);
		}
	});
}


/** @function
 * GetCapabilities request for a selected pydap handled file
 * @name GetWMSCapabilities
 * @param {IPFMap} map - Defines the map */
IPFDataViewer.prototype.GetWMSCapabilities = function(map) {
	var req_url = $("#wmsSelect"+map.MapName).val();
	var ipfdv = this;
	if (req_url) {
		$.ajax({
	        type: "GET",
			url: req_url,
			dataType: "xml",
			success: function(xml) {
				var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
				map.Capabilities = wmsCapabilities.read(xml);
				
				//Get options for Variables select-control
				ipfdv.loadVariables("#ncvarSelect"+map.MapName, map); 
				//Get options for Timepositions select-control
				ipfdv.loadTimepositions("#timeSelect"+map.MapName, "#ncvarSelect"+map.MapName, map);
				
				ipfdv.showLayerOnMap(map);
			},
			error: function() {
				//reset controls if there is a problem with the wms request
				ipfdv.resetControls(map);
			}
		});
	}
	else {
		ipfdv.resetControls(map);
	}
}

/** @function
 * Set netcdf variables select control options
 * @name loadVariables 
 * @param {string} ncvar_ctrl - Control-Id of the variables SELECT
 * @param {IPFMap} map - Map tab where the variables SELECT gets loaded */
IPFDataViewer.prototype.loadVariables = function(ncvar_ctrl, map) {
	$(ncvar_ctrl).empty();
	//read layer information
	if(map.Capabilities.capability && map.Capabilities.capability.layers) {
		for (var l in map.Capabilities.capability.layers) {
			var o = new Option(map.Capabilities.capability.layers[l].title, l);
			$(o).html(map.Capabilities.capability.layers[l].title);
			$(ncvar_ctrl).append(o);
		}
	}
	if ($(ncvar_ctrl)[0] && $(ncvar_ctrl)[0].length>1)
		$(ncvar_ctrl).removeAttr("disabled");
	else
		$(ncvar_ctrl).attr('disabled', true);
}

/** @function
 * Set timepositions select control options
 * @name loadTimepositions 
 * @param {string} time_ctrl - Control-Id of the timepositions SELECT
 * @param {string} ncvar_ctrl - Control-Id of the variables SELECT
 * @param {IPFMap} map - Map tab where the timepositions SELECT gets loaded */
IPFDataViewer.prototype.loadTimepositions = function(time_ctrl, ncvar_ctrl, map) {
	$(time_ctrl).empty();
	var ncvar = $(ncvar_ctrl).val();
	//read the layers time information
	if(map.Capabilities.capability && map.Capabilities.capability.layers) {
		var layer = map.Capabilities.capability.layers[ncvar];
		if (layer && layer.dimensions.time) {
			for (var t in layer.dimensions.time.values) {
				/*var date = new Date(layer.dimensions.time.values[t]);
				var utcdate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 
						date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());*/
				var o = new Option(layer.dimensions.time.values[t],layer.dimensions.time.values[t]);
				$(o).html(layer.dimensions.time.values[t]);
				$(time_ctrl).append(o);
			}
		}
	}
	if ($(time_ctrl)[0] && $(time_ctrl)[0].length>1)
		$(time_ctrl).removeAttr("disabled");
	else
		$(time_ctrl).attr('disabled', true);
}

/** @function
 * Show WMSLayer either as map overlay or as separate map
 * @name showLayerOnMap
 * @param {IPFMap} map - Specifies which map data are to be shown */
IPFDataViewer.prototype.showLayerOnMap = function(map) {
	// show data on separate map
	if(map.MapName == 'A' || $("#btn_separateMap"+map.MapName).hasClass('active') == true) {
		map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name, 
				$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0], 
				$("#cmapSelect"+map.MapName).val(), map);
	}
	// show data as overlay on MapA
	else if($("#btn_overlayMap"+map.MapName).hasClass('active') == true) {
		map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name, 
				$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0], 
				$("#cmapSelect"+map.MapName).val(), this.maps["A"]);
	}
}

/** @function
 * Clear the select controls
 * @name myFunction 
 * @param {string} mapId - Map tab where the controls needs to be reset */
IPFDataViewer.prototype.resetControls = function(map) {
	map.Capabilities = "";
	this.loadVariables("#ncvarSelect"+map.MapName, map);
	this.loadTimepositions("#timeSelect"+map.MapName, "#ncvarSelect"+map.MapName, map);
}

/** @function
 * Resize all Map Controls on windows or div resize
 * @name ncwebResize 
 * @param {IPFDataViewer} ipfdv - IPFDataViewer as parameter
 * There is a additional resizeDygraphs()-function in jquery.splitter-0.14.0.js to resize the dygraph div */
IPFDataViewer.prototype.ncwebResize = function() {
	resizeDiv(this.maps.A.MapDivId);
	resizeDiv(this.maps.B.MapDivId);
	resizeDiv('#splitcontainer');
	resizeDiv('.left_panel');
	resizeDiv('.right_panel');
	
	$("#TimeSeriesContainerDiv_mapA").css('top',$(this.maps.A.MapDivId).height()-210);
	$("#TimeSeriesContainerDiv_mapB").css('top',$(this.maps.B.MapDivId).height()-210);
	$("#TimeSeriesContainerDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
	$("#TimeSeriesContainerDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
	$("#TimeSeriesDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
	$("#TimeSeriesDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
	if(this.maps.A.DyGraph) {
		this.maps.A.DyGraph.resize();
	}
	if(this.maps.B.DyGraph) {
		this.maps.B.DyGraph.resize();
	}
	
	this.maps['A'].Map.updateSize();
	this.maps['A'].Map.zoomToMaxExtent();
	this.maps['A'].Map.zoomIn();
	this.maps['B'].Map.updateSize();
	this.maps['B'].Map.zoomToMaxExtent();
	this.maps['B'].Map.zoomIn();
}

/** @function
 * Resize the divs to make the document fit 100% (height)
 * @name resizeDiv */
var resizeDiv = function(divId) {
	var div = $(divId);
	div.height(($(window).height() - $('#map-controls').height() - $('#footer').height() - $('.navbar').height() -60));
}