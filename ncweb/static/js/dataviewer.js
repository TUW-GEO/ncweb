var CAPABILITIES = new Array();

function wmsGetCapabilities(mapId) {
	//GetCapabilities request for selected pydap handled file
	var req_url = $("#wmsSelect"+mapId).val();
	if (req_url) {
		$.ajax({
	        type: "GET",
			url: req_url,
			dataType: "xml",
			success: function(xml) {
				var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
				CAPABILITIES[mapId] = wmsCapabilities.read(xml);
				
				//Get options for Variables Select
				loadVariables("#ncvarSelect"+mapId, mapId); 
				//Get options for Timepositions Select
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

function resetControls(mapId) {
	CAPABILITIES[mapId] = "";
	loadVariables("#ncvarSelect"+mapId, mapId);
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
}

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

$(document).ready(function(){
	//Load all maps, but initially hide MapB
	initMap('A');
	initMap('B');
	$('#mapB').hide();
	
	//Get Pydap handled files for requested url and add to WMS Select
	$.ajax({
        type: "GET",
		url: "http://127.0.0.1:8001/?REQUEST=GetFileList",
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
});

