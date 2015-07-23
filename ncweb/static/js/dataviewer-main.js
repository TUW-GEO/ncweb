/** @global 
 * Server URL */
var SERVERURL = "http://localhost:8080/thredds/catalog/testAll/catalog.html";

/** @global 
 * Global DataViewer Object */
var IPFDV = null;

$(document).ready(function(){
	IPFDV = new IPFDataViewer(SERVERURL);
	window.onresize = function(){
		IPFDV.ncwebResize();
	}
});