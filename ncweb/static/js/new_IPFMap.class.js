console.log("new_IPFMap");

//menu={A:'in',B:'in'};
//side={A:'left',B:'right'}
//
//var myControl = new ol.control.Control({element: $('#colorbarA-max-div')});
//var myControl = new ol.control.Control({element: $('#colorbarB-max-div')});
//var myControl = new ol.control.Control({element: $('#colorbarA-div')});
//var myControl = new ol.control.Control({element: $('#colorbarB-div')});
//var myControl = new ol.control.Control({element: $('#globeA-div')});
//var myControl = new ol.control.Control({element: $('#globeB-div')});
//var myControl = new ol.control.Control({element: $('#colorbarA-max-div')});
//var myControl = new ol.control.Control({element: $('#colorbarB-max-div')});
//
//var map;
//
//var layers = [
//  new ol.layer.Tile({
//    source: new ol.source.MapQuest({layer: 'sat'})
//  }),
//  new ol.layer.Tile({
//    source: new ol.source.TileWMS({
//      url: 'http://localhost:8080/thredds/wms/testAll/ESACCI-L3S_SOILMOISTURE-SSMV-COMBINED-1978-2013-fv01.2_3.nc?LAYERS=sm&STYLES=boxfill/rainbow&TIME=2013-12-24T00:00:00.000Z&COLORSCALERANGE=0.0099,0.9999',
//      serverType: 'wms'
//    })
//  })
//];
//$(document).ready(function(){
//
//    map = new ol.Map({
//      layers: layers,
//      target: 'map',
//      view: new ol.View({
//        projection: 'EPSG:3857',
//        center: [0, 0],
//        zoom: 3
//      })
//    });
//
//});


function toggleCtrl(mapID) {

    console.log(mapID+" "+menu[mapID]+" side: "+side[mapID]);


    if(menu[mapID]==='in'){
        $('#menu-vis'+mapID).css('margin-'+side[mapID], '207px');
        menu[mapID]='out';
        console.log(menu[mapID]);
    }
    else {
        $('#menu-vis'+mapID).css('margin-'+side[mapID], '0px');
        menu[mapID]='in';
        console.log(menu[mapID]);
    }

	$('#map-settings'+mapID).toggle();


}