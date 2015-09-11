/**
 * @file Core file. Manages data provisioning (requests and controls)
 * @author Markus Pöchtrager
 */

function IPFDataViewer(serverurl) {

//	if (window.jQuery) {
//		alert("JQuery loaded ");
//		alert("version: "+$.fn.jquery)
//	} else {
//      alert("no JQuery");
//	}
  console.log("in IPFDataViewer");
//	this.GetWMSFileList(serverurl);
//	console.log("Still here...");

  this.maps = {};
  this.controllers = {};

  this.ViewStates = Object.freeze({"disabled":0, "overlay_top":1, "overlay_bottom":2, "separate":3});



//	//deactivate all map options
//	$("#cb_linkABgeo").attr("checked", false);
//	$("#cb_linkABtemp").attr("checked", false);
//	$("#cb_linkABmarker").attr("checked", false);
//	$("#cb_getTS").attr("checked", false);
//	$( "#linkMapsCtrlGroup_mapB" ).hide();
//	$(".ctrlLabel").hide();
//	$( "#linkMapsCtrlGroup_mapB" ).mouseenter(function() {
//		$(".ctrlLabel").show();
//	}).mouseleave(function() {
//		$(".ctrlLabel").hide();
//	});

  //Initialize custom click control
//	initClickCtrl();

    this.maps.A = new IPFMap("A",'#mapA');
    this.maps.A.initMap();
    this.controllers.A = new MapController(this.maps.A);

    this.maps.B = new IPFMap("B",'#mapB');
    this.maps.B.initMap();
    $('#mapB').hide();
    this.controllers.B = new MapController(this.maps.B);

//	var _self = this;
//	$("#opacityslider-A").slider({
//		min: 0,
//		max: 100,
//		range: "min",
//		step: 5,
//		value: 80,
//		slide: function(slideEvt, ui) {
//			_self.maps.A.setWMSOpacity(_self.maps.A, ui.value);
//		}
//	});
//	$("#opacityslider-B").slider({
//		min: 0,
//		max: 100,
//		range: "min",
//		step: 5,
//		value: 80,
//		slide: function(slideEvt, ui) {
//			_self.maps.B.setWMSOpacity(_self.maps.B, ui.value);
//		}
//	});

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
//			$("#wmsSelectB").empty();
      for (var f in json.files) {
        var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
        console.log("list A: "+json.files[f].name+" "+json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
        $(o).html(json.files[f].name);
        $("#wmsSelectA").append(o);

        var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
        $(o).html(json.files[f].name);
        $("#wmsSelectB").append(o);
      }
      ipfdv.controllers.A.GetWMSCapabilities();
      // ipfdv.GetWMSCapabilities(mapB);
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




//IPFDataViewer.prototype.getMinMaxTime = function(map){
//	var ncvar = 'sm';
//	if(map.Capabilities.capability && map.Capabilities.capability.layers) {
//		var layer = map.Capabilities.capability.layers[ncvar];
//		min = layer.dimensions.time.values[0];
//		max = layer.dimensions.time.values.pop();
//    console.log("in getMinMaxTime "+layer.dimensions.time.values[0]+layer.dimensions.time.values.pop());
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

  ncvar=map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name;

  req_url=$("#wmsSelect"+map.MapName).val().split("?")[0]+"?item=minmax&layers="+
      ncvar+"&bbox=-180%2C-90%2C180%2C90&elevation=0&time="+$("#timeSelect"+map.MapName).val()+
      "&srs=EPSG%3A4326&width=256&height=256&request=GetMetadata";
  console.log(req_url);

  if(manualScale==true){
    console.log("Scale changed manually");
    console.log("min="+$("#tbMin_map"+map.MapName).val()+" max="+$("#tbMax_map"+map.MapName).val());
    map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) {
      return obj.Name == ncvar;
    })[0].actualrange = [$("#tbMin_map"+map.MapName).val(), $("#tbMax_map"+map.MapName).val(), true];



    setColorbarRangeValues(map, map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name);
    // @TODO: Only works with MapA and MapB
    var onTop = false;
//		if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
//			onTop = true;
//		}

    // show data on separate map
    if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
      map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
          $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
          $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
    }

    // show data as overlay on MapA
    else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
        map.ViewState == IPFDV.ViewStates.overlay_bottom) {
      map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
          $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
          $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
    }

  }

  else{
    $.ajax({
      type:"GET",
      url:req_url,
      dataType:"json",
      context: this,
      success: function(json){

                console.log("min="+json.min+" max="+json.max);
                console.log("ncvar: "+ncvar);

        map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) {
          return obj.Name == ncvar;
        })[0].actualrange = [json.min, json.max, true];



        setColorbarRangeValues(map, map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name);
        // @TODO: Only works with MapA and MapB
        var onTop = false;
//				if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
//					onTop = true;
//				}

        // show data on separate map
        if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
          map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
              $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
              $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
        }

        // show data as overlay on MapA
        else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
            map.ViewState == IPFDV.ViewStates.overlay_bottom) {
          map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
              $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
              $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
        }
      }
    });
  }

}


/** @function
 * Resize all Map Controls on windows or div resize
 * @name ncwebResize
 * @param {IPFDataViewer} ipfdv - IPFDataViewer as parameter
 * There is a additional resizeDygraphs()-function in jquery.splitter-0.14.0.js to resize the dygraph div */
IPFDataViewer.prototype.ncwebResize = function() {
  resizeDiv(this.maps.A.MapDivId);
//	resizeDiv(this.maps.B.MapDivId);
  resizeDiv("#mapSettingsContainerDiv_mapA");
//	resizeDiv("#showMapSettingsButton_mapA");
  resizeDiv('#splitcontainer');
  resizeDiv('.left_panel');
  resizeDiv('.right_panel');

//	$("#TimeSeriesContainerDiv_mapA").css('top',$(this.maps.A.MapDivId).height()-210);
////	$("#TimeSeriesContainerDiv_mapB").css('top',$(this.maps.B.MapDivId).height()-210);
////	$(".mapColorbarContainer").css('top',$(this.maps.A.MapDivId).height()-75);
//	$("#TimeSeriesContainerDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
////	$("#TimeSeriesContainerDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
//	$("#TimeSeriesDiv_mapA").css('width',$(this.maps.A.MapDivId).width()-40);
////	$("#TimeSeriesDiv_mapB").css('width',$(this.maps.B.MapDivId).width()-50);
//	if(this.maps.A.IPFDyGraph.DyGraph) {
//		this.maps.A.IPFDyGraph.DyGraph.resize();
//	}
//	if(this.maps.B.IPFDyGraph.DyGraph) {
//		this.maps.B.IPFDyGraph.DyGraph.resize();
//	}

//	this.maps['A'].Map.updateSize();
//	this.maps['A'].Map.zoomToMaxExtent();
//	this.maps['A'].Map.zoomIn();
//	this.maps['B'].Map.updateSize();
//	this.maps['B'].Map.zoomToMaxExtent();
//	this.maps['B'].Map.zoomIn();
}

/** @function
 * Resize the divs to make the document fit 100% (height)
 * @name resizeDiv
 * @param {string} divId - IPFDataViewer as parameter */
var resizeDiv = function(divId) {
  var div = $(divId);
  div.height(($(window).height() - $('#footer').height() - $('.navbar').height() -60));
}
