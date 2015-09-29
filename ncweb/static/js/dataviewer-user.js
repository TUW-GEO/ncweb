/**
 * @file All the user interactions are handled here
 * @author Markus Pöchtrager
 */



/** @function
 * Fires when button btn_disableMap is clicked
 * @name disableMap
 * @param {string} mapId - Defines the map */
//function disableMap(mapId) {
//	var refreshMapA = false;
//	$("#mapLabel_mapA_map"+mapId).html("");
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
//		return;
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top) {
//		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']); //Remove map on target map A
//		refreshMapA = true;
//		$("#btn_overlayTopMap"+mapId).removeClass('active');
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom) {
//		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']); //Remove map on target map A
//		refreshMapA = true;
//		$("#btn_overlayBottomMap"+mapId).removeClass('active');
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
//		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
//		$('#mapB').hide();
//		closeDygraph('B');
//		$('.left_panel').width('100%');
//		$('.right_panel').width('0%');
//		$('.vsplitter').css('left','100%');
//		$('.vsplitter').hide();
//		$( "#linkMapsCtrlGroup_mapB" ).hide();
//		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
//		$("#btn_splitMap"+mapId).removeClass('active');
//		IPFDV.ncwebResize();
//	}
//	IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.disabled;
//	$("#btn_disableMap"+mapId).addClass('active');
//
//	if (refreshMapA) {
//		// refresh Dygraph on Map A (if visible)
//		if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
//				&& IPFDV.maps.A.Markers.markers.length > 0) {
//			IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
//		}
//	}
//}

/** @function
 * Fires when button btn_overlayMap is clicked
 * @name addMapAsOverlay
 * @param {string} mapId - Defines the map
 * @param {boolean} onTop - true if Layer should be on top, false if on Bottom */

//$('#disableMapB').click(function(){
//    console.log("disableMapB");
//});

//$('#overlayTopMapB').click(function(){
//    console.log("overlayTopMapB");
//    IPFDV.controllers.B.GetWMSFileList();
//    IPFDV.controllers.A.changeZindex(0);
//	IPFDV.controllers.B.changeZindex(1);
//
//
//});

//$('#overlayBottomMapB').click(function(){
//    console.log("overlayBottomMapB");
//	IPFDV.controllers.A.changeZindex(1);
//	IPFDV.controllers.B.changeZindex(0);
//
//});
//
//$('#separateMapB').click(function(){
//    console.log("separateMapB");
//});

//function addMapAsOverlay(mapId, zindex) {
//	console.log("addMapAsOverlay");
//
//    IPFDV.controllers[mapId].GetWMSFileList();

//	IPFDV.controllers[mapId].layerBitch();

//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top && onTop) {
//		return;
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom && !onTop) {
//		return;
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
//		$("#btn_disableMap"+mapId).removeClass('active');
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
//		// remove splitter
//		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
//		$('#mapB').hide();
//		closeDygraph('B');
//		$('.left_panel').width('100%');
//		$('.right_panel').width('0%');
//		$('.vsplitter').css('left','100%');
//		$('.vsplitter').hide();
//		$( "#linkMapsCtrlGroup_mapB" ).hide();
//		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
//		$("#btn_separateMap"+mapId).removeClass('active');
//		IPFDV.ncwebResize();
//	}
	// show data as overlay on mapA
//	IPFDV.maps.A.showWMSLayer(IPFDV.maps[mapId].Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+mapId).val()].Name,
//			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0],
//			$("#cmapSelect"+mapId).val(), div_side, false);
//
//	if (onTop) {
//		IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.overlay_top;
//		$("#btn_overlayTopMap"+mapId).addClass('active');
//		if ($("#btn_overlayBottomMap"+mapId).hasClass('active')) {
//			$("#btn_overlayBottomMap"+mapId).removeClass('active');
//		}
//	}
//	else {
//		IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.overlay_bottom;
//		$("#btn_overlayBottomMap"+mapId).addClass('active');
//		if ($("#btn_overlayTopMap"+mapId).hasClass('active')) {
//			$("#btn_overlayTopMap"+mapId).removeClass('active');
//		}
//	}
//
	// refresh Dygraph if visible
//	if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
//			&& IPFDV.maps.A.Markers.markers.length > 0) {
//		IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
//	}
//}

/** @function
 * Fires when button btn_separateMap is clicked
 * @name addMapSeparate
 * @param {string} mapId - Defines the map */
//function addMapSeparate(mapId) {
//	var refreshMapA = false;
//	$("#mapLabel_mapA_map"+mapId).html("");
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.separate) {
//		return;
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_top) {
//		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']);
//
//		refreshMapA = true;
//
//		$("#btn_overlayTopMap"+mapId).removeClass('active');
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.overlay_bottom) {
//		IPFDV.maps[mapId].removeWMSLayer(IPFDV.maps['A']);
//
//		refreshMapA = true;
//
//		$("#btn_overlayBottomMap"+mapId).removeClass('active');
//	}
//	if (IPFDV.maps[mapId].ViewState == IPFDV.ViewStates.disabled) {
//		$("#btn_disableMap"+mapId).removeClass('active');
//	}
//	// split screen into two halves
//	$('#splitcontainer').split({orientation:'vertical', position: '50%', limit: 100});
//	$('.left_panel').width('50%');
//	$('.right_panel').width('50%');
//	//$('.right_panel').css('left','50%');
//	$('.vsplitter').css('left','50%');
//	$('.vsplitter').css('background-color','#FFF');
//	$('.vsplitter').show();
//	$('#map'+mapId).show();
//	$( "#linkMapsCtrlGroup_mapB" ).show();
//	IPFDV.ncwebResize();
//	// show data on separate map (mapId)
//	IPFDV.maps[mapId].showWMSLayer(IPFDV.maps[mapId].Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+mapId).val()].Name,
//			$("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0],
//			$("#cmapSelect"+mapId).val(), IPFDV.maps[mapId], false, false);
//
//	IPFDV.maps[mapId].Map.setCenter(new OpenLayers.LonLat(0,0));
//	IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
//
//	IPFDV.maps[mapId].ViewState = IPFDV.ViewStates.separate;
//	$("#btn_splitMap"+mapId).addClass('active');
//
//	if (refreshMapA) {
//		// refresh Dygraph on Map A (if visible)
//		if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
//				&& IPFDV.maps.A.Markers.markers.length > 0) {
//			IPFDV.maps.A.IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
//		}
//	}
//
//	// show Dygraph if visible on Map A
//	if ($('#TimeSeriesContainerDiv_map' + IPFDV.maps.A.MapName).is(':visible')
//			&& IPFDV.maps.A.Markers.markers.length > 0) {
//		IPFDV.maps[mapId].IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
//	}
//}

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
				console.log("Set to MapA time value "+$("#timeSelect"+IPFDV.maps[mapId1].MapName).val());
				IPFDV.maps[mapId1].Date = new Date($("#timeSelect"+IPFDV.maps[mapId1].MapName).val());
				IPFDV.maps[mapId2].Date = new Date($("#timeSelect"+IPFDV.maps[mapId1].MapName).val());
			}
			// If MapA does not have a time position
			else if ($("#timeSelect"+IPFDV.maps[mapId2].MapName)[0] && $("#timeSelect"+IPFDV.maps[mapId2].MapName)[0].length>1) {
				console.log("Set to MapB time value "+$("#timeSelect"+IPFDV.maps[mapId2].MapName).val());
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
//function toggleCtrl(mapId) {
//	$('#mapSettingsContainerDiv_map'+mapId).toggle('slide', {
//	    direction: 'left'
//	}, 1000);
//}

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
//
function getDefaultStart(mapId){
	var time = moment($("#timeSelect"+IPFDV.maps[mapId].MapName).val()).subtract(20, 'days');
    var time_start = moment(time).format("YYYY-MM-DD");
    console.log("Selcected date: "+time._i);
	return time_start;
}
function getDefaultEnd(mapId){
	var time = moment($("#timeSelect"+IPFDV.maps[mapId].MapName).val()).add(29, 'days');
    var time_end = moment(time).format("YYYY-MM-DD");
    console.log("Selcected date: "+time._i);
	return time_end;
}

//$(function() {
////function chooseDate(mapId) {
//	var t = $(this);
//
//    function cb(start, end) {
//        $('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
//    }
//    cb(getDefaultRange($('#reportrange').attr('mapId')).time_start, getDefaultRange($('#reportrange').attr('mapId')).time_end);
////  	cb(moment().subtract(29, 'days'), moment());
//  	console.log($('#reportrange').attr('mapId'));
//
////
//
////	var time_start = new Date(time);
////	time_start.setDate(time_start.getDate() -days);
//
////	time_start = time_start.format("mm/dd/yyyy");
////	console.log(time_start);
////	var time_end = new Date(time);
////	time_end.setDate(time.getDate() +days);
////	time_end = time_end.format("mm/dd/yyyy");
//
//
//    $('#reportrange').daterangepicker({
//
//        ranges: {
//           'Today': [moment(), moment()],
//           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
//           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
//           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
//           'This Month': [moment().startOf('month'), moment().endOf('month')],
//           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
//        }
//    }, cb);
//
////}
//});
//function newPicker(minDate, maxDate){
$(function() {
//	alert("hi im here "+$('#daterange').attr('mapId'));
    $('#daterange').daterangepicker({
        "locale": {
        "format": "YYYY-MM-DD",
        "separator": " - ",
//        "applyLabel": "Apply",
        "cancelLabel": "Cancel",
        "fromLabel": "From",
        "toLabel": "To",
        "customRangeLabel": "Custom",
        "daysOfWeek": [
            "Su",
            "Mo",
            "Tu",
            "We",
            "Th",
            "Fr",
            "Sa"
        ],
        "monthNames": [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        "firstDay": 1
    },
    "startDate": getDefaultStart($('#daterange').attr('mapId')),
    "endDate": "2015-04-24",
    "minDate": "2000-12-12",
    "maxDate": "2015-05-05",
    "drops": "up"
    });
    $('#daterange').on('showCalendar.daterangepicker', function(ev, picker){
    	console.log("in showCalendar.daterangepicker "+picker+" "+ev);
    });
    $('#daterange').on('show.daterangepicker', function(ev, picker){
//    	$('#daterange').data('daterangepicker').setStartDate(getDefaultStart($('#daterange').attr('mapId')));
//		$('#daterange').data('daterangepicker').setEndDate(getDefaultEnd($('#daterange').attr('mapId')));
    	console.log("in show.daterangepicker "+getDefaultStart($('#daterange').attr('mapId'))+" "+getDefaultEnd($('#daterange').attr('mapId')));
    });
    $('#daterange').on('apply.daterangepicker', function(ev, picker){
    	console.log("in apply.daterangepicker"+picker+" "+ev);

    });

//}
});

/** @function
 * Deletes instance of daterangepicker and creates new one with set min and max date
 * @name newPicker
 * @param {Date,Date} min max - Defines min and max Date for the new daterangepicker */
function newPicker(min, max){
	console.log("newPicker");
	if($('#daterange').data('daterangepicker')){
		$('#daterange').data('daterangepicker').remove();
		}
	$('#daterange').daterangepicker({
        "locale": {
        "format": "YYYY-MM-DD"
    	},

    "minDate": min,
    "maxDate": max,
    "drops": "up"
    });
    $('#daterange').on('apply.daterangepicker', function(ev, picker){

    	console.log("in apply.daterangepicker "+$('#daterange').attr('mapId'));
    	console.log(picker.startDate.format('YYYY-MM-DD'));
    	console.log(picker.endDate.format('YYYY-MM-DD'));
		console.log($("#daterange").val());

		IPFDV.maps[$('#daterange').attr('mapId')].IPFDyGraph.showDyGraph(IPFDV.maps.A.Markers.markers[0].lonlat);
    });
}
