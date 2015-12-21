/**
 * @file Core file. Manages data provisioning (requests and controls)
 * @author Markus Pöchtrager
 */

function IPFDataViewer(serverurl) {


    console.log("in IPFDataViewer "+serverurl);

    var self = this;

    self.maps = {};
    self.controllers = {};

    self.ViewStates = Object.freeze({"disabled":0, "overlay_top":1, "overlay_bottom":2, "separate":3});



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

    self.maps.A = new IPFMap("A",'#mapA');
    self.maps.A.initMap();
    self.controllers.A = new MapController(serverurl, this.maps.A, "A", 0);

    self.maps.B = new IPFMap("B",'#mapB');
    self.maps.B.initMap();
    $('#mapB').hide();
    $('#opacitysliderB').hide();
    self.controllers.B = new MapController(serverurl, this.maps.A, "B", 1);

    self.dygraph = new IPFDyGraph(self.maps.A);
    $('#TimeSeriesContainerDiv_mapA').hide();
    self.dygraphshowing = false;

  //Get Pydap handled files for requested url and add to WMS Select

    self.controllers.A.GetWMSFileList();

    $('#overlayTopMapB').click(function(){
        console.log("overlayTopMapB");

        if(self.controllers.B.selector.val() === null){
            self.controllers.B.GetWMSFileList();
        }
        if($('#mapB').is(':visible')){
            // remove splitter
            $('#map-split').split({orientation:'vertical', position: '100%'});
            $('#mapB').hide();
            $('#mapA').removeClass('left_panel');
            $('#mapA').width('100%');
    //		closeDygraph('B');
            $('.right_panel').width('0%');
            $('.vsplitter').css('left','100%');
            $('.vsplitter').hide();
            self.controllers.B.changeMap(self.maps.A, false);
    //		$( "#linkMapsCtrlGroup_mapB" ).hide();
    //		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
    //		$("#btn_separateMap"+mapId).removeClass('active');
    //		IPFDV.ncwebResize();
        }
        self.controllers.B.changeMap(self.maps.A, false);
        self.controllers.A.changeZindex(0);
        self.controllers.B.changeZindex(1);
        self.controllers.A.map.Map.updateSize();

    });

    $('#overlayBottomMapB').click(function(){
        console.log("overlayBottomMapB");

        if(self.controllers.B.selector.val() === null){
            self.controllers.B.GetWMSFileList();
        }
        if($('#mapB').is(':visible')){
        // remove splitter
            $('#map-split').split({orientation:'vertical', position: '100%'});
            $('#mapB').hide();
            $('#mapA').removeClass('left_panel');

    //		closeDygraph('B');
            $('#mapA').width('100%');
    //		closeDygraph('B');
            $('.right_panel').width('0%');
            $('.vsplitter').css('left','100%');
            $('.vsplitter').hide();
            self.controllers.B.changeMap(self.maps.A, false);
//		$( "#linkMapsCtrlGroup_mapB" ).hide();
//		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
//		$("#btn_separateMap"+mapId).removeClass('active');
//		IPFDV.ncwebResize();
        }
        self.controllers.B.changeMap(self.maps.A, false);
	    self.controllers.A.changeZindex(1);
	    self.controllers.B.changeZindex(0);
	    self.controllers.A.map.Map.updateSize();

    });

    $('#disableMapB').click(function(){
        console.log("disableMapB");
        if($('#mapB').is(':visible')){
        // remove splitter
            $('#map-split').split({orientation:'vertical', position: '100%'});
            $('#mapB').hide();
            $('#mapA').removeClass('left_panel');

    //		closeDygraph('B');
            $('#mapA').width('100%');
            $('.right_panel').width('0%');
            $('.vsplitter').css('left','100%');
            $('.vsplitter').hide();

//            self.controllers.B.changeMap(self.maps.A, false);
//		$( "#linkMapsCtrlGroup_mapB" ).hide();
//		IPFDV.maps['A'].Map.setCenter(new OpenLayers.LonLat(0,0));
//		$("#btn_separateMap"+mapId).removeClass('active');
//		IPFDV.ncwebResize();
        }

        self.controllers.B.resetControl();


        self.controllers.A.map.Map.updateSize();
    });

    $('#splitMapB').click(function(){
        console.log("splitMapB");

        if($('#mapB').is(':hidden')){
            $('#map-split').split({
                orientation:'vertical',
                position: '50%',
                limit: 100,
                onDrag: function(){
                    self.controllers.A.map.Map.updateSize();
                    self.controllers.B.map.Map.updateSize();
                    }
                }
            );
             $('#mapA').addClass('left_panel');

    //		closeDygraph('B');

            $('.right_panel').width('50%');
            $('.vsplitter').css('left','50%');
            $('.vsplitter').css('background-color','#FFF');
            $('.vsplitter').css('width','5px');
            $('.vsplitter').show();
            $('#mapB').show();

        }

	    if(self.controllers.B.selector.val() === null){
            self.controllers.B.GetWMSFileList();
        }
        self.maps.A.Map.updateSize();
        self.maps.B.Map.updateSize();
        self.controllers.B.changeMap(self.maps.B, true);

    });

    $('#getTS').click(function(){
        console.log("getTS");
        var text = $('#getTS_text').text();
        $('#getTS_text').text(text == " Get Time Series" ? " Close Time Series" : " Get Time Series");
        $('#TimeSeriesContainerDiv_mapA').toggle();

        if($('#getTS_text').text()==" Close Time Series") {
            self.dygraphshowing = true;
            $('#mapA').css('cursor', 'crosshair');
            $('#mapB').css('cursor', 'crosshair');
            IPFDV.maps['A'].registerClickEvent(true);
            IPFDV.maps['B'].registerClickEvent(true);
//            self.dygraphshowing = true;
            console.log("dygraphshowing: "+self.dygraphshowing);
	    }
	    else {
            self.dygraphshowing = false;
            $('#mapA').css('cursor', 'default');
            $('#mapB').css('cursor', 'default');
            IPFDV.maps['A'].registerClickEvent(false);
            IPFDV.maps['B'].registerClickEvent(false);
//            self.dygraphshowing = false;

	    }
    });

}



/** @function
 * Show WMSLayer either as map overlay or as separate map
 * @name showLayerOnMap
 * @param {boolean} reloadTS - Reload the TimeSeries Dygraph if True */
//IPFDataViewer.prototype.showLayerOnMap = function(map, reloadTS, manualScale) {

////  var MapName = map.MapName;
////  console.log("MapName = "+MapName);

//  console.log("showLayerOnMap");
//
////  ncvar=map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name;
//
////  req_url=$("#wmsSelect"+map.MapName).val().split("?")[0]+"?item=minmax&layers="+
////      ncvar+"&bbox=-180%2C-90%2C180%2C90&elevation=0&time="+$("#timeSelect"+map.MapName).val()+
////      "&srs=EPSG%3A4326&width=256&height=256&request=GetMetadata";
////  console.log(req_url);
//
//  if(manualScale==true){
//      map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) {
//            return obj.Name == ncvar;
//      })[0].actualrange = [$("#tbMin_map"+map.MapName).val(), $("#tbMax_map"+map.MapName).val(), true];
//
//    setColorbarRangeValues(map, map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name);
//
//        this.controllers.A.buildURL();
//
////    console.log("Scale changed manually");
////    console.log("min="+$("#tbMin_map"+map.MapName).val()+" max="+$("#tbMax_map"+map.MapName).val());
////    map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) {
////      return obj.Name == ncvar;
////    })[0].actualrange = [$("#tbMin_map"+map.MapName).val(), $("#tbMax_map"+map.MapName).val(), true];
////
////
////
//////    setColorbarRangeValues(map, map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name);
////    // @TODO: Only works with MapA and MapB
////    var onTop = 'A';
//////		if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
//////			onTop = true;
//////		}
////
////    // show data on separate map
////    if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
////      map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
////          $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
////          $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
////    }
////
////    // show data as overlay on MapA
////    else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
////        map.ViewState == IPFDV.ViewStates.overlay_bottom) {
////      map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
////          $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
////          $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
////    }
//
//  }
//
//  else{
//
//  this.controllers.A.loadMinMax(this.controllers.A.buildURL);
////  this.controllers.A.buildURL();
////    $.ajax({
////      type:"GET",
////      url:req_url,
////      dataType:"json",
////      context: this,
////      success: function(json){
////
////                console.log("min="+json.min+" max="+json.max);
////                console.log("ncvar: "+ncvar);
////
////        map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) {
////          return obj.Name == ncvar;
////        })[0].actualrange = [json.min, json.max, true];
////
////
////
////        setColorbarRangeValues(map, map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name);
////        // @TODO: Only works with MapA and MapB
////        var onTop = 'A';
//////				if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top) {
//////					onTop = true;
//////				}
////
////        // show data on separate map
////        if(map.MapName == 'A' || map.ViewState == IPFDV.ViewStates.separate) {
////          map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
////              $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
////              $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
////        }
////
////        // show data as overlay on MapA
////        else if(map.ViewState == IPFDV.ViewStates.overlay_top ||
////            map.ViewState == IPFDV.ViewStates.overlay_bottom) {
////          map.showWMSLayer(map.Capabilities.Capability.Layer.Layer[0].Layer[$("#ncvarSelect"+map.MapName).val()].Name,
//              $("#timeSelect"+map.MapName).val(), $("#wmsSelect"+map.MapName).val().split("?")[0],
////              $("#cmapSelect"+map.MapName).val(), onTop, reloadTS);
////        }
////      }
////    });
//  }
//
//}



