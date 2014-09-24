// All the user interactions are handled here

function wmsChanged(mapId) {	// wmsSelect option changed
	wmsGetCapabilities(mapId);
}

function ncvarChanged(mapId) {	// ncvarSelect option changed
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
	showLayerOnMap(mapId);
}

function timeChanged(mapId) {	// timeSelect option changed
	showLayerOnMap(mapId);
}

function cmapChanged(mapId) {	// timeSelect option changed
	showLayerOnMap(mapId);
}

function disableMap(mapId) {	// handles btn_disableMap click
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
	}
	$("#btn_disableMap"+mapId).addClass('active');
}

function addMapAsOverlay(mapId) {	// handles btn_overlayMap click
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
	}
	// show data as overlay on mapA
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId, 'A');
	$("#btn_overlayMap"+mapId).addClass('active');
}

function addMapSeparate(mapId) {	// handles btn_separateMap click
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
	// show data on separate map (mapId)
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], $("#cmapSelect"+mapId).val(), mapId, mapId);
	maps[mapId].setCenter(new OpenLayers.LonLat(135,0));
	maps['A'].setCenter(new OpenLayers.LonLat(135,0));
	$("#btn_separateMap"+mapId).addClass('active');
}