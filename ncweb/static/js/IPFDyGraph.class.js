/**
 * @file DyGraph Object, contains information and functions to draw the dygraph
 * @author Markus Pöchtrager
 */

function IPFDyGraph(map) {
	console.log("IPFDyGraph");
	
	// IPFMap
	this.map = map;
	
	// DyGraph Objects
	this.DyGraph = null;
	// AJAX Get Request
	this.getDyGraph
	
	// Dates, Data (Dates + Values) and Labels for DyGraph
	this.DyGraphDates = new Array();
	this.DyGraphData = new Array();
	this.DyGraphLabels = new Array();
}

/**
 * @function Show the DyGraph Time Series plot for a given point
 * @name showDyGraph
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the TimeSeries
 */
IPFDyGraph.prototype.showDyGraph = function(lonlat) {
	console.log("showDyGraph");
	// Show DIV with Loading Overlay, Overlay will be hidden by new DyGraph()
	// object
	// Overlay instance gets created in html file
	$("#TimeSeriesOverlay_map" + this.map.MapName).html($(overlay_LOADING));
	$("#TimeSeriesOverlay_map" + this.map.MapName).show();
	$('#TimeSeriesContainerDiv_map' + this.map.MapName).show();

	// Add Map Marker to the map
	this.map.addMapMarker(lonlat);
	var _self = this;
	if(this.DyGraph == null){
		this.DyGraph = new Dygraph(document.getElementById("TimeSeriesDiv_map" + this.map.MapName),[[0,0],[0,1]],{
			labelsSeparateLines: true,
			connectSeparatedPoints:true,
			legend:'always',
			//draw a vertical line showing the currently selected date
		    underlayCallback:function(canvas,area,layout){
		    	_self.showTimeUnderlay(canvas,area,layout,_self);
		    },
			clickCallback : function(response, x, point) {
				if(response.ctrlKey){
					_self.map.syncDateTime(x);
					_self.map.TempLinkEvent();
					if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
							IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
						IPFDV.maps.B.syncDateTime(x);
					}
					_self.DyGraph.updateOptions({});
					_self.DyGraph.resize();
				}
			}
		});
	}

	// Abort Previous GET Request if not DONE
	if (this.getDyGraph && this.getDyGraph.readystate != 4) {
		this.getDyGraph.abort();
	}

	this.getDyGraphValues(lonlat, this.map); // Get TimeSeries-Values for map
	
	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
			IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
		this.getDyGraphValues(lonlat, IPFDV.maps.B); // Also get the values for map B
		
		$.when(this.getDyGraph, IPFDV.maps.B.IPFDyGraph.getDyGraph).then(function(){
		    // the code here will be executed when both ajax requests resolve.
			_self.drawDyGraph();
			$("#TimeSeriesOverlay_map" + _self.map.MapName).hide();
		}, function() {
			// the code here will be executed when one of the ajax requests is rejected.
			if(_self.getDyGraph.statusText != "abort" && IPFDV.maps.B.IPFDyGraph.getDyGraph.statusText != "abort") {
				$("#TimeSeriesOverlay_map" + _self.map.MapName).html($(overlay_ERROR));
				$("#TimeSeriesOverlay_map" + _self.map.MapName).show();
			}
		});
	}
	else {
		$.when(this.getDyGraph).then(function(a1){
		    // the code here will be executed both ajax requests resolve.
		    // a1, a2 are lists of length 3 containing the response text,
		    // status, and jqXHR object for each of the four ajax calls respectively.
			_self.drawDyGraph();
			$("#TimeSeriesOverlay_map" + _self.map.MapName).hide();
		}, function() {
			// the code here will be executed when one of the ajax requests is rejected.
			if(_self.getDyGraph.statusText != "abort") {
				$("#TimeSeriesOverlay_map" + _self.map.MapName).html($(overlay_ERROR));
				$("#TimeSeriesOverlay_map" + _self.map.MapName).show();
			}
		});
	}
}

/**
 * @function Get TimeSeries-Request
 * @name getDyGraphValues
 * @param {OpenLayers.LonLat} lonlat - Coordinates of the TimeSeries
 */
IPFDyGraph.prototype.getDyGraphValues = function(lonlat,map) {
	console.log("getDyGraphValues");
	var ncvar = map.Capabilities.capability.layers[$(
			"#ncvarSelect" + map.MapName).val()].name;
	var layer = $("#wmsSelect"+map.MapName).val().split("?")[0].split("/").pop();  //get file name
	console.log(layer);
	var days = 30;
//	var time = new Date($("#timeSelect"+map.MapName).val());
//	console.log("Selcected date: "+time);
//	var time_start = new Date(time);
//	time_start.setDate(time_start.getDate() -days);
//	console.log(time_start);
//	time_start = time_start.toISOString();
//	var time_end = new Date(time);
//	time_end.setDate(time.getDate() +days);
//	time_end = time_end.toISOString();

	var time_start = $('#daterange').data('daterangepicker').startDate._d;
	time_start = time_start.toISOString();
	var time_end = $('#daterange').data('daterangepicker').endDate._d;
	time_end = time_end.toISOString();
	console.log("Start: "+time_start+" End: "+time_end);

//	console.log(map.Capabilities.capability.layers[$("#ncvarSelect" + map.MapName)val()].title);
//	var wmsurl = $("#wmsSelect" + map.MapName).val().split("?")[0];
	//TODO: still hard coded... make available for all datasets...
	var wmsurl = "http://localhost:8080/thredds/ncss/grid/testAll/"+layer+"?"+
			"req=station&var="+ncvar+"&latitude="+lonlat.lat+"&longitude="+lonlat.lon+"&time_start="+time_start+"&time_end="+time_end;
	// @TODO: Find good bbox
	console.log(wmsurl);

	map.IPFDyGraph.getDyGraph = $.ajax({
		type: "GET",
		url: wmsurl,
		dataType: "xml",
		success: function(xml){
			var mydata = new Array();
			var dates = new Array();

			for (var i=0; i<$(xml).find("point").length; i++){
				console.log("Point "+i);
				dates[i] = new Date($(xml).find("point").eq(i).children("data")[0].innerHTML);
				//TODO: specific to dataset /10000 - unit dependent!!
				value=parseFloat($(xml).find("point").eq(i).children("data")[3].innerHTML)/10000;
				if(value>0){
					mydata.push([dates[i], value]);

				}

			}
			console.log(mydata);
			map.IPFDyGraph.DyGraphLabels = map.Capabilities.capability.layers[$("#ncvarSelect" + map.MapName).val()].title;
			map.IPFDyGraph.DyGraphDates = dates;
			map.IPFDyGraph.DyGraphData = mydata;
		}
	});


	// New GET Request
//	map.IPFDyGraph.getDyGraph = $.ajax({
//		type : "GET",
//		url : wmsurl,
//		data : {
//			'REQUEST' : 'GetTimeseries',
//			'LAYERS' : ncvar,
//			'BBOX' : bboxstring
//		},
//		dataType : "json",
//		success : function(json) {
//			var mydata = new Array();
//			var dates = new Array();
//			// Parse Data to Date and Float
//			var i = -1;
//			for ( i in json.data) {
//				var date = new Date(json.data[i][0]);
//				dates[i] = date;
//				mydata[i] = [ date, parseFloat(json.data[i][1]) ];
//			}
//			map.IPFDyGraph.DyGraphLabels = json.labels;
//			map.IPFDyGraph.DyGraphDates = dates;
//			map.IPFDyGraph.DyGraphData = mydata;
//		},
//		complete : function(xhr, textStatus) {
//			// console.log(xhr.status+", "+textStatus);
//		}
//	});
}

/**
 * @function (Re-)Draw the DyGraph
 * @name showOnDyGraph
 */
IPFDyGraph.prototype.drawDyGraph = function() {
	console.log("drawDyGraph");
	var _self = this;
	
	var dates = this.DyGraphDates;
	console.log(dates);

	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
			IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
		// Merge possible dates into one array
		dates = dates.concat(IPFDV.maps.B.IPFDyGraph.DyGraphDates);
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
	
	var getDyGraphDataArray = function(d,dg) {
		/*	if timeseries are the same length they match up element for element because 
		the dates cover all datasets in the time interval
		*/
		if(d.length==dg.DyGraphData.length){   
		
			for(var i=0;i<dg.DyGraphData.length;i++){
				console.log("in the loop "+i);
				var value=parseFloat(dg.DyGraphData[i][1]);
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
			
				if(dg.DyGraphData[usedValues] && dg.DyGraphData[usedValues][0] && dg.DyGraphData[usedValues][1]) {
					var date=new Date(dg.DyGraphData[usedValues][0]);
					if(date.getTime()!=d[i][0].getTime()){
						d[i].push(null);
						continue;
					}
				
					console.log(dg.DyGraphData[usedValues][1]);
					var value=parseFloat(dg.DyGraphData[usedValues][1]);

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
	
	dygraphData = getDyGraphDataArray(dygraphData, _self);
	labels.push("Map"+_self.map.MapName+": "+this.DyGraphLabels);
	if(this.DyGraphData.length < 50) {
		showPointsArr.push(true);
	}
	else {
		showPointsArr.push(false);
	}
	
	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
			IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
		dygraphData = getDyGraphDataArray(dygraphData, IPFDV.maps.B.IPFDyGraph);
		labels.push("MapB: "+IPFDV.maps.B.IPFDyGraph.DyGraphLabels);
		if(IPFDV.maps.B.IPFDyGraph.DyGraphData.length < 50) {
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
		//this.DyGraph = new Dygraph(document.getElementById("TimeSeriesDiv_map" + _self.map.MapName),dygraphData,dyOptions);
		this.DyGraph.updateOptions(dyOptions);
		this.DyGraph.resize();	
	}

}

/**
 * @function Draws a vertical line showing the currently selected date
 * @name showTimeUnderlay
 */
IPFDyGraph.prototype.showTimeUnderlay=function(canvas,area,layout,_self){
	console.log("showTimeUnderlay");
	if (_self.DyGraph == null) return;
	
	var two_highlights = false;
	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
	    	IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
	    if (IPFDV.maps.B.Date != null) {
	    	two_highlights = true;
	    }
	}
    var highlightTime = new Date($("#timeSelect"+_self.map.MapName).val());
    console.log($("#timeSelect"+_self.map.MapName).val()+" highlightTime: "+highlightTime)
    if (highlightTime == null && two_highlights == false)	return;
    var coordStart = _self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var coordEnd = _self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var left = coordStart[0];
    var right = coordEnd[0];
    canvas.fillStyle = "rgba(116,255,230,1.0)";
    canvas.fillRect(left-1,area.y,right-left+1,area.h);
    
    if (two_highlights) {
    	var highlightTime2 = new Date($("#timeSelect"+IPFDV.maps.B.MapName).val());
        var coordStart2 = _self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var coordEnd2 = _self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var left2 = coordStart2[0];
        var right2 = coordEnd2[0];
        canvas.fillStyle = "rgba(255, 255, 102, 1.0)";
        canvas.fillRect(left2-1,area.y,right2-left2+1,area.h);
    }
}

