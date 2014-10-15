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
	//$(overlay_LOADING).appendTo($("#TimeSeriesDiv_map" + this.MapName));
	$("#TimeSeriesDiv_map" + this.map.MapName).html($(overlay_LOADING));
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

	// Abort Previous GET Request if not DONE
	if (this.getDyGraph && this.getDyGraph.readystate != 4) {
		this.getDyGraph.abort();
	}

	this.getDyGraphValues(lonlat, this.map); // Get TimeSeries-Values for map
	var _self = this;
	
	if($("#btn_overlayTopMap"+IPFDV.maps.B.MapName).hasClass('active') == true ||
			$("#btn_overlayBottomMap"+IPFDV.maps.B.MapName).hasClass('active') == true) {
		this.getDyGraphValues(lonlat, IPFDV.maps.B); // Also get the values for map B
		
		$.when(this.getDyGraph, IPFDV.maps.B.IPFDyGraph.getDyGraph).then(function(){
		    // the code here will be executed when both ajax requests resolve.
			_self.drawDyGraph();
		}, function() {
			// the code here will be executed when one of the ajax requests is rejected.
			// @TODO: set img to error icon...
		});
	}
	else {
		$.when(this.getDyGraph).then(function(a1){
		    // the code here will be executed both ajax requests resolve.
		    // a1, a2 are lists of length 3 containing the response text,
		    // status, and jqXHR object for each of the four ajax calls respectively.
			_self.drawDyGraph();
		}, function() {
			// the code here will be executed when one of the ajax requests is rejected.
			// @TODO: set img to error icon...
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
			for ( var i in json.data) {
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
	if($("#btn_overlayTopMap"+IPFDV.maps.B.MapName).hasClass('active') == true ||
			$("#btn_overlayBottomMap"+IPFDV.maps.B.MapName).hasClass('active') == true) {
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
	$("#TimeSliderDiv_map" + _self.map.MapName).css('padding-right','4px');
	
	if($("#btn_overlayTopMap"+IPFDV.maps.B.MapName).hasClass('active') == true ||
			$("#btn_overlayBottomMap"+IPFDV.maps.B.MapName).hasClass('active') == true) {
		dygraphData = getDyGraphDataArray(dygraphData, IPFDV.maps.B.IPFDyGraph);
		labels.push(IPFDV.maps.B.IPFDyGraph.DyGraphLabels[1]);
		$("#TimeSliderDiv_map" + _self.map.MapName).css('padding-right','62px');
	}
	
	if(dygraphData.length!=0){
		var dyOptions = {
				labels: labels, 
				ylabel: labels[1],
			    y2label: labels[2],
			    series: {},
				labelsSeparateLines: true,
				connectSeparatedPoints:true,
				legend:'always',
				clickCallback : function(response, x, point) {
					_self.map.setTimePosition(x);
				}
		};
		dyOptions.series[labels[2]] = { axis: 'y2' };
		this.DyGraph = new Dygraph(document.getElementById("TimeSeriesDiv_map" + _self.map.MapName),dygraphData,dyOptions);
		this.DyGraph.resize();	
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