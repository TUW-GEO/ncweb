/**
 * @file Core file. Manages data provisioning (requests and controls)
 * @author Markus Pöchtrager
 */

function IPFDataViewer(serverurl) {

//	if (window.jQuery) {
//		alert("JQuery loaded ");
//		alert("version: "+$.fn.jquery)
//	} else {
//    	alert("no JQuery");
//	}

	
	this.maps = {};
	
	this.ViewStates = Object.freeze({"disabled":0, "overlay_top":1, "overlay_bottom":2, "separate":3});
	
	
	
	//deactivate all map options
	$("#cb_linkABgeo").attr("checked", false);
	$("#cb_linkABtemp").attr("checked", false);
	$("#cb_linkABmarker").attr("checked", false);
	$("#cb_getTS").attr("checked", false);
	$( "#linkMapsCtrlGroup_mapB" ).hide();
	$(".ctrlLabel").hide();
	$( "#linkMapsCtrlGroup_mapB" ).mouseenter(function() {
		$(".ctrlLabel").show();
	}).mouseleave(function() {
		$(".ctrlLabel").hide();
	});
	
	//Initialize custom click control
	initClickCtrl();
	
	this.maps.A = new IPFMap("A",'#mapA');
	this.maps.A.initMap();
	
	this.maps.B = new IPFMap("B",'#mapB');
	this.maps.B.initMap();
	$('#mapB').hide();
	
	var _self = this;
	$("#opacityslider-A").slider({
		min: 0,
		max: 100,
		range: "min",
		step: 5,
		value: 80,
		slide: function(slideEvt, ui) {
			_self.maps.A.setWMSOpacity(_self.maps.A, ui.value);
		}
	});
	$("#opacityslider-B").slider({
		min: 0,
		max: 100,
		range: "min",
		step: 5,
		value: 80,
		slide: function(slideEvt, ui) {
			_self.maps.B.setWMSOpacity(_self.maps.B, ui.value);
		}
	});
	
	//Get Pydap handled files for requested url and add to WMS Select

	this.GetWMSFileList(serverurl);
	this.ncwebResize();
	
}

/** @function
 * GetFileList request for a given directory
 * @name GetWMSFileList
 * @param {string} url - Specifies the directory for thredds-crawler */
IPFDataViewer.prototype.GetWMSFileList = function(surl) {
	console.log("In IPFDataViewer.prototype.GetWMSFileList = function(url) url= "+surl);
	var mapA = this.maps["A"];
	var mapB = this.maps["B"];
	var ipfdv = this;

	$.ajax({
        type: "GET",
		url: '/wms/GetFileList?url='+surl,
		dataType: "json",
		success: function(json) {
			$("#wmsSelectA").empty();
			$("#wmsSelectB").empty();
			for (var f in json.files) {
				var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
				console.log("list A: "+json.files[f].name+" "+json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
				$(o).html(json.files[f].name);
				$("#wmsSelectA").append(o);

				var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
				$(o).html(json.files[f].name);
				$("#wmsSelectB").append(o);
			}
			ipfdv.GetWMSCapabilities(mapA);
			ipfdv.GetWMSCapabilities(mapB);
		}
	});
}

IPFDataViewer.prototype.GetMarried = function() {

	var a = "AJAX";
	var b = "Python";
//	alert("/love?b="+b);
	alert("Wedding Bells ding dong ding dong! ");
	$.ajax({
		type: 'GET',
		url: '/love?a='+a+'&b='+b,
//		data: {'b': b}
		success: function(json){
			alert("Here is the result: "+json.results);
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
	console.log("in IPFDataViewer.prototype.GetWMSCapabilities map="+map);
	console.log("req_url: "+req_url);
	if (req_url) {
		$.ajax({
	        type: "GET",
			url: req_url,
			dataType: "xml",
			success: function(xml) {
				var wmsCapabilities = new OpenLayers.Format.WMSCapabilities();
				map.Capabilities = wmsCapabilities.read(xml);
				console.log("map.Capabilities "+map.Capabilities)

				for (var i=0; i<$(xml).find("Layer").length; i++) {
					console.log("Layer "+i+" in XML")
					if($(xml).find("Layer").eq(i).find("ActualRange").length>0 //Got Actual Range in child node
							&& $(xml).find("Layer").eq(i).find("Layer").length == 0) { //Got no Layer-Node in child nodes
						console.log("Got ActualRange in child node and no Layer-Node in child nodes")
						var guess = false;
						if ($(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("guess")==true) {
							guess = true;
						}
						map.Capabilities.capability.layers.filter(function(obj) { // Write actualrange to capabilities
							return obj.name ==$(xml).find("Layer").eq(i).children("Name")[0].innerHTML;
						})[0].actualrange = [$(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("min"),$(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("max"),guess];
					}
				}

				//Get options for Variables select-control
				ipfdv.loadVariables("#ncvarSelect"+map.MapName, map);
				console.log("LoadVariables");
				console.log("#ncvarSelect"+map.MapName);
				//Get options for Timepositions select-control
				ipfdv.loadTimepositions("#timeSelect"+map.MapName, "#ncvarSelect"+map.MapName, map);
				console.log("loadTimepositions");
				setColorbarRangeValues(map, map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name);
				console.log("setColorbarRageValues map="+map+" ncvar="+map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name+" time="+$("#timeSelect"+map.MapName).val());
				ipfdv.showLayerOnMap(map,true);
			},
			error: function() {
				//reset controls if there is a problem with the wms request
				alert("Problem with WMS request! map: "+map.MapName);
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
			console.log($(ncvar_ctrl));
		}
	}
	if ($(ncvar_ctrl)[0] && $(ncvar_ctrl)[0].length>1) {
		$(ncvar_ctrl).removeAttr("disabled");
	}
	else {
		$(ncvar_ctrl).attr('disabled', true);
	}
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
	
	var selectValue = -1;
	var minDateDiff = -1;
		
	//read the layers time information
	if(map.Capabilities.capability && map.Capabilities.capability.layers) {
		var layer = map.Capabilities.capability.layers[ncvar];
		if (layer && layer.dimensions.time) {
			for (var t in layer.dimensions.time.values) {
				var o = new Option(layer.dimensions.time.values[t],layer.dimensions.time.values[t]);

				$(o).html(layer.dimensions.time.values[t]);
				$(time_ctrl).append(o);
				
				// get the time next to map.Date
				if(minDateDiff > Math.abs(map.Date - new Date(layer.dimensions.time.values[t])) || minDateDiff < 0) {
					minDateDiff = Math.abs(map.Date - new Date(layer.dimensions.time.values[t]));
					selectValue = layer.dimensions.time.values[t];
				}
			}
			$(time_ctrl).val(selectValue);

		}

		var time_start = moment(layer.dimensions.time.values[0]).format("YYYY-MM-DD");
   		var time_end = moment(layer.dimensions.time.values.pop()).format("YYYY-MM-DD");
   		console.log('newPicker '+time_start+" "+time_end);
		newPicker(time_start,time_end);
		$(time_ctrl).trigger("change");
	}
	if ($(time_ctrl)[0] && $(time_ctrl)[0].length>1) {
		$(time_ctrl).removeAttr("disabled");
		map.TempLinkEvent();
	}
	else {
		$(time_ctrl).attr('disabled', true);
	}
}

//IPFDataViewer.prototype.getMinMaxTime = function(map){
//	var ncvar = 'sm';
//	if(map.Capabilities.capability && map.Capabilities.capability.layers) {
//		var layer = map.Capabilities.capability.layers[ncvar];
//		min = layer.dimensions.time.values[0];
//		max = layer.dimensions.time.values.pop();
// 		console.log("in getMinMaxTime "+layer.dimensions.time.values[0]+layer.dimensions.time.values.pop());
//	}
//
//	return [min, max];
//}

/** @function
 * Show WMSLayer either as map overlay or as separate map
 * @name showLayerOnMap
 * @param {boolean} reloadTS - Reload the TimeSeries Dygraph if True */
IPFDataViewer.prototype.showLayerOnMap = function(map, reloadTS, manualScale) {

	console.log("showLayerOnMap");

	ncvar=map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name;

	req_url=$("#wmsSelect"+map.MapName).val().split("?")[0]+"?item=minmax&layers="+
			ncvar+"&bbox=-180%2C-90%2C180%2C90&elevation=0&time="+$("#timeSelect"+map.MapName).val()+
			"&srs=EPSG%3A4326&width=256&height=256&request=GetMetadata";

	if(manualScale==true){
		console.log("Scale changed manually");
		console.log("min="+$("#tbMin_map"+map.MapName).val()+" max="+$("#tbMax_map"+map.MapName).val());
		map.Capabilities.capability.layers.filter(function(obj) {
			return obj.name == ncvar;
		})[0].actualrange = [$("#tbMin_map"+map.MapName).val(), $("#tbMax_map"+map.MapName).val(), true];



		setColorbarRangeValues(map, map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name);
		// @TODO: Only works with MapA and MapB
		var onTop = false;
		if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
			onTop = true;
		}

		// show data on separate map
		if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
			map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name,
					$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
					$("#cmapSelect"+map.MapName).val(), map, onTop, reloadTS);
		}

		// show data as overlay on MapA
		else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
				map.ViewState == IPFDV.ViewStates.overlay_bottom) {
			map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name,
					$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
					$("#cmapSelect"+map.MapName).val(), this.maps["A"], onTop, reloadTS);
		}

	}

	else{
		$.ajax({
			type:"GET",
			url:req_url,
			dataType:"json",
			context: this,
			success: function(json){

				map.Capabilities.capability.layers.filter(function(obj) {
					return obj.name == ncvar;
				})[0].actualrange = [json.min, json.max, true];

				console.log("min="+json.min+" max="+json.max);

				setColorbarRangeValues(map, map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name);
				// @TODO: Only works with MapA and MapB
				var onTop = false;
				if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
					onTop = true;
				}

				// show data on separate map
				if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
					map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name,
							$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
							$("#cmapSelect"+map.MapName).val(), map, onTop, reloadTS);
				}

				// show data as overlay on MapA
				else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
						map.ViewState == IPFDV.ViewStates.overlay_bottom) {
					map.showWMSLayer(map.Capabilities.capability.layers[$("#ncvarSelect"+map.MapName).val()].name,
							$("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
							$("#cmapSelect"+map.MapName).val(), this.maps["A"], onTop, reloadTS);
				}
			}
		});
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
	resizeDiv("#mapSettingsContainerDiv_mapA");
	resizeDiv("#showMapSettingsButton_mapA");
	resizeDiv('#splitcontainer');
	resizeDiv('.left_panel');
	resizeDiv('.right_panel');
	
	$("#TimeSeriesContainerDiv_mapA").css('top',$(this.maps.A.MapDivId).height()-210);
	$("#TimeSeriesContainerDiv_mapB").css('top',$(this.maps.B.MapDivId).height()-210);
	$(".mapColorbarContainer").css('top',$(this.maps.A.MapDivId).height()-75);
	$("#TimeSeriesContainerDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
	$("#TimeSeriesContainerDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
	$("#TimeSeriesDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
	$("#TimeSeriesDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
	if(this.maps.A.IPFDyGraph.DyGraph) {
		this.maps.A.IPFDyGraph.DyGraph.resize();
	}
	if(this.maps.B.IPFDyGraph.DyGraph) {
		this.maps.B.IPFDyGraph.DyGraph.resize();
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
 * @name resizeDiv 
 * @param {string} divId - IPFDataViewer as parameter */
var resizeDiv = function(divId) {
	var div = $(divId);
	div.height(($(window).height() - $('#footer').height() - $('.navbar').height() -60));
}
