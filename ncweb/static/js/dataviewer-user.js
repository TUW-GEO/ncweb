/**
 * @file All the user interactions are handled here
 * @author Markus Pöchtrager
 */

/** @function
 * Fires when wmsSelect option is changed
 * @name wmsChanged
 * @param {string} mapId - Defines the map */
function wmsChanged(mapId) {
	wmsGetCapabilities(mapId);
}

/** @function
 * Fires when ncvarSelect option is changed
 * @name ncvarChanged
 * @param {string} mapId - Defines the map */
function ncvarChanged(mapId) {
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
	showLayerOnMap(mapId);
}

/** @function
 * Fires when timeSelect option is changed
 * @name timeChanged
 * @param {string} mapId - Defines the map */
function timeChanged(mapId) {
	showLayerOnMap(mapId);
}

/** @function
 * Fires when cmapSelect option is changed
 * @name cmapChanged
 * @param {string} mapId - Defines the map */
function cmapChanged(mapId) {
	showLayerOnMap(mapId);
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
		removeWMSLayer(mapId, 'A');
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_separateMap"+mapId).hasClass('active')) {
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		$('.left_panel').width('100%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		maps['A'].setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		resize();
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
		maps['A'].setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		resize();
	}
	// show data as overlay on mapA
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId, 'A');
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
		removeWMSLayer(mapId, 'A');
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	// split screen into two halves
	$('#splitcontainer').split({orientation:'vertical', position: '50%', limit: 100});
	$('.left_panel').width('50%');
	$('.vsplitter').css('left','50%');
	$('.vsplitter').css('background-color','#FFF');
	$('.vsplitter').show();
	$('#map'+mapId).show();
	resize();
	// show data on separate map (mapId)
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId, mapId);
	maps[mapId].setCenter(new OpenLayers.LonLat(0,0));
	maps['A'].setCenter(new OpenLayers.LonLat(0,0));
	$("#btn_separateMap"+mapId).addClass('active');
}

/** @function
 * Handles the click event for the map link checkbox
 * @name toggleMapLink
 * @param {string} mapId1 - Defines the target map 
 * @param {string} mapId2 - Defines the source map */
function toggleMapLink(mapId1, mapId2) {
	if($("#cb_linkAB").is(':checked')) {
		registerLinkEvent(mapId2,mapId1,true);
		registerLinkEvent(mapId1,mapId2,true);
	}
	else {
		registerLinkEvent(mapId1,mapId2,false);
		registerLinkEvent(mapId2,mapId1,false);
	}
}