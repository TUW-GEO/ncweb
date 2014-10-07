/**
 * @file All the user interactions are handled here
 * @author Markus Pöchtrager
 */

/** @function
 * Fires when wmsSelect option is changed
 * @name wmsChanged
 * @param {string} mapId - Defines the map */
function wmsChanged(mapId) {
	IPFDV.GetWMSCapabilities(IPFDV.maps[mapId]);
}

/** @function
 * Fires when ncvarSelect option is changed
 * @name ncvarChanged
 * @param {string} mapId - Defines the map */
function ncvarChanged(mapId) {
	IPFDV.loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, IPFDV.maps[mapId]);
	IPFDV.showLayerOnMap(IPFDV.maps[mapId]);
}

/** @function
 * Fires when timeSelect option is changed
 * @name timeChanged
 * @param {string} mapId - Defines the map */
function timeChanged(mapId) {
	IPFDV.showLayerOnMap(IPFDV.maps[mapId]);
}

/** @function
 * Fires when cmapSelect option is changed
 * @name cmapChanged
 * @param {string} mapId - Defines the map */
function cmapChanged(mapId) {
	IPFDV.showLayerOnMap(IPFDV.maps[mapId]);
}

/** @function
 * Fires when button btn_disableMap is clicked
 * @name disableMap
 * @param {string} mapId - Defines the map */
function disableMap(mapId) {
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']); //Remove map on target map A
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_separateMap"+mapId).hasClass('active')) {
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		$('.left_panel').width('100%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		IPFDV.ncwebResize();
	}
	$("#btn_disableMap"+mapId).addClass('active');
}

/** @function
 * Fires when button btn_overlayMap is clicked
 * @name addMapAsOverlay
 * @param {string} mapId - Defines the map */
function addMapAsOverlay(mapId) {
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	if ($("#btn_separateMap"+mapId).hasClass('active')) {
		// remove splitter
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		$('.left_panel').width('100%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		IPFDV.ncwebResize();
	}
	// show data as overlay on mapA
	IPFDV.maps[mapId].showWMSLayer(IPFDV.maps[mapId].Capabilities.capability.layers[$("#ncvarSelect"+mapId).val()].name, 
			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], 
			$("#cmapSelect"+mapId).val(), IPFDV.maps['A']);
	$("#btn_overlayMap"+mapId).addClass('active');
}

/** @function
 * Fires when button btn_separateMap is clicked
 * @name addMapSeparate
 * @param {string} mapId - Defines the map */
function addMapSeparate(mapId) {
	if ($("#btn_separateMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']);
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	// split screen into two halves
	$('#splitcontainer').split({orientation:'vertical', position: '50%', limit: 100});
	$('.left_panel').width('50%');
	//$('.right_panel').css('left','50%');
	$('.vsplitter').css('left','50%');
	$('.vsplitter').css('background-color','#FFF');
	$('.vsplitter').show();
	$('#map'+mapId).show();
	IPFDV.ncwebResize();
	// show data on separate map (mapId)
	IPFDV.maps[mapId].showWMSLayer(IPFDV.maps[mapId].Capabilities.capability.layers[$("#ncvarSelect"+mapId).val()].name, 
			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], 
			$("#cmapSelect"+mapId).val(), IPFDV.maps[mapId]);
	IPFDV.maps[mapId].Map.setCenter(new OpenLayers.LonLat(0,0));
	IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
	$("#btn_separateMap"+mapId).addClass('active');
}

/** @function
 * Handles the click event for the map link checkbox
 * @name toggleMapLink
 * @param {string} mapId1 - Defines the target map 
 * @param {string} mapId2 - Defines the source map */
function toggleMapLink(mapId1, mapId2) {
	if($("#cb_linkAB").is(':checked')) {
		IPFDV.maps[mapId1].registerLinkEvent(IPFDV.maps[mapId2],true);
		IPFDV.maps[mapId2].registerLinkEvent(IPFDV.maps[mapId1],true);
	}
	else {
		IPFDV.maps[mapId1].registerLinkEvent(IPFDV.maps[mapId2],false);
		IPFDV.maps[mapId2].registerLinkEvent(IPFDV.maps[mapId1],false);
	}
}

/** @function
 * Handles the click event for the get timeseries checkbox
 * @name toggleGetTS */
function toggleGetTS() {
	if($("#cb_getTS").is(':checked')) {
		$('#mapA').css('cursor', 'crosshair');
		$('#mapB').css('cursor', 'crosshair');
		IPFDV.maps['A'].registerClickEvent(true);
		IPFDV.maps['B'].registerClickEvent(true);
	}
	else {
		$('#mapA').css('cursor', 'default');
		$('#mapB').css('cursor', 'default');
		IPFDV.maps['A'].registerClickEvent(false);
		IPFDV.maps['B'].registerClickEvent(false);
	}
}

/** @function
 * Handles the click event for closing the Dygraph div
 * @name closeDygraph
 * @param {string} mapId - Defines the map */
function closeDygraph(mapId) {
	$('#TimeSeriesContainerDiv_map'+mapId).hide();
	IPFDV.maps[mapId].Markers.clearMarkers();
}