// $(function()
// {
// 	$.ajax({
// 		//url:"gpx/activity.gpx",
// 		url:"gpx/new.gpx",
// 		complete:parseGPX
// 	})
// });

var constants = {
	
	//render_technique:circleInfographic,
	//render_technique:basicPlot,
	//render_technique:extrudedPlot,
	//render_technique:renderedPlot,
	//render_technique:mountainPlot,
	render_technique:waveyPlot,
	
	max_heart_rate:190,
	conversion_step:2000, //amount of tracks processed in one instance. lower = better results.
	drawing_step:25,
	clarity:1, //larger the number, more approximated the map is. Also better preformance.
	map_padding:225
}

function parseGPX(e)
{
	var xml = parseXml(e.responseText);
	var tracks = xml.getElementsByTagName('trkpt');
	convertData(tracks,function(range,tracks_ar)
	{
		plotPoints(tracks_ar,range);
	});
}

function convertData(tracks,cB)
{
	var lonRange = [parseFloat(tracks[1].attributes.getNamedItem("lon").nodeValue) , parseFloat(tracks[1].attributes.getNamedItem("lon").nodeValue)];
	var latRange = [parseFloat(tracks[1].attributes.getNamedItem("lat").nodeValue) , parseFloat(tracks[1].attributes.getNamedItem("lat").nodeValue)];
	var eleRange = [parseFloat(tracks[1].childNodes[1].textContent),parseFloat(tracks[1].childNodes[1].textContent)];
	var totalLength = Math.ceil(tracks.length);
	var offset = 0;
	
	var dist;
	var tracks_ar = Array();
	analyze();
	function analyze()
	{
		$(".status-text").html("Analyzing range: "+offset+" of "+totalLength/constants.clarity);
		dist = offset + constants.conversion_step;
		if(dist > totalLength) dist = totalLength;
		var lon;
		var lat;
		for(i=offset; i<dist; i+=constants.clarity)
		{
			var tmp = new Object();
			tmp.lon = parseFloat(tracks[i].attributes.getNamedItem("lon").nodeValue);
			tmp.lat = parseFloat(tracks[i].attributes.getNamedItem("lat").nodeValue);
			tmp.ele = tracks[i].childNodes[1].textContent;
			if(tracks[i].childNodes[5].childNodes[1].childNodes[3]) //Add Heart Rate!
			{
				tmp.hr = parseFloat( tracks[i].childNodes[5].childNodes[1].childNodes[3].textContent );
			}
			else{
				tmp.hr = 0;
			}
			if(tracks[i].childNodes[5].childNodes[1].childNodes[5]) //Add Cadance!
			{
				//tmp.cad = parseFloat( tracks[i].childNodes[5].childNodes[1].childNodes[5].textContent );
				tmp.cad = parseFloat(tracks[i].childNodes[5].childNodes[1].childNodes[5].textContent);
			}
			else{
				tmp.cad = 0;
			}
			
			tracks_ar.push(tmp);
			// Is this a new min or max longitude?
			if( tmp.lon < lonRange[0]  )
			{
				lonRange[0] = tmp.lon;
			}
			else if(tmp.lon > lonRange[1])
			{
				lonRange[1] = tmp.lon;
			}
			// Is this a new min or max latitude?
			if( tmp.lat < latRange[0]  )
			{
				latRange[0] = tmp.lat;
			}
			else if(tmp.lat > latRange[1])
			{
				latRange[1] = tmp.lat;
			}
			// Is this a new min or max elevation?
			if(tmp.ele < eleRange[0])
			{
				eleRange[0] = parseFloat(tmp.ele);
			}
			else if(tmp.ele > eleRange[1])
			{
				eleRange[1] = parseFloat(tmp.ele);
			}
		}
		offset += constants.conversion_step;
		if(offset < totalLength) setTimeout(analyze,40);
		else{

			var center = {
				"centerLat" : latRange[1] - (latRange[0]/2),
				"centerLong" : lonRange[1] - (lonRange[0]/2)
			}

			$(".status-text").html("<strong>lowest points:</strong>"+lonRange[0]+","+latRange[0]+" <br><strong>highest points:</strong>"+lonRange[1]+","+latRange[1]+"<br> length: "+tracks_ar.length);
			tracks_ar.sort(sortByLat);
			cB({"lonRange":lonRange, "latRange":latRange, "eleRange":eleRange, "center":center},tracks_ar);
		}
	}
}

function sortByLon(a,b) {
  return parseInt(a.lon) - parseInt(b.lon);
}
function sortByLat(a,b) {
  return parseFloat(a.lat) - parseFloat(b.lat);
}
function plotPoints(tracks, range)
{
	var plotter = new CanvasPlotter('main-canvas');
	var bounds = plotter.getBounds();
	//tracks.sort(sortByLat);
	constants.render_technique(plotter, bounds, range, tracks)
}


function simplifyArray(ar,newLength)
{
	var len = ar.length;
	var tmp = new Array();
	for(var i = 1; i<=newLength;i++)
	{
		var s = Math.floor(  (len/newLength-1) * i  );
		tmp.push(  ar[s] );
	}
	return tmp;
}





var parseXml;

if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}