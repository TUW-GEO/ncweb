/**
 * @file DyGraph Object, contains information and functions to draw the dygraph
 * @author Markus Pöchtrager
 */

function IPFDyGraph(map) {
	console.log("IPFDyGraph");

	var self = this;
	
	// IPFMap
	self.map = map;
	
	// DyGraph Objects
	self.DyGraph = null;
	// AJAX Get Request
	self.getDyGraph;
	self.baseurl = [];

	self.lonlat = [];
	
	// Dates, Data (Dates + Values) and Labels for DyGraph
//	self.DyGraphDates = new Array();
//	self.DyGraphData = new Array();
//	self.DyGraphLabels = new Array();

	self.DyGraphDates = [];
	self.DyGraphDates[0] = new Array();
	self.DyGraphDates[1] = new Array();

	self.DyGraphData = [];
	self.DyGraphData[0] = new Array();
	self.DyGraphData[1] = new Array();

	self.DyGraphLabels = [];
	self.DyGraphLabels[0] = new Array();
	self.DyGraphLabels[1] = new Array();


	$('#TSClose_mapA').click(function(){
		console.log("TSClose_mapA click");
		$('#getTS').trigger("click");
	});

	map.Map.on('click', function(evt){
		var coord = evt.coordinate;
		var transformed_coord = ol.proj.transform(coord, "EPSG:3857", "EPSG:4326");
		self.map.addMapMarker(coord);
		console.log(transformed_coord);
		self.lonlat = transformed_coord;
		self.showDyGraph();
	});

}

/**
 * @function Show the DyGraph Time Series plot for a given point
 * @name showDyGraph
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the TimeSeries
 */

IPFDyGraph.prototype.setBaseURL = function(url, index) {
	var self = this;

	self.baseurl[index] = url;
	console.log("baseurl["+index+"] = "+url);
}

IPFDyGraph.prototype.showDyGraph = function() {
	console.log("showDyGraph");

	// Add Map Marker to the map

	var self = this;
	lonlat = self.lonlat;
	if(this.DyGraph == null){
		this.DyGraph = new Dygraph(document.getElementById("TimeSeriesDiv_map" + this.map.MapName),[[0,0],[0,1]],{
			labelsSeparateLines: true,
			connectSeparatedPoints:true,
			legend:'always',
			//draw a vertical line showing the currently selected date
		    underlayCallback:function(canvas,area,layout){
		    	self.showTimeUnderlay(canvas,area,layout,self);
		    },
			clickCallback : function(response, x, point) {
				if(response.ctrlKey){
					self.map.syncDateTime(x);
					self.map.TempLinkEvent();
					if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
							IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
						IPFDV.maps.B.syncDateTime(x);
					}
					self.DyGraph.updateOptions({});
					self.DyGraph.resize();
				}
			}
		});
	}

	// Abort Previous GET Request if not DONE
	if (this.getDyGraph && this.getDyGraph.readystate != 4) {
		this.getDyGraph.abort();
	}

	this.getDyGraphValues(lonlat, 0); // Get TimeSeries-Values for map
	

	if(IPFDV.controllers.B.visible) {
		this.getDyGraphValues(lonlat, 1); // Also get the values for map B
		
//		$.when(this.getDyGraph, IPFDV.maps.B.IPFDyGraph.getDyGraph).then(function(){
//		    // the code here will be executed when both ajax requests resolve.
//			self.drawDyGraph();
//			$("#TimeSeriesOverlay_map" + self.map.MapName).hide();
//		}, function() {
//			// the code here will be executed when one of the ajax requests is rejected.
//			if(self.getDyGraph.statusText != "abort" && IPFDV.maps.B.IPFDyGraph.getDyGraph.statusText != "abort") {
//				$("#TimeSeriesOverlay_map" + self.map.MapName).html($(overlay_ERROR));
//				$("#TimeSeriesOverlay_map" + self.map.MapName).show();
//			}
//		});
	}
	else {
//		$.when(this.getDyGraph).then(function(a1){
//		    // the code here will be executed both ajax requests resolve.
//		    // a1, a2 are lists of length 3 containing the response text,
//		    // status, and jqXHR object for each of the four ajax calls respectively.
//			self.drawDyGraph();
//			$("#TimeSeriesOverlay_map" + self.map.MapName).hide();
//		}, function() {
//			// the code here will be executed when one of the ajax requests is rejected.
//			if(self.getDyGraph.statusText != "abort") {
//				$("#TimeSeriesOverlay_map" + self.map.MapName).html($(overlay_ERROR));
//				$("#TimeSeriesOverlay_map" + self.map.MapName).show();
//			}
//		});
	}
}

/**
 * @function Get TimeSeries-Request
 * @name getDyGraphValues
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the TimeSeries
 */
IPFDyGraph.prototype.getDyGraphValues = function(lonlat,mapindex) {
	self=this;
	console.log("getDyGraphValues");

	var time_start = $('#daterange').data('daterangepicker').startDate._d;
	time_start = time_start.toISOString();
	var time_end = $('#daterange').data('daterangepicker').endDate._d;
	time_end = time_end.toISOString();
	console.log("Start: "+time_start+" End: "+time_end);

	wmsurl = self.baseurl[mapindex]+"&latitude="+lonlat[1]+"&longitude="+lonlat[0]+"&time_start="+time_start+"&time_end="+time_end;
	console.log("wmsurl: "+wmsurl);

	$.ajax({
		type: "GET",
		url: '/GetConfigParam?section=Data&param=scale_factor',
		dataType: "json",
		success: function(json) {

			scale_factor=parseFloat(json.value);
		},
		async: false
	});

	$.ajax({
		type: "GET",
		url: wmsurl,
		dataType: "xml",
		success: function(xml){
			var mydata = new Array();
			var dates = new Array();

			for (var i=0; i<$(xml).find("point").length; i++){
				dates[i] = new Date($(xml).find("point").eq(i).children("data")[0].innerHTML);
				value=parseFloat($(xml).find("point").eq(i).children("data")[3].innerHTML)*scale_factor;
				if(value>0){
					mydata.push([dates[i], value]);

				}

			}
			console.log("mydata "+mydata);
//			self.DyGraphLabels[mapindex] = IPFDV.controllers.A.mapCapabilities.Capability.Layer.Layer[0].Layer[IPFDV.controllers.A.varselector.val()].Title;

			self.DyGraphDates[mapindex] = dates;
			self.DyGraphData[mapindex] = mydata;

			if(IPFDV.controllers.B.visible == false || mapindex == 1){
				self.drawDyGraph();
			}

		}
	});

}

/**
 * @function (Re-)Draw the DyGraph
 * @name showOnDyGraph
 */
IPFDyGraph.prototype.drawDyGraph = function() {
	console.log("drawDyGraph");
	var self = this;
	
	var dates = self.DyGraphDates[0];
	console.log(dates);
	self.DyGraphLabels[0] = IPFDV.controllers.A.mapCapabilities.Capability.Layer.Layer[0].Layer[IPFDV.controllers.A.varselector.val()].Title;

	if(IPFDV.controllers.B.visible) {
		self.DyGraphLabels[1] = IPFDV.controllers.B.mapCapabilities.Capability.Layer.Layer[0].Layer[IPFDV.controllers.B.varselector.val()].Title;
		// Merge possible dates into one array
		dates = dates.concat(self.DyGraphDates[1]);
		// Remove duplicates
		var dates = dates.filter(function (item, pos) {
		    for(var i=0; i < pos; i++) {
	        	// Remove the duplicate if there is the same value earlier in the list
	            if (dates[i].getTime() == dates[pos].getTime()) {
	                return false;
	            }
		    }
		    return true;
		});
		
		var date_sort_asc = function (date1, date2) {
			// Comparison function that will result in dates being sorted in ASCENDING order. 
			if (date1 > date2) return 1;
			if (date1 < date2) return -1;
			return 0;
		};
		
		dates.sort(date_sort_asc);
	}
	
	var dygraphData=[];
	for(var i=0;i<dates.length;i++){
		dygraphData.push([dates[i]]);
	}
	var labels = new Array();
	labels.push('Date');
	var showPointsArr = new Array();
	showPointsArr.push(-1);
	
	var getDyGraphDataArray = function(d,mapindex) {
		/*	if timeseries are the same length they match up element for element because 
		the dates cover all datasets in the time interval
		*/
		if(d.length==self.DyGraphData[mapindex].length){
		
			for(var i=0;i<self.DyGraphData[mapindex].length;i++){
				console.log("in the loop "+i);
				var value=parseFloat(self.DyGraphData[mapindex][i][1]);
				if(isNaN(value)) value=null;
				d[i].push(value);
			}
		
		}
		else{
			/*if the time series to add has a different number of elements every elements date
				is checked against the list of all dates and the values are inserted in the correct place
			*/	
			
			var usedValues=0;
		
			for(var i=0;i<d.length;i++){
			
				if(self.DyGraphData[mapindex][usedValues] && self.DyGraphData[mapindex][usedValues][0] && self.DyGraphData[mapindex][usedValues][1]) {
					var date=new Date(self.DyGraphData[mapindex][usedValues][0]);
					if(date.getTime()!=d[i][0].getTime()){
						d[i].push(null);
						continue;
					}
				
//					console.log(dg.DyGraphData[usedValues][1]);
					var value=parseFloat(self.DyGraphData[mapindex][usedValues][1]);

					if(isNaN(value))value=null;
					d[i].push(value);
				}
				else {
					d[i].push(null);
				}
				usedValues++;
			}
		
		}
		return d;
	}
	
	dygraphData = getDyGraphDataArray(dygraphData, 0);
	labels.push("Map"+self.map.MapName+": "+this.DyGraphLabels[0]);
	if(self.DyGraphData[0].length < 50) {
		showPointsArr.push(true);
	}
	else {
		showPointsArr.push(false);
	}
	
	if(IPFDV.controllers.B.visible) {
		dygraphData = getDyGraphDataArray(dygraphData, 1);
		labels.push("MapB: "+self.DyGraphLabels[1]);
		if(self.DyGraphData[1].length < 50) {
			showPointsArr.push(true);
		}
		else {
			showPointsArr.push(false);
		}
	}
	
	if(dygraphData.length!=0){
		var dyOptions = {
				file: dygraphData,
				labels: labels, 
				ylabel: labels[1],
			    y2label: labels[2],
			    series: {}
		};
		dyOptions.series[labels[1]] = { drawPoints: showPointsArr[1], pointSize: 2, highlightCircleSize: 3 };
		dyOptions.series[labels[2]] = { axis: 'y2', drawPoints: showPointsArr[2], pointSize: 2, highlightCircleSize: 3 };
		//this.DyGraph = new Dygraph(document.getElementById("TimeSeriesDiv_map" + self.map.MapName),dygraphData,dyOptions);
		this.DyGraph.updateOptions(dyOptions);
		this.DyGraph.resize();	
	}

}

/**
 * @function Draws a vertical line showing the currently selected date
 * @name showTimeUnderlay
 */
IPFDyGraph.prototype.showTimeUnderlay=function(canvas,area,layout,self){
	console.log("showTimeUnderlay");
	if (self.DyGraph == null) return;
	
	var two_highlights = false;
	if(IPFDV.controllers.B.visible) {
	    if (IPFDV.maps.B.Date != null) {
	    	two_highlights = true;
	    }
	}
    var highlightTime = new Date($("#timeSelect"+self.map.MapName).val());
    console.log($("#timeSelect"+self.map.MapName).val()+" highlightTime: "+highlightTime)
    if (highlightTime == null && two_highlights == false)	return;
    var coordStart = self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var coordEnd = self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var left = coordStart[0];
    var right = coordEnd[0];
    canvas.fillStyle = "rgba(116,255,230,1.0)";
    canvas.fillRect(left-1,area.y,right-left+1,area.h);
    
    if (two_highlights) {
    	var highlightTime2 = new Date($("#timeSelect"+IPFDV.maps.B.MapName).val());
        var coordStart2 = self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var coordEnd2 = self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var left2 = coordStart2[0];
        var right2 = coordEnd2[0];
        canvas.fillStyle = "rgba(255, 255, 102, 1.0)";
        canvas.fillRect(left2-1,area.y,right2-left2+1,area.h);
    }
}

function resizeDygraphs() {
        	//resize ncweb dygraphs
            if(IPFDV.maps.A.IPFDyGraph.DyGraph) {
//        		$("#TimeSeriesContainerDiv_mapA").css('width',$(IPFDV.maps.A.MapDivId).width()-40);
        		$("#TimeSeriesDiv_mapA").css('width',$(IPFDV.maps.A.MapDivId).width()-40);
        		IPFDV.maps.A.IPFDyGraph.DyGraph.resize();
        		IPFDV.maps['A'].Map.updateSize();
        	}
//        	if(IPFDV.maps.B.IPFDyGraph.DyGraph) {
////        		$("#TimeSeriesContainerDiv_mapB").css('width',$(IPFDV.maps.B.MapDivId).width()-50);
//        		$("#TimeSeriesDiv_mapB").css('width',$(IPFDV.maps.B.MapDivId).width()-50);
//        		IPFDV.maps.B.IPFDyGraph.DyGraph.resize();
//        		IPFDV.maps['B'].Map.updateSize();
//        	}
        }