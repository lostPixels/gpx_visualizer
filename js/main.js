$(function()
{
	$.ajax({
		url:"gpx/activity_2.gpx",
		complete:parseGPX
	})
		
});

var constants = {
	
	render_technique:circleInfographic,
	//render_technique:basicPlot,
	render_technique:extrudedPlot,
	
	
	max_heart_rate:190,
	conversion_step:2000, //amount of tacks processed in one instance. lower = better results.
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
			$(".status-text").html("<strong>lowest points:</strong>"+lonRange[0]+","+latRange[0]+" <br><strong>highest points:</strong>"+lonRange[1]+","+latRange[1]+"<br> length: "+tracks_ar.length);
			console.log( tracks_ar[500], tracks[500] )
			cB({"lonRange":lonRange, "latRange":latRange, "eleRange":eleRange},tracks_ar);
		}
	}
}

function plotPoints(tracks, range)
{
	var plotter = new CanvasPlotter('main-canvas');
	var bounds = plotter.getBounds();
	constants.render_technique(plotter, bounds, range, tracks)
}
function CanvasPlotter(canvas){
	this.canvas = document.getElementById(canvas);
	if(this.canvas.getContext)
	{
		this.ctx = this.canvas.getContext("2d");
	}
}
CanvasPlotter.prototype.drawPoint = function(x,y,s,c)
{
	this.ctx.fillStyle = c;
    this.ctx.fillRect (x, y, s, s);
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawCirc = function(x,y,radius,s,c,stroke)
{
	this.ctx.fillStyle = c;
	this.ctx.beginPath();
   	this.ctx.arc(x, y, radius, 0, 360);
   	this.ctx.lineWidth = s;
    this.ctx.fill();
    if(stroke)
    {
    	this.ctx.strokeStyle=stroke;
    	this.ctx.stroke();
    }
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawLine = function(oX,oY,tX,tY,s,c)
{
	this.ctx.beginPath();
	this.ctx.moveTo(oX, oY);
    this.ctx.lineTo(tX, tY);
    this.ctx.lineWidth = s;
    this.ctx.strokeStyle=c
    this.ctx.stroke()
    this.ctx.closePath();
}
CanvasPlotter.prototype.getBounds = function()
{
	return {   "sW":$(this.canvas).width()-constants.map_padding,   "sH":$(this.canvas).height()-constants.map_padding    }
}

//////////////////////////////////////////// Plotting functions ////////////////////////////////////////////


function basicPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();
	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;
			
			var color = 0;
			var c = "rgba("+(255*hr_a)+","+color+","+color+",1)"
			
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep++ : colorStep--;
			
			if(first){
				first = false;
			} 
			plotter.drawPoint(x,y,6*z,c);
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}

function extrudedPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();
	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = scale_offset+ (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = scale_offset+ (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;
						
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep+=1 : colorStep-=1;
			
			var r = 255
			var g = Math.ceil(10 + (215*z));
			var b = Math.ceil(10 + (100*z));
			var c = "rgba("+r+","+g+","+b+",.2)";
			var eC = "rgba("+r+","+g+","+b+",.1)";

			if(first){
				//console.log( eC );
				first = false;
			}
			 
			plotter.drawPoint(x,y,1,c);
			plotter.drawPoint(x,y - (170*z),3*hr_a,c);
			plotter.drawLine(  x,  y, x,  y - (170*z),  1,eC)
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}





function circleInfographic(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	var colorStep = 0;
	var cD = true;
	
	var radius = bounds.sW/3;
	var c_step = 0;
	var pi = Math.PI;
	var oS = radius + scale_offset;
	
	drawBackground();
	setTimeout(drawElevationCircle,1000);
	setTimeout(drawHRCircle,10);
	setTimeout(drawCadCircle,50);
	
	function drawBackground()
	{
		plotter.drawCirc(oS,oS,radius+110,1,'#111','#444');
		plotter.drawCirc(oS,oS,radius-10,1,"black",'#444');
		plotter.drawCirc(oS,oS,radius-62,1,"black",'#FF0000');
		plotter.drawCirc(oS,oS,radius-152,1,"black",'#ff9600');
		drawOuterBGLines();
		drawOuterBGCircles();	
	}
	
	
	//Draw lines radiating outward from circle.
	function drawOuterBGLines()
	{
		var rl_step = 0;
		var radLines = setInterval(function()
		{
			var oX = oS+ ((radius-10)*Math.cos(rl_step*pi/180));
			var oY = oS+ ((radius-10)*Math.sin(rl_step*pi/180));
			var modRad = radius+110;
			var tX = oS+ (modRad*Math.cos(rl_step*pi/180));
			var tY = oS+ (modRad*Math.sin(rl_step*pi/180));
			plotter.drawLine(oX,oY,tX,tY,1,"#222");
			rl_step++
			if(rl_step > 360) clearInterval(radLines);
		},5)	
	}
	
	//Draw circles radiating outward, completing grid.
	function drawOuterBGCircles()
	{
		var rc_step = 0;
		var radCircles = setInterval(function()
		{
			var lX = (120/20)*rc_step
			plotter.drawCirc(oS,oS,radius-10+(lX),1,"none",'#222');
			rc_step++;
			if(rc_step  > 20) clearInterval(radCircles);
		},30)	
	}
		
	
	function drawElevationCircle()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var ele = tracks[i].ele
			
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var modRad = radius + (100*z)
			var x = oS+ (modRad*Math.cos(c_step*pi/180));
			var y = oS+ (modRad*Math.sin(c_step*pi/180));
			
			var r = 0;
			var g = Math.ceil(40 + (215*z));
			var b = Math.ceil(200 + (55*z));
			var c = "rgba("+r+","+g+","+b+",1)";
			
			plotter.drawPoint(x,y,3*z,c);
			c_step+=  360/totalLength;
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(drawElevationCircle,10);
	}
	function drawHRCircle()
	{
		var len = 200;
		for(i=0; i<len; i++)
		{
			var fR = i * (360/len)
			var z = (tracks[i].hr - 60) / (190-60);
			var modRad = radius-60;
			var adjRad = modRad + (40*z);
			var oX = oS+ (modRad*Math.cos(fR*pi/180));
			var oY = oS+ (modRad*Math.sin(fR*pi/180));
			var tX = oS+ (adjRad*Math.cos(fR*pi/180));
			var tY = oS+ (adjRad*Math.sin(fR*pi/180));
			
			var r = Math.ceil(100 + (155*z));
			var g = 0
			var b = 0
			var c = "rgba("+r+","+g+","+b+",1)";
			plotter.drawLine(oX,oY,tX,tY,3,c);
		}
		
	}
	function drawCadCircle()
	{
		var len = 1080;
		for(i=0; i<len; i++)
		{
			var fR = i * (360/len)
			var z = (tracks[i].cad) / (120);
			var modRad = radius-150;
			var adjRad = modRad + (90*z);
			var oX = oS+ (modRad*Math.cos(fR*pi/180));
			var oY = oS+ (modRad*Math.sin(fR*pi/180));
			var tX = oS+ (adjRad*Math.cos(fR*pi/180));
			var tY = oS+ (adjRad*Math.sin(fR*pi/180));
			
			var r = Math.ceil(230 + (25*z));
			var g = 150
			var b = 0
			var c = "rgba("+r+","+g+","+b+",1)";
			plotter.drawLine(oX,oY,tX,tY,1,c);
		}
	}
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