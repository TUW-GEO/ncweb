/**
 * @file DyGraph Object, contains information and functions to draw the dygraph
 * @author Markus Pöchtrager
 */

function IPFDyGraph(map) {
	
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
	// Show DIV with Loading Overlay, Overlay will be hidden by new DyGraph()
	// object
	// Overlay instance gets created in html file
	$("#TimeSeriesOverlay_map" + this.map.MapName).html($(overlay_LOADING));
	$("#TimeSeriesOverlay_map" + this.map.MapName).show();
	$('#TimeSeriesContainerDiv_map' + this.map.MapName).show();
	// Create TimeSlider Object
	if ($("#timeSelect" + this.map.MapName)[0].length > 0) {
		this.setTimeSlider();
		$("#TimeSliderDiv_map" + this.map.MapName).show();
	} else {
		$("#TimeSliderDiv_map" + this.map.MapName).hide();
	}
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
				_self.map.setTimePosition(x);
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
	var ncvar = map.Capabilities.capability.layers[$(
			"#ncvarSelect" + map.MapName).val()].name;
	var wmsurl = $("#wmsSelect" + map.MapName).val().split("?")[0];
	// @TODO: Find good bbox
	var bboxstring = (lonlat.lon - 0.00001).toString() + ","
			+ (lonlat.lat - 0.00001).toString() + ","
			+ (lonlat.lon + 0.00001).toString() + ","
			+ (lonlat.lat + 0.00001).toString();

	// New GET Request
	map.IPFDyGraph.getDyGraph = $.ajax({
		type : "GET",
		url : wmsurl,
		data : {
			'REQUEST' : 'GetTimeseries',
			'LAYERS' : ncvar,
			'BBOX' : bboxstring
		},
		dataType : "json",
		success : function(json) {
			var mydata = new Array();
			var dates = new Array();
			// Parse Data to Date and Float
			var i = -1;
			for ( i in json.data) {
				var date = new Date(json.data[i][0]);
				dates[i] = date;
				mydata[i] = [ date, parseFloat(json.data[i][1]) ];
			}
			map.IPFDyGraph.DyGraphLabels = json.labels;
			map.IPFDyGraph.DyGraphDates = dates
			map.IPFDyGraph.DyGraphData = mydata;
		},
		complete : function(xhr, textStatus) {
			// console.log(xhr.status+", "+textStatus);
		}
	});
}

/**
 * @function (Re-)Draw the DyGraph
 * @name showOnDyGraph
 */
IPFDyGraph.prototype.drawDyGraph = function() {
	var _self = this;
	
	var dates = this.DyGraphDates;
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
				var value=parseFloat(dg.DyGraphData[i][1])
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
				
				
					var value=parseFloat(dg.DyGraphData[usedValues][1])
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
	labels.push(this.DyGraphLabels[1]);
	if(this.DyGraphData.length < 50) {
		showPointsArr.push(true);
	}
	else {
		showPointsArr.push(false);
	}
	$("#TimeSliderDiv_map" + _self.map.MapName).css('padding-right','4px');
	
	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
			IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
		dygraphData = getDyGraphDataArray(dygraphData, IPFDV.maps.B.IPFDyGraph);
		labels.push(IPFDV.maps.B.IPFDyGraph.DyGraphLabels[1]);
		if(IPFDV.maps.B.IPFDyGraph.DyGraphData.length < 50) {
			showPointsArr.push(true);
		}
		else {
			showPointsArr.push(false);
		}
		$("#TimeSliderDiv_map" + _self.map.MapName).css('padding-right','62px');
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
	if (_self.DyGraph == null) return;
	
	var two_highlights = false;
	if(IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_top ||
	    	IPFDV.maps.B.ViewState == IPFDV.ViewStates.overlay_bottom) {
	    if (IPFDV.maps.B.Date != null) {
	    	two_highlights = true;
	    }
	}
    var highlightTime = _self.map.Date;
    if (highlightTime == null && two_highlights == false)	return;
    var coordStart = _self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var coordEnd = _self.DyGraph.toDomCoords(highlightTime.getTime(),0);
    var left = coordStart[0];
    var right = coordEnd[0];
    canvas.fillStyle = "rgba(116,255,230,1.0)";
    canvas.fillRect(left-1,area.y,right-left+1,area.h);
    
    if (two_highlights) {
    	var highlightTime2 = IPFDV.maps.B.Date;
        var coordStart2 = _self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var coordEnd2 = _self.DyGraph.toDomCoords(highlightTime2.getTime(),0);
        var left2 = coordStart2[0];
        var right2 = coordEnd2[0];
        canvas.fillStyle = "rgba(255, 255, 102, 1.0)";
        canvas.fillRect(left2-1,area.y,right2-left2+1,area.h);
    }
}

/**
 * @function Set the time slider value to the selected Index
 * @name setTimeSlider
 */
IPFDyGraph.prototype.setTimeSlider = function() {
	var _self = this;

	$("#timeslider-" + this.map.MapName).slider({
		min : 0,
		max : $("#timeSelect" + this.map.MapName)[0].length - 1,
		step : 1,
		value : $("#timeSelect" + this.map.MapName)[0].selectedIndex,
		stop : function(slideEvt, ui) {
			$("#timeSelect" + _self.map.MapName)[0].selectedIndex = ui.value;
			timeChanged(_self.map.MapName);
		}
	});
	$("#TimeSliderDiv_map" + this.map.MapName + " .slider").width("100%");
}