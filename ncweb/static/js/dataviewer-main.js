/** @global 
 * Server URL */
var SERVERURL;
var IPFDV = null;
$(document).ready(function(){
	$.ajax({
		type: "GET",
		url: '/GetConfigParam?url_type=catalog',
		dataType: "json",
		success: function(json) {

			SERVERURL = json.url;
			console.log("SERVERURL = "+SERVERURL);


			IPFDV = new IPFDataViewer(SERVERURL);
			window.onresize = function(){
				IPFDV.ncwebResize();
			}


		}
	});
});





//var SERVERURL = "http://localhost:8080/thredds/catalog/testAll/catalog.html";
//
///** @global
// * Global DataViewer Object */
//var IPFDV = null;
//
//$(document).ready(function(){
//	IPFDV = new IPFDataViewer(SERVERURL);
//	window.onresize = function(){
//		IPFDV.ncwebResize();
//	}
//});