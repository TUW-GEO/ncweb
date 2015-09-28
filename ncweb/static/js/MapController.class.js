/**
 * @file Class for controlling a Map object
 * gathers information about wms server, colormap, min, max
 * and builds a WMS URL from it that it then tells it's map to load
 */


function MapController(serverurl, map, divName, initz){

    var self = this;
    self.serverurl = serverurl;
    self.map = map;
    self.zindex = initz;
    self.divName = divName;
    self.div = $("#map-settings" + self.divName);
    self.selector = $("#wmsSelect" + self.divName);
    self.varselector = $("#ncvarSelect" + self.divName);
    self.timecontrol = $("#timeSelect"+self.divName);
    self.cmapselector =  $("#cmapSelect"+self.divName);
    self.lockcontrol = $("#lock"+self.divName);
    self.toggleCtrl = $("#globe-div"+self.divName);
    self.colorbar = $("#imgColorbar"+self.divName);
    self.opacityslider = $("#opacityslider"+self.divName);
    self.opacity = 0.8;


    self.cmapMin = $("#tbMin_map"+self.divName);
    self.cmapMax = $("#tbMax_map"+self.divName);
    self.scale_manual = false;

    self.locked = false;
    $(self.lockcontrol).click(function(){
        if(self.lockcontrol.val()==="lock"){
            console.log("Now its locked");
            self.lockcontrol.val("unlock");
            self.lockcontrol.find('i').toggleClass('fa-lock fa-unlock');
            self.cmapMax.attr('disabled', 'disabled');
            self.cmapMin.attr('disabled', 'disabled');
            self.locked = true;
        }
        else{
            self.lockcontrol.val("lock");
            self.lockcontrol.find('i').toggleClass('fa-lock fa-unlock');
            self.cmapMax.removeAttr('disabled');
            self.cmapMin.removeAttr('disabled');
            self.locked = false;
        }
    });

    $(self.div).change(function(){
        console.log("#map-settings"+self.divName+" changed");
        self.layerBitch();
    });

    $(self.cmapMin).change(function(){
        console.log("#tbMin_map"+self.divName+" changed manually");
        self.scale_manual=true;
        self.layerBitch();
    });
    $(self.cmapMax).change(function(){
        console.log("#tbMax_map"+self.divName+" changed manually");
        self.scale_manual=true;
        self.layerBitch();
    });
    $(self.selector).change(function(){
        console.log("#wmsSelect"+self.divName+" changed");
        self.GetWMSCapabilities();
    });
    $(self.varselector).change(function(){
        console.log("#ncvarSelect"+self.divName+" changed");

    });
    $(self.timecontrol).change(function(){
        console.log("#timeSelect"+self.divName+" changed");
        //TODO: daterangepicker handling
//	$('#daterange').data('daterangepicker').setStartDate(getDefaultStart($('#daterange').attr('mapId')));
//	$('#daterange').data('daterangepicker').setEndDate(getDefaultEnd($('#daterange').attr('mapId')));
//	console.log($("#daterange").val());
//	$('#daterange').data('daterangepicker').updateView();
//	start=$('#daterange').data('daterangepicker').startDate;
//	console.log(start);
//	// update input text field
//	$('#daterange').val($('#daterange').data('daterangepicker').startDate._i + ' - ' + $('#daterange').data('daterangepicker').endDate._i);
//	console.log($("#daterange").val());
//
//	console.log("See all list elements? "+$("#timeSelectA")[0].value);
    });
    $(self.cmapselector).change(function(){
        console.log("#cmapSelect"+self.divName+" changed");

    });
    $(self.selector).change(function(){
        console.log("#wmsSelect"+self.divName+" changed");

    });

    $(self.opacityslider).slider({
        orientation: "vertical",
		min: 0,
		max: 100,
		range: "min",
		step: 5,
		value: 80,
		slide: function(slideEvt, ui) {
		    self.opacity = ui.value/100;
            self.setLayerOpacity();
		}
	});

	$(self.toggleCtrl).click(function(){
	    console.log("toggleCtrl");
	    self.div.toggle();
	});

}

/** @function
 * Loads the list of available datasets in THREDDS
 * @name GetWMSFileList
 */
MapController.prototype.GetWMSFileList = function(){
    var self = this;
    console.log("In IPFDataViewer.prototype.GetWMSFileList = function(url) url= "+self.serverurl);

    $.ajax({
        type: "GET",
        url: '/wms/GetFileList?url='+self.serverurl,
        dataType: "json",
        success: function(json) {
            self.selector.empty();
            for (var f in json.files) {
                var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
                console.log("list: "+json.files[f].name+" "+json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
                $(o).html(json.files[f].name);
                self.selector.append(o);

            }
            self.GetWMSCapabilities();
        }
    });
}

/** @function
 * GetCapabilities request for the selected dataset
 * @name GetWMSCapabilities
 */
MapController.prototype.GetWMSCapabilities = function() {
    var self = this;
    var req_url = self.selector.val();
    console.log("req_url: "+req_url);
    if (req_url) {
        $.ajax({
            type: "GET",
            url: req_url,
            dataType: "xml",
            success: function(xml) {
                var wmsCapabilities = new ol.format.WMSCapabilities();
                self.mapCapabilities = wmsCapabilities.read(xml);
                console.log("mapCapabilities "+self.mapCapabilities);

                //Get options for Variables select-control
                self.loadVariables();
                console.log("LoadVariables");
                console.log("#ncvarSelect"+self.divName+": "+ $("#ncvarSelect"+self.divName).val());
                //Get options for Timepositions select-control
                self.loadTimepositions();
                console.log("loadTimepositions");
                self.layerBitch();
                console.log("done here");
            },
            error: function() {
                //reset controls if there is a problem with the wms request
                alert("Problem with WMS request! map: "+map.divName);
                self.resetControl();
            }
        });
    }
    else {
        self.resetControl();
    }
}

/** @function
 * Clear the select controls
 * @name resetControls
  */
MapController.prototype.resetControl = function() {
    var self = this;
    self.cmapMin.val('');
    self.cmapMax.val('');
    self.colorbar.attr('src','');
    self.opacityslider.hide();
    self.removeLayer();
}

/** @function
 * Set netcdf variables select control options
 * @name loadVariables */
MapController.prototype.loadVariables = function() {
    var self=this;
    console.log("actually in loadVariables");

    self.varselector.empty();
    //read layer information
    if(self.mapCapabilities.Capability && self.mapCapabilities.Capability.Layer.Layer[0].Layer) {
        console.log("in here :)");
        for (var l in self.mapCapabilities.Capability.Layer.Layer[0].Layer) {
            var o = new Option(self.mapCapabilities.Capability.Layer.Layer[0].Layer[l].Title, l);
            $(o).html(self.mapCapabilities.Capability.Layer.Layer[0].Layer[l].Title);
            self.varselector.append(o);
            //			console.log(self.varselector);
        }
    }
    if (self.varselector[0] && self.varselector[0].length>1) {
        self.varselector.removeAttr("disabled");
    }
    else {
        self.varselector.attr('disabled', true);
    }
}

/** @function
 * Set timepositions select control options
 * @name loadTimepositions
 */
MapController.prototype.loadTimepositions = function() {
    var self = this;
    self.timecontrol.empty();
    var ncvar = self.varselector.val();

    var selectValue = -1;
    var minDateDiff = -1;

    //read the layers time information
    if(self.mapCapabilities.Capability && self.mapCapabilities.Capability.Layer.Layer[0].Layer) {
        var layer = self.mapCapabilities.Capability.Layer.Layer[0].Layer[ncvar];
        if (layer && layer.Dimension[0].values) {
        var time_values = layer.Dimension[0].values.split(',');
        console.log("time_values: "+time_values);
        for (var t in time_values) {
            var o = new Option(time_values[t],time_values[t]);

            $(o).html(time_values[t]);
            self.timecontrol.append(o);

            // get the time next to self.map.Date
            if(minDateDiff > Math.abs(self.map.Date - new Date(time_values[t])) || minDateDiff < 0) {
            minDateDiff = Math.abs(self.map.Date - new Date(time_values[t]));
            selectValue = time_values[t];
            }
        }
        self.timecontrol.val(selectValue);

        }

        var time_start = moment(time_values[0]).format("YYYY-MM-DD");
        var time_end = moment(time_values.pop()).format("YYYY-MM-DD");
        console.log('newPicker '+time_start+" "+time_end);
        newPicker(time_start,time_end);
//        self.timecontrol.trigger("change");
    }
    if (self.timecontrol[0] && self.timecontrol[0].length>1) {
        self.timecontrol.removeAttr("disabled");
        self.map.TempLinkEvent();
    }
    else {
        self.timecontrol.attr('disabled', true);
    }
}

/** @function
 * Calls loadMinMax with buildURL as callback or buildURL directly
 * @name layerBitch
 */
MapController.prototype.layerBitch = function(){
    var self = this;

    if(self.scale_manual === true || self.locked === true){
        self.buildURL();
    }
    else{
        self.loadMinMax(self.buildURL);
    }
}

/** @function
 * Sends of WMS GetMetadata request to get min and max value of the layer for colorbar scaling
 * @name loadMinMax
 */
MapController.prototype.loadMinMax = function(callback) {
    var self = this;

    var baseurl = self.selector.val().split("?")[0];
    var ncvar = self.mapCapabilities.Capability.Layer.Layer[0].Layer[self.varselector.val()].Name;
    var time = self.timecontrol.val();

    req_url=baseurl+"?item=minmax&layers="+
      ncvar+"&bbox=-180%2C-90%2C180%2C90&elevation=0&time="+time+
      "&srs=EPSG%3A4326&width=256&height=256&request=GetMetadata";

    console.log("in loadMinMax: "+req_url);

    $.ajax({
        type:"GET",
        url:req_url,
        dataType:"json",
        context: this,
        success: function(json){

            console.log("min="+json.min+" max="+json.max);
            console.log("ncvar: "+ncvar);

            self.cmapMin.val(json.min);
            self.cmapMax.val(json.max);

            if(callback){
               callback.call(self);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);

            self.cmapMin.val("");
            self.cmapMax.val("");
        }
    });
}

/** @function
 * Builds the GetMap WMS request
 * @name buildURL
 */
MapController.prototype.buildURL = function() {

    var self = this;

    var baseurl = self.selector.val().split("?")[0];
    var ncvar = self.mapCapabilities.Capability.Layer.Layer[0].Layer[self.varselector.val()].Name;
    var time = self.timecontrol.val();
    var cmap = self.cmapselector.val();

    var getmapurl = baseurl + "?LAYERS=" + ncvar + "&STYLES=boxfill/" + cmap;

	if (time != null) // if there are time positions, add time property
		getmapurl += "&TIME=" + time;

	if (isNaN(self.cmapMin.val()) || isNaN(self.cmapMax.val())) {
		// Don't add colorbarrange to the get request
	}
	else {
		getmapurl += "&COLORSCALERANGE=" + self.cmapMin.val() +","+ self.cmapMax.val();
	}


	self.colorbar.attr("src",
			getmapurl + "&REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=25&HEIGHT=195&PALETTE="+cmap+"&NUMCOLORBANDS=20");// set the settings colorbar src

	console.log("build URL:");
	console.log(getmapurl);

    self.scale_manual=false;
    self.opacityslider.show();
	self.map.showWMSLayer(getmapurl, self.zindex, self.opacity);

}

MapController.prototype.changeZindex = function(newindex){

    this.zindex = newindex;
    this.layerBitch();

}

MapController.prototype.changeMap = function(newmap,redraw){

    this.removeLayer();
    this.map = newmap;

    if(redraw == true){
        this.zindex=0;
        this.layerBitch();
    }


}

MapController.prototype.removeLayer = function(){
    this.map.removeWMSLayer(this.zindex);
}

MapController.prototype.setLayerOpacity = function(){
    this.map.setWMSOpacity(this.zindex, this.opacity);
}

MapController.prototype.buildDyGraphURL = function() {

    var self = this;

    var ncvar = self.mapCapabilities.Capability.Layer.Layer[0].Layer[self.varselector.val()].Name;
    var time = self.timecontrol.val();
    var cmap = self.cmapselector.val();
    var layer = 0;
    var lonlat = 0;
    var time_start = 0;
    var time_end = 0;

	$.ajax({
		type: "GET",
		url: '/GetConfigParam?section=URLs&param=ncss',
		dataType: "json",
		success: function(json) {

			wmsurl = json.value+layer+"?"+"req=station&var="+ncvar+"&latitude="+lonlat.lat+
					"&longitude="+lonlat.lon+"&time_start="+time_start+"&time_end="+time_end;
			console.log("wmsurl = "+wmsurl);
		},
		async: false
	});
}