/**
 * @file Class for controlling a Map object
 * gathers information about wms server, colormap, min, max
 * and builds a WMS URL from it that it then tells it's map to load
 */


function MapController(map){

    this.map = map;
    this.selector = $("#wmsSelect" + this.map.MapName);
    this.varselector = $("#ncvarSelect" + this.map.MapName);
    this.timecontrol = $("#timeSelect"+this.map.MapName);

}

MapController.prototype.GetWMSFileList = function(surl){
    console.log("In IPFDataViewer.prototype.GetWMSFileList = function(url) url= "+surl);
    var self = this;
    var mapA = self.maps["A"];
    var mapB = self.maps["B"];

    $.ajax({
        type: "GET",
        url: '/wms/GetFileList?url='+surl,
        dataType: "json",
        success: function(json) {
            self.selector.empty();
            for (var f in json.files) {
                var o = new Option(json.files[f].name, json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
                console.log("list A: "+json.files[f].name+" "+json.location+json.files[f].name+"?service=WMS&REQUEST=GetCapabilities&version=1.3.0");
                $(o).html(json.files[f].name);
                self.selector.append(o);

            }
            self.GetWMSCapabilities(mapA);
        }
    });
}

/** @function
 * GetCapabilities request for a selected pydap handled file
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
            self.map.Capabilities = wmsCapabilities.read(xml);
            console.log("map.Capabilities "+self.map.Capabilities);

    //				for (var i=0; i<$(xml).find("Layer").length; i++) {
    //					console.log("Layer "+i+" in XML")
    //					if($(xml).find("Layer").eq(i).find("ActualRange").length>0 //Got Actual Range in child node
    //							&& $(xml).find("Layer").eq(i).find("Layer").length == 0) { //Got no Layer-Node in child nodes
    //						console.log("Got ActualRange in child node and no Layer-Node in child nodes")
    //						var guess = false;
    //						if ($(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("guess")==true) {
    //							guess = true;
    //						}
    //						map.Capabilities.Capability.Layer.Layer[0].Layer.filter(function(obj) { // Write actualrange to capabilities
    //							return obj.name ==$(xml).find("Layer").eq(i).children("Name")[0].innerHTML;
    //						})[0].actualrange = [$(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("min"),$(xml).find("Layer").eq(i).find("ActualRange").eq(0).attr("max"),guess];
    //					}
    //				}

            //Get options for Variables select-control
            self.loadVariables();
            console.log("LoadVariables");
            console.log("#ncvarSelect"+self.map.MapName+": "+ $("#ncvarSelect"+self.map.MapName).val());
            //Get options for Timepositions select-control
            self.loadTimepositions();
            console.log("loadTimepositions");
            ipfdv.showLayerOnMap(self.map,true);
        },
        error: function() {
            //reset controls if there is a problem with the wms request
            alert("Problem with WMS request! map: "+map.MapName);
            self.resetControls();
        }
        });
    }
    else {
        self.resetControls();
    }
}

/** @function
 * Clear the select controls
 * @name resetControls
  */
MapController.prototype.resetControls = function() {
    var self = this;
	  self.map.Capabilities = "";
	  self.loadVariables();
	  self.loadTimepositions();
}

/** @function
 * Set netcdf variables select control options
 * @name loadVariables */
MapController.prototype.loadVariables = function() {
    var self=this;
    console.log("actually in loadVariables");

    self.varselector.empty();
    //read layer information
    if(self.map.Capabilities.Capability && self.map.Capabilities.Capability.Layer.Layer[0].Layer) {
        console.log("in here :)");
        for (var l in self.map.Capabilities.Capability.Layer.Layer[0].Layer) {
            var o = new Option(self.map.Capabilities.Capability.Layer.Layer[0].Layer[l].Title, l);
            $(o).html(self.map.Capabilities.Capability.Layer.Layer[0].Layer[l].Title);
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
    if(self.map.Capabilities.Capability && self.map.Capabilities.Capability.Layer.Layer[0].Layer) {
        var layer = self.map.Capabilities.Capability.Layer.Layer[0].Layer[ncvar];
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
        self.timecontrol.trigger("change");
    }
    if (self.timecontrol[0] && self.timecontrol[0].length>1) {
        self.timecontrol.removeAttr("disabled");
        self.map.TempLinkEvent();
    }
    else {
        self.timecontrol.attr('disabled', true);
    }
}
