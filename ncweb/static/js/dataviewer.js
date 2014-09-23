var CAPABILITIES = new Array();

function wmsRequest(mapId) {
	var req_url = $("#wmsSelect"+mapId).val();
	if (req_url) {
		$.ajax({
	        type: "GET",
			url: req_url,
			dataType: "xml",
			success: function(xml) {
				var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
				CAPABILITIES[mapId] = wmsCapabilities.read(xml);
					
				loadVariables("#ncvarSelect"+mapId, mapId);
				loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
				if(mapId == 'A' || $("#btn_seperateMap"+mapId).hasClass('active') == true) {
					showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,mapId);
				}
				else if(mapId != 'A' && $("#btn_overlayMap"+mapId).hasClass('active') == true) {
					showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,'A');
				}
			},
			error: function() {
				resetControls(mapId);
			}
		});
	}
	else {
		resetControls(mapId);
	}
}

function resetControls(mapId) {
	CAPABILITIES[mapId] = "";
	loadVariables("#ncvarSelect"+mapId, mapId);
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
}

function loadVariables(ncvar_ctrl, mapId) {
	$(ncvar_ctrl).empty();
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

function wmsChanged(mapId) {
	wmsRequest(mapId);
}

function ncvarChanged(mapId) {
	loadTimepositions("#timeSelect"+mapId, "#ncvarSelect"+mapId, mapId);
	
	if(mapId == 'A' || $("#btn_seperateMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,mapId);
	}
	else if(mapId != 'A' && $("#btn_overlayMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,'A');
	}
}

function timeChanged(mapId) {
	if(mapId == 'A' || $("#btn_seperateMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,mapId);
	}
	else if(mapId != 'A' && $("#btn_overlayMap"+mapId).hasClass('active') == true) {
		showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId,'A');
	}
}

function disableMap(mapId) {
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		removeWMSLayer(mapId, 'A');
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_seperateMap"+mapId).hasClass('active')) {
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		$('.left_panel').width('100%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		$("#btn_seperateMap"+mapId).removeClass('active');
	}
	$("#btn_disableMap"+mapId).addClass('active');
}

function addMapAsOverlay(mapId) {
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	if ($("#btn_seperateMap"+mapId).hasClass('active')) {
		$('#splitcontainer').split({orientation:'vertical', position: '100%'});
		$('#mapB').hide();
		$('.left_panel').width('100%');
		$('.vsplitter').css('left','100%');
		$('.vsplitter').hide();
		$("#btn_seperateMap"+mapId).removeClass('active');
	}
	
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId, 'A');
	$("#btn_overlayMap"+mapId).addClass('active');
}

function addMapSeperate(mapId) {
	if ($("#btn_seperateMap"+mapId).hasClass('active')) {
		return;
	}
	if ($("#btn_overlayMap"+mapId).hasClass('active')) {
		removeWMSLayer(mapId, 'A');
		$("#btn_overlayMap"+mapId).removeClass('active');
	}
	if ($("#btn_disableMap"+mapId).hasClass('active')) {
		$("#btn_disableMap"+mapId).removeClass('active');
	}
	
	$('#splitcontainer').split({orientation:'vertical', position: '50%', limit: 100});
	$('.left_panel').width('50%');
	$('.vsplitter').css('left','50%');
	$('.vsplitter').show();
	$('#map'+mapId).show();
	showWMSLayer(CAPABILITIES[mapId].capability.layers[$("#ncvarSelect"+mapId).val()].name, $("#timeSelect"+mapId).val(), $("#wmsSelect"+mapId).val().split("?")[0], mapId, mapId);
	$("#btn_seperateMap"+mapId).addClass('active');
}

$(document).ready(function(){
	initMap('A');
	initMap('B');
	$('#mapB').hide();
	
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
			wmsRequest('A');
			wmsRequest('B');
		}
	});
});

