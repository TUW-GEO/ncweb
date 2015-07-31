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
	//IPFDV.loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, IPFDV.maps[mapId]);
	/*if ($("#timeSelect"+mapId)[0] && $("#timeSelect"+mapId)[0].length>0) {
		IPFDV.maps[mapId].Date = new Date($("#timeSelect"+IPFDV.maps[mapId].MapName).val());
		IPFDV.maps[mapId].TempLinkEvent();
	}*/
	lock=false;
	if($("#lock"+IPFDV.maps[mapId].MapName).val()==="unlock"){lock=true;}
	setColorbarRangeValues(IPFDV.maps[mapId], IPFDV.maps[mapId].Capabilities.capability.layers[$("#ncvarSelect"+mapId).val()].name);
	IPFDV.showLayerOnMap(IPFDV.maps[mapId],true, lock);
}

/** @function
 * Fires when timeSelect option is changed
 * @name timeChanged
 * @param {string} mapId - Defines the map */
function timeChanged(mapId) {
	lock=false;
	if($("#lock"+IPFDV.maps[mapId].MapName).val()==="unlock"){lock=true;}
	IPFDV.showLayerOnMap(IPFDV.maps[mapId],false, lock);
	IPFDV.maps[mapId].Date = new Date($("#timeSelect"+IPFDV.maps[mapId].MapName).val());
	IPFDV.maps[mapId].TempLinkEvent();
}

/** @function
 * Fires when cmapSelect option is changed
 * @name cmapChanged
 * @param {string} mapId - Defines the map */
function cmapChanged(mapId) {
	lock=false;
	if($("#lock"+IPFDV.maps[mapId].MapName).val()==="unlock"){lock=true;}
	IPFDV.showLayerOnMap(IPFDV.maps[mapId],false, lock);
}

/** @function
 * Fires when tbColorbarRange is changed
 * @name cmapScaleChanged
 * @param {string} mapId - Defines the map */
function cmapScaleChanged(mapId) {
	console.log("Scale Changed! "+$("#tbMax_map"+IPFDV.maps[mapId].MapName).val());

	IPFDV.showLayerOnMap(IPFDV.maps[mapId],false,true);
}

/** @function
 * Fires when lock is clicked
 * @name scaleLock
 * @param {string} mapId - Defines the map */
function scaleLock(mapId) {
	console.log("locked! "+$("#lock"+IPFDV.maps[mapId].MapName).val());

	if($("#lock"+IPFDV.maps[mapId].MapName).val()==="lock"){
		$("#lock"+IPFDV.maps[mapId].MapName).val("unlock");
		$("#lock"+IPFDV.maps[mapId].MapName).text("unlock");
		$("#tbMax_map"+IPFDV.maps[mapId].MapName).attr('disabled', 'disabled');
		$("#tbMin_map"+IPFDV.maps[mapId].MapName).attr('disabled', 'disabled');
	}
	else{
		$("#lock"+IPFDV.maps[mapId].MapName).val("lock");
		$("#lock"+IPFDV.maps[mapId].MapName).text("lock");
		$("#tbMax_map"+IPFDV.maps[mapId].MapName).removeAttr('disabled');
		$("#tbMin_map"+IPFDV.maps[mapId].MapName).removeAttr('disabled');
	}


//	IPFDV.showLayerOnMap(IPFDV.maps[mapId],false,true);
}


/** @function
 * 
 * @name setColorbarRangeValues
 * @param {IPFMap} map - Map Object
 * @param {string} ncvar - Specifies the netcdf variable, which is shown
 */
function setColorbarRangeValues(map,ncvar) {
	if(map.Capabilities) {
		var actRange = map.Capabilities.capability.layers.filter(function(obj) {
			return obj.name == ncvar;
		})[0].actualrange;
		if (actRange && actRange.length==3) {
			$("#tbMin_map"+map.MapName).val(actRange[0]);
			$("#tbMax_map"+map.MapName).val(actRange[1]);
			$("#tbMin_map"+map.MapName).css("display","unset");
			$("#tbMax_map"+map.MapName).css("display","unset");
		}
		else {
			$("#tbMin_map"+map.MapName).val("");
			$("#tbMax_map"+map.MapName).val("");
			$("#tbMin_map"+map.MapName).css("display","none");
			$("#tbMax_map"+map.MapName).css("display","none");
		}
	}
}

/** @function
 * Fires when button btn_disableMap is clicked
 * @name disableMap
 * @param {string} mapId - Defines the map */
function disableMap(mapId) {
	var refreshMapA = false;
	$("#mapLabel_mapA_map"+mapId).html("");
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
		return;
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']); //Remove map on target map A
		refreshMapA = true;
		$("#btn_overlayTopMap"+mapId).removeClass('active');
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']); //Remove map on target map A
		refreshMapA = true;
		$("#btn_overlayBottomMap"+mapId).removeClass('active');
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		closeDygraph('B');
		$('.left_panel').width('100%');
		$('.right_panel').width('0%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		$( "#linkMapsCtrlGroup_mapB" ).hide();
		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		IPFDV.ncwebResize();
	}
	IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.disabled;
	$("#btn_disableMap"+mapId).addClass('active');
	
	if (refreshMapA) {
		// refresh Dygraph on Map A (if visible)
		if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
				&& IPFDV.maps.A.Markers.markers.length > 0) {
			IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
		}
	}
}

/** @function
 * Fires when button btn_overlayMap is clicked
 * @name addMapAsOverlay
 * @param {string} mapId - Defines the map
 * @param {boolean} onTop - true if Layer should be on top, false if on Bottom */
function addMapAsOverlay(mapId, onTop) {
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top && onTop) {
		return;
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom && !onTop) {
		return;
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
		// remove splitter
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		closeDygraph('B');
		$('.left_panel').width('100%');
		$('.right_panel').width('0%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		$( "#linkMapsCtrlGroup_mapB" ).hide();
		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
		$("#btn_separateMap"+mapId).removeClass('active');
		IPFDV.ncwebResize();
	}
	// show data as overlay on mapA
	IPFDV.maps[mapId].showWMSLayer(IPFDV.maps[mapId].Capabilities.capability.layers[$("#ncvarSelect"+mapId).val()].name, 
			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], 
			$("#cmapSelect"+mapId).val(), IPFDV.maps['A'], onTop, false);
	
	if (onTop) {
		IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.overlay_top;
		$("#btn_overlayTopMap"+mapId).addClass('active');
		if ($("#btn_overlayBottomMap"+mapId).hasClass('active')) {
			$("#btn_overlayBottomMap"+mapId).removeClass('active');
		}
	}
	else {
		IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.overlay_bottom;
		$("#btn_overlayBottomMap"+mapId).addClass('active');
		if ($("#btn_overlayTopMap"+mapId).hasClass('active')) {
			$("#btn_overlayTopMap"+mapId).removeClass('active');
		}
	}
	
	// refresh Dygraph if visible
	if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
			&& IPFDV.maps.A.Markers.markers.length > 0) {
		IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
	}
}

/** @function
 * Fires when button btn_separateMap is clicked
 * @name addMapSeparate
 * @param {string} mapId - Defines the map */
function addMapSeparate(mapId) {
	var refreshMapA = false;
	$("#mapLabel_mapA_map"+mapId).html("");
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
		return;
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']);
		
		refreshMapA = true;
		
		$("#btn_overlayTopMap"+mapId).removeClass('active');
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom) {
		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']);
		
		refreshMapA = true;
		
		$("#btn_overlayBottomMap"+mapId).removeClass('active');
	}
	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	// split screen into two halves
	$('#splitcontainer').split({orientation:'vertical', position: '50%', limit: 100});
	$('.left_panel').width('50%');
	$('.right_panel').width('50%');
	//$('.right_panel').css('left','50%');
	$('.vsplitter').css('left','50%');
	$('.vsplitter').css('background-color','#FFF');
	$('.vsplitter').show();
	$('#map'+mapId).show();
	$( "#linkMapsCtrlGroup_mapB" ).show();
	IPFDV.ncwebResize();
	// show data on separate map (mapId)
	IPFDV.maps[mapId].showWMSLayer(IPFDV.maps[mapId].Capabilities.capability.layers[$("#ncvarSelect"+mapId).val()].name, 
			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], 
			$("#cmapSelect"+mapId).val(), IPFDV.maps[mapId], false, false);
	
	IPFDV.maps[mapId].Map.setCenter(new OpenLayers.LonLat(0,0));
	IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
	
	IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.separate;
	$("#btn_separateMap"+mapId).addClass('active');
	
	if (refreshMapA) {
		// refresh Dygraph on Map A (if visible)
		if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
				&& IPFDV.maps.A.Markers.markers.length > 0) {
			IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
		}
	}
	
	// show Dygraph if visible on Map A
	if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
			&& IPFDV.maps.A.Markers.markers.length > 0) {
		IPFDV.maps[mapId].IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
	}
}

/** @function
 * Handles the click event for the map link checkbox
 * @name toggleMapLink
 * @param {string} mapId1 - Defines the target map 
 * @param {string} mapId2 - Defines the source map 
 * @param {string} type - "geo", "temp" or "marker" for geographic/temporal/marker linking */
function toggleMapLink(mapId1, mapId2, type) {
	if(type=="geo") {
		if($("#cb_linkABgeo").is(':checked')) {
			IPFDV.maps[mapId1].registerGeoLinkEvent(IPFDV.maps[mapId2],true);
			IPFDV.maps[mapId2].registerGeoLinkEvent(IPFDV.maps[mapId1],true);
		}
		else {
			IPFDV.maps[mapId1].registerGeoLinkEvent(IPFDV.maps[mapId2],false);
			IPFDV.maps[mapId2].registerGeoLinkEvent(IPFDV.maps[mapId1],false);
		}
	}
	else if(type=="temp") {
		if($("#cb_linkABtemp").is(':checked')) {
			// Set to MapA-Value
			if ($("#timeSelect"+IPFDV.maps[mapId1].MapName)[0] && $("#timeSelect"+IPFDV.maps[mapId1].MapName)[0].length>1) {
				IPFDV.maps[mapId1].Date = new Date($("#timeSelect"+IPFDV.maps[mapId1].MapName).val());
				IPFDV.maps[mapId2].Date = new Date($("#timeSelect"+IPFDV.maps[mapId1].MapName).val());
			}
			// If MapA does not have a time position
			else if ($("#timeSelect"+IPFDV.maps[mapId2].MapName)[0] && $("#timeSelect"+IPFDV.maps[mapId2].MapName)[0].length>1) {
				IPFDV.maps[mapId1].Date = new Date($("#timeSelect"+IPFDV.maps[mapId2].MapName).val());
				IPFDV.maps[mapId2].Date = new Date($("#timeSelect"+IPFDV.maps[mapId2].MapName).val());
			}
			// If MapA and MapB don't have time positions, set Today
			else {
				IPFDV.maps[mapId1].Date = new Date();
				IPFDV.maps[mapId2].Date = new Date();
			}
			// Register Event
			IPFDV.maps[mapId1].registerTempLinkEvent(IPFDV.maps[mapId2],true);
			IPFDV.maps[mapId2].registerTempLinkEvent(IPFDV.maps[mapId1],true);
		}
		else {
			// Unregister Event
			IPFDV.maps[mapId1].registerTempLinkEvent(IPFDV.maps[mapId2],false);
			IPFDV.maps[mapId2].registerTempLinkEvent(IPFDV.maps[mapId1],false);
		}
	}
	else if(type=="marker") {
		if ($("#cb_linkABmarker").is(':checked') && IPFDV.maps[mapId2].ViewState == IPFDV.ViewStates.separate) {
			if ($('#TimeSeriesContainerDiv_map' + mapId1).is(':visible')
					&& IPFDV.maps[mapId1].Markers.markers.length > 0) {
				IPFDV.maps[mapId2].IPFDyGraph.showDyGraph(IPFDV.maps[mapId1].Markers.markers[0].lonlat);
			}
			else if ($('#TimeSeriesContainerDiv_map' + mapId2).is(':visible')
					&& IPFDV.maps[mapId2].Markers.markers.length > 0) {
				IPFDV.maps[mapId1].IPFDyGraph.showDyGraph(IPFDV.maps[mapId2].Markers.markers[0].lonlat);
			}
		}
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

/** @function
 * Toogles the Map Settings Control
 * @name toggleCtrl
 * @param {string} mapId - Defines the map, where to toggle the div */
function toggleCtrl(mapId) {
	$('#mapSettingsContainerDiv_map'+mapId).toggle('slide', {
	    direction: 'left'
	}, 1000);
}

//function openCalendar(){
//	console.log("openCalendar")
//	new DatePicker('.date_toggled', {
//		pickerClass: 'datepicker_dashboard',
//		allowEmpty: true,
//		toggleElements: '.date_toggler'
//	});
//}
//
//$('#sandbox-container .input-daterange').datepicker({
//    format: "yyyy-mm-dd",
//    defaultViewDate: { year: 1977, month: 04, day: 25 }
//    });


$(function() {

    function cb(start, end) {
        $('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
    }
    cb(moment().subtract(29, 'days'), moment());

    $('#reportrange').daterangepicker({
    	"startDate": "01/01/1992",
    	"endDate": "03/01/1992",
    	"minDate": "01/01/1992",
    	"maxDate": "01/01/2013",
    	"drops": "up",

        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

});