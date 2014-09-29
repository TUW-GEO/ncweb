/**
 * @file Core file. Manages data provisioning (requests and controls)
 * @author Markus Pöchtrager
 */

/** @global 
 * Stores WMS Capabilities for currently active selections */
var CAPABILITIES = new Array();

/** @function
 * GetCapabilities request for a selected pydap handled file
 * @name wmsGetCapabilities
 * @param {string} mapId - Defines the map */
function wmsGetCapabilities(mapId) {
	var req_url = $("#wmsSelect"+mapId).val();
	if (req_url) {
		$.ajax({
	        type: "GET",
			url: req_url,
			dataType: "xml",
			success: function(xml) {
				var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
				CAPABILITIES[mapId] = wmsCapabilities.read(xml);
				
				//Get options for Variables select-control
				loadVariables("#ncvarSelect"+mapId, mapId); 
				//Get options for Timepositions select-control
				loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
				
				showLayerOnMap(mapId);
			},
			error: function() {
				//reset controls if there is a problem with the wms request
				resetControls(mapId);
			}
		});
	}
	else {
		resetControls(mapId);
	}
}

/** @function
 * GetFileList request for a given directory
 * @name wmsGetFileList
 * @param {string} url - Specifies the directory on the pydap server */
function wmsGetFileList(url) {
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
			wmsGetCapabilities('A');
			wmsGetCapabilities('B');
		}
	});
}

/** @function
 * Show WMSLayer either as map overlay or as separate map
 * @name showLayerOnMap
 * @param {string} mapId - Specifies which map data are to be shown */
function showLayerOnMap(mapId) {
	// show data on separate map
	if(mapId == 'A' || $("#btn_separateMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId,mapId);
	}
	// show data as overlay on MapA
	else if($("#btn_overlayMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId,'A');
	}
}

/** @function
 * Clear the select controls
 * @name myFunction 
 * @param {string} mapId - Map tab where the controls needs to be reset */
function resetControls(mapId) {
	CAPABILITIES[mapId] = "";
	loadVariables("#ncvarSelect"+mapId, mapId);
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
}

/** @function
 * Set netcdf variables select control options
 * @name myFunction 
 * @param {string} ncvar_ctrl - Control-Id of the variables SELECT
 * @param {string} mapId - Map tab where the variables SELECT gets loaded */
function loadVariables(ncvar_ctrl, mapId) {
	$(ncvar_ctrl).empty();
	//read layer information
	if(CAPABILITIES[mapId].capability && CAPABILITIES[mapId].capability.layers) {
		for (var l in CAPABILITIES[mapId].capability.layers) {
			var o = new Option(CAPABILITIES[mapId].capability.layers[l].title, l);
			$(o).html(CAPABILITIES[mapId].capability.layers[l].title);
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
 * @name myFunction 
 * @param {string} time_ctrl - Control-Id of the timepositions SELECT
 * @param {string} ncvar_ctrl - Control-Id of the variables SELECT
 * @param {string} mapId - Map tab where the timepositions SELECT gets loaded */
function loadTimepositions(time_ctrl, ncvar_ctrl, mapId) {
	$(time_ctrl).empty();
	var ncvar = $(ncvar_ctrl).val();
	//read the layers time information
	if(CAPABILITIES[mapId].capability && CAPABILITIES[mapId].capability.layers) {
		var layer = CAPABILITIES[mapId].capability.layers[ncvar];
		if (layer && layer.dimensions.time) {
			for (var t in layer.dimensions.time.values) {
				var o = new Option(layer.dimensions.time.values[t], layer.dimensions.time.values[t]);
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

function resize() {
	resizeMapDiv('#mapA');
	resizeMapDiv('#mapB');
	resizeMapDiv('#splitcontainer');
	resizeMapDiv('.left_panel');
	resizeMapDiv('.right_panel');
	
	maps['A'].updateSize();
	maps['A'].zoomToMaxExtent();
    maps['A'].zoomIn();
    maps['B'].updateSize();
	maps['B'].zoomToMaxExtent();
    maps['B'].zoomIn();
}

$(document).ready(function(){
	//Load all maps, but initially hide MapB
	$("#cb_linkAB").attr("checked", false);
	initMap('A');
	initMap('B');
	$('#mapB').hide();
	
	//Get Pydap handled files for requested url and add to WMS Select
	wmsGetFileList("http://127.0.0.1:8001/");
	resize();
	window.onresize = resize;
});

