/** @global 
 * Server URL */
var SERVERURL = "http://127.0.0.1:8001/";

/** @global 
 * Global DataViewer Object */
var IPFDV = null;

$(document).ready(function(){
	IPFDV = new IPFDataViewer(SERVERURL);
	window.onresize = IPFDV.ncwebResize;
});